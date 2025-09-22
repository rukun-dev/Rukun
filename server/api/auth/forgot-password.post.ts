// server/api/auth/forgot-password.post.ts
import crypto from "crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Zod validation schema
const forgotSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long")
    .toLowerCase()
    .transform((v) => v.trim()),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Parse & validate body
    const body = await readBody(event);
    const { email } = forgotSchema.parse(body);

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Check for rate limiting - prevent too many requests from same IP
    const rateLimitKey = `forgot_password_rate_${clientIP}`;
    const existingRateLimit = await prisma.systemSetting.findUnique({
      where: { key: rateLimitKey },
    });

    if (existingRateLimit) {
      const rateLimitData = JSON.parse(existingRateLimit.value);
      const now = Date.now();
      const windowStart = now - 15 * 60 * 1000; // 15 minutes window

      // Clean old attempts
      const recentAttempts = rateLimitData.attempts.filter(
        (timestamp: number) => timestamp > windowStart,
      );

      if (recentAttempts.length >= 5) {
        return responses.rateLimit(
          "Too many password reset attempts. Please try again later.",
          {
            requestId,
            event,
            code: "RATE_LIMIT_EXCEEDED",
            retry_after: "15 minutes",
            hint: "For security, password reset requests are limited",
          },
        );
      }

      // Update rate limit
      await prisma.systemSetting.update({
        where: { key: rateLimitKey },
        data: {
          value: JSON.stringify({
            attempts: [...recentAttempts, now],
            lastAttempt: now,
          }),
        },
      });
    } else {
      // Create new rate limit entry
      await prisma.systemSetting.create({
        data: {
          key: rateLimitKey,
          value: JSON.stringify({
            attempts: [Date.now()],
            lastAttempt: Date.now(),
          }),
          description: "Password reset rate limiting",
        },
      });
    }

    // Find user (without revealing result to client for security)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    // Always return success for security (prevent email enumeration)
    // But only send email if user is valid & active
    const shouldSendEmail = user && user.isActive;

    if (!shouldSendEmail) {
      // Log failed attempt for security monitoring
      if (user?.id) {
        await prisma.activityLog
          .create({
            data: {
              userId: user.id,
              action: "PASSWORD_RESET_REQUEST_FAILED",
              description: `Password reset attempted for ${user ? "inactive" : "non-existent"} user: ${email}`,
              ipAddress: clientIP,
              userAgent,
            },
          })
          .catch(() => {}); // Don't fail if logging fails
      }

      // Add artificial delay to match successful flow timing
      await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 500) + 500),
      );

      const executionTime = `${Date.now() - startedAt}ms`;
      return responses.ok(
        {
          email_sent: true,
          recipient: email,
          estimated_delivery: "5-10 minutes",
          security_note:
            "If this email is registered, instructions will be sent",
        },
        "If the email address is registered and active, password reset instructions have been sent",
        {
          requestId,
          event,
          executionTime,
          nextStep: {
            action: "check_email",
            endpoint: "/api/auth/reset-password",
            method: "POST",
            required: ["token", "email", "password"],
            note: "Check your email for reset instructions",
          },
          links: {
            self: "/api/auth/forgot-password",
            related: {
              reset_password: "/api/auth/reset-password",
              login: "/api/auth/login",
            },
          },
        },
      );
    }

    // Clean up any existing reset tokens for this user
    await prisma.systemSetting
      .deleteMany({
        where: {
          key: {
            startsWith: `reset_token_${user.id}`,
          },
        },
      })
      .catch(() => {}); // Don't fail if cleanup fails

    // Generate new reset token (1 hour expiry)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to systemSetting (optimized data structure)
    await prisma.systemSetting.create({
      data: {
        key: `reset_token_${user.id}`,
        value: JSON.stringify({
          token: resetToken,
          expiresAt: resetTokenExpiry.getTime(), // Use timestamp instead of ISO string
          attempts: 0,
        }),
        description: `Password reset token for user ${user.id}`,
      },
    });

    // Validate required environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      FROM_EMAIL,
      FRONTEND_URL,
    } = process.env;

    const missingEnvVars = [];
    if (!SMTP_HOST) missingEnvVars.push("SMTP_HOST");
    if (!SMTP_PORT) missingEnvVars.push("SMTP_PORT");
    if (!SMTP_USER) missingEnvVars.push("SMTP_USER");
    if (!SMTP_PASS) missingEnvVars.push("SMTP_PASS");
    if (!FRONTEND_URL) missingEnvVars.push("FRONTEND_URL");

    if (missingEnvVars.length > 0) {
      // Log server misconfiguration
      console.error(
        "Password reset email failed - missing environment variables:",
        missingEnvVars,
      );

      await prisma.activityLog
        .create({
          data: {
            userId: user.id,
            action: "PASSWORD_RESET_EMAIL_FAILED",
            description: `Email server not configured. Missing: ${missingEnvVars.join(", ")}`,
            ipAddress: clientIP,
            userAgent,
          },
        })
        .catch(() => {});

      // Still return "success" to client for security, but don't actually send email
      const executionTime = `${Date.now() - startedAt}ms`;
      return responses.ok(
        {
          email_sent: true,
          recipient: email,
          expires_in: "1 hour",
          estimated_delivery: "5-10 minutes",
          warning: "Email service may be temporarily unavailable",
        },
        "Password reset instructions have been sent to your email",
        {
          requestId,
          event,
          executionTime,
          nextStep: {
            action: "check_email",
            endpoint: "/api/auth/reset-password",
            method: "POST",
            required: ["token", "email", "password"],
          },
          links: {
            self: "/api/auth/forgot-password",
            related: {
              reset_password: "/api/auth/reset-password",
              login: "/api/auth/login",
            },
          },
        },
      );
    }

    try {
      // Setup email transporter
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST!,
        port: parseInt(SMTP_PORT!, 10),
        secure: SMTP_PORT === "465",
        auth: {
          user: SMTP_USER!,
          pass: SMTP_PASS!,
        },
        tls: {
          rejectUnauthorized: false, // For development
        },
      });

      // Verify transporter connection
      await transporter.verify();

      const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Send reset email
      const emailResult = await transporter.sendMail({
        from: FROM_EMAIL || "noreply@rt-app.com",
        to: user.email,
        subject: "Password Reset Request - RT Management System",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">RT Management System</h1>
          </div>

          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0 0 10px 0; font-size: 28px;">Password Reset Request</h2>
            <p style="margin: 0; opacity: 0.9;">We received a request to reset your password</p>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
            <p style="margin: 0 0 20px 0;">You requested a password reset for your RT Management System account.</p>
            <p style="margin: 0 0 30px 0;">Click the button below to reset your password:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 50px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                        transition: all 0.3s ease;">
                Reset My Password
              </a>
            </div>
          </div>

          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #856404;">🔒 Security Information</h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;">This link will expire in <strong>1 hour</strong></li>
              <li style="margin-bottom: 8px;">If you didn't request this reset, please ignore this email</li>
              <li style="margin-bottom: 8px;">Your password will not be changed until you create a new one</li>
              <li>For security, this token can only be used once</li>
            </ul>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px;">
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">
              <strong>Alternative method:</strong> If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 5px; margin: 0;">
              <a href="${resetUrl}" style="color: #2563eb;">${resetUrl}</a>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              This email was sent from RT Management System<br>
              If you need help, please contact your RT administrator
            </p>
          </div>
        </div>
        `,
        text: `
Password Reset Request - RT Management System

Hello ${user.name},

You requested a password reset for your RT Management System account.

To reset your password, please visit: ${resetUrl}

Important:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- Your password will not be changed until you create a new one

If you need help, please contact your RT administrator.
        `.trim(),
      });

      console.log("Password reset email sent successfully:", {
        messageId: emailResult.messageId,
        recipient: user.email,
        resetUrl: resetUrl, // Remove this in production
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);

      // Log email failure but still return success to client
      await prisma.activityLog
        .create({
          data: {
            userId: user.id,
            action: "PASSWORD_RESET_EMAIL_FAILED",
            description: `Failed to send password reset email: ${emailError instanceof Error ? emailError.message : "Unknown error"}`,
            ipAddress: clientIP,
            userAgent,
          },
        })
        .catch(() => {});

      // Token was already created, so user can still potentially use it
      // if they get the token through other means (like logs in development)
    }

    // Log successful password reset request
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        description: "Password reset email sent successfully",
        ipAddress: clientIP,
        userAgent,
      },
    });

    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.ok(
      {
        email_sent: true,
        recipient: email,
        expires_in: "1 hour",
        estimated_delivery: "5-10 minutes",
        security_info: {
          token_expires: resetTokenExpiry.toISOString(),
          max_attempts: 5,
        },
      },
      "Password reset instructions have been sent to your email",
      {
        requestId,
        event,
        executionTime,
        nextStep: {
          action: "check_email",
          endpoint: "/api/auth/reset-password",
          method: "POST",
          required: ["token", "email", "password"],
          note: "Check your email and follow the reset instructions",
        },
        links: {
          self: "/api/auth/forgot-password",
          related: {
            reset_password: "/api/auth/reset-password",
            login: "/api/auth/login",
          },
        },
      },
    );
  } catch (error: unknown) {
    // Clean up any tokens that might have been created
    if (error && typeof error === "object" && "userId" in error) {
      await prisma.systemSetting
        .deleteMany({
          where: {
            key: {
              startsWith: `reset_token_${(error as any).userId}`,
            },
          },
        })
        .catch(() => {});
    }

    // Zod validation error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path[0]?.toString();
              if (field) acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
          error_count: error.issues.length,
          hint: "Please provide a valid email address",
        },
        { requestId, event },
      );
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      switch (prismaError.code) {
        case "P2002":
          // Unique constraint violation (shouldn't happen in normal flow)
          console.error(
            "Unique constraint violation in forgot password:",
            prismaError,
          );
          break;
        case "P2025":
          // Record not found (handled in main flow)
          break;
        default:
          console.error("Prisma error in forgot password:", prismaError);
      }
    }

    // Log the error for debugging
    const clientIP = getClientIP(event);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Forgot password error:", {
      error: errorMessage,
      requestId,
      clientIP,
      timestamp: new Date().toISOString(),
    });

    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.serverError(
      "Unable to process password reset request at this time",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      {
        requestId,
        event,
        executionTime,
        code: "PASSWORD_RESET_ERROR",
        hint: "Please try again later or contact support if the problem persists",
      },
    );
  }
});
