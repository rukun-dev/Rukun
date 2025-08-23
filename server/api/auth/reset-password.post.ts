// server/api/auth/reset-password.post.ts
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Zod schema
const resetSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long")
    .toLowerCase()
    .transform((v) => v.trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .refine((pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd), {
      message: "Password must contain uppercase, lowercase, and numbers",
      path: ["password"],
    }),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Parse & validate body
    const body = await readBody(event);
    const { token, email, password } = resetSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        password: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return responses.unauthorized("Invalid reset request", {
        code: "INVALID_RESET_TOKEN",
        requestId,
        event,
        hint: "Please ensure your email is correct and your account is active",
      });
    }

    // Fetch token setting
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `reset_token_${user.id}` },
      select: { value: true },
    });

    if (!setting) {
      return responses.unauthorized("Invalid or expired reset token", {
        code: "TOKEN_NOT_FOUND",
        requestId,
        event,
        hint: "Please request a new password reset link",
      });
    }

    // Parse token payload
    let tokenData: { token: string; expiresAt: number; attempts?: number };
    try {
      tokenData = JSON.parse(setting.value);
    } catch (parseError) {
      // Clean up corrupted token
      await prisma.systemSetting
        .delete({
          where: { key: `reset_token_${user.id}` },
        })
        .catch(() => {});

      return responses.unauthorized("Invalid reset token format", {
        code: "MALFORMED_TOKEN",
        requestId,
        event,
        hint: "Please request a new password reset link",
      });
    }

    // Validate token expiry first (before counting attempts)
    if (tokenData.expiresAt < Date.now()) {
      await prisma.systemSetting
        .delete({
          where: { key: `reset_token_${user.id}` },
        })
        .catch(() => {});

      return responses.unauthorized(
        "Reset token has expired. Please request a new password reset.",
        {
          code: "TOKEN_EXPIRED",
          requestId,
          event,
          expired_at: new Date(tokenData.expiresAt).toISOString(),
          hint: "Tokens expire after 1 hour for security reasons",
        },
      );
    }

    // Validate token match
    if (tokenData.token !== token) {
      const attempts = (tokenData.attempts || 0) + 1;

      if (attempts >= 5) {
        await prisma.systemSetting
          .delete({
            where: { key: `reset_token_${user.id}` },
          })
          .catch(() => {});

        // Log security event
        await prisma.activityLog
          .create({
            data: {
              userId: user.id,
              action: "PASSWORD_RESET_MAX_ATTEMPTS",
              description:
                "Password reset blocked due to too many invalid attempts",
              ipAddress: getClientIP(event),
              userAgent: getHeader(event, "user-agent"),
            },
          })
          .catch(() => {});

        return responses.unauthorized(
          "Too many invalid attempts. Please request a new password reset.",
          {
            code: "MAX_ATTEMPTS_EXCEEDED",
            requestId,
            event,
            attempts_made: attempts,
            hint: "For security, tokens are invalidated after 5 failed attempts",
          },
        );
      }

      // Update attempt counter
      await prisma.systemSetting
        .update({
          where: { key: `reset_token_${user.id}` },
          data: {
            value: JSON.stringify({
              ...tokenData,
              attempts,
            }),
          },
        })
        .catch(() => {});

      return responses.unauthorized("Invalid reset token", {
        code: "INVALID_TOKEN",
        requestId,
        event,
        attempts_remaining: 5 - attempts,
        hint: "Please check your reset link carefully",
      });
    }

    // Ensure new password differs from current
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return responses.validation(
        "New password must be different from your current password",
        "password",
        {
          hint: "Choose a password that you haven't used recently",
          password_requirements: [
            "At least 8 characters long",
            "Contains uppercase letters",
            "Contains lowercase letters",
            "Contains numbers",
            "Different from your current password",
          ],
        },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");
    const hashedPassword = await bcrypt.hash(password, 12);

    // Atomically: update password, delete token, invalidate sessions, log activity
    const result = await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Delete the used reset token
      await tx.systemSetting.delete({
        where: { key: `reset_token_${user.id}` },
      });

      // Clean up any other reset tokens for this user (just in case)
      await tx.systemSetting.deleteMany({
        where: {
          key: {
            startsWith: `reset_token_${user.id}_`,
          },
        },
      });

      // Count and invalidate all user sessions
      const sessionCount = await tx.session.count({
        where: { userId: user.id },
      });

      const deletedSessions = await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // Log successful password reset
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET_COMPLETED",
          description: `Password reset completed successfully. ${deletedSessions.count} sessions invalidated.`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return {
        sessionsInvalidated: deletedSessions.count,
        totalSessions: sessionCount,
      };
    });

    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.ok(
      {
        password_reset: true,
        user: {
          id: user.id,
          name: user.name,
          email: email,
        },
        security_actions: {
          sessions_invalidated: result.sessionsInvalidated,
          total_sessions_before: result.totalSessions,
          token_deleted: true,
          cleanup_performed: true,
        },
        recommendations: [
          "Your password has been successfully reset",
          "All existing sessions have been invalidated for security",
          "Please log in with your new password",
          "Consider enabling additional security features",
        ],
      },
      "Password has been reset successfully",
      {
        requestId,
        event,
        executionTime,
        nextStep: {
          action: "login_with_new_password",
          endpoint: "/api/auth/login",
          method: "POST",
          required: ["email", "password"],
          note: "Use your new password to log in",
        },
        links: {
          self: "/api/auth/reset-password",
          related: {
            login: "/api/auth/login",
            forgot_password: "/api/auth/forgot-password",
          },
        },
      },
    );
  } catch (error: unknown) {
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
          password_requirements: [
            "At least 8 characters long",
            "Contains uppercase letters",
            "Contains lowercase letters",
            "Contains numbers",
          ],
        },
        { requestId, event },
      );
    }

    // Handle bcrypt errors
    if (error instanceof Error && error.message.includes("bcrypt")) {
      return responses.serverError(
        "Password processing failed",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        {
          requestId,
          event,
          code: "PASSWORD_HASH_ERROR",
          hint: "Please try again or contact support",
        },
      );
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      switch (prismaError.code) {
        case "P2025":
          return responses.notFound("User or token not found", {
            requestId,
            event,
            code: "RECORD_NOT_FOUND",
          });
        case "P2002":
          return responses.validation(
            "Database constraint violation",
            undefined,
            { hint: "Please try again with different data" },
            { requestId, event },
          );
        default:
          break;
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Password reset failed due to server error",
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
