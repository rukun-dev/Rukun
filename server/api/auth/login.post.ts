// server/api/auth/login.post.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Zod validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long")
    .toLowerCase()
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password is too long"), // bcrypt-safe bound
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Parse & validate body
    const body = await readBody(event);
    const { email, password } = loginSchema.parse(body);

    // Fetch user (minimal fields) by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, // string id
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        avatarPublicId: true,
        isActive: true,
        password: true,
        profile: {
          select: {
            id: true,
            nik: true,
            address: true,
          },
        },
      },
    });

    // Uniform invalid-credential response (don't leak which part failed)
    if (!user || !user.isActive) {
      return responses.unauthorized("Invalid credentials", {
        code: "INVALID_CREDENTIALS",
        requestId,
        event,
      });
    }

    // Verify password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return responses.unauthorized("Invalid credentials", {
        code: "INVALID_CREDENTIALS",
        requestId,
        event,
      });
    }

    // Generate JWT (7d)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // Explicit internal misconfig → serverError
      return responses.serverError(
        "Authentication misconfiguration",
        process.env.NODE_ENV === "development"
          ? "JWT_SECRET is not set"
          : undefined,
        { requestId, event },
      );
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      secret,
      { expiresIn: "7d" },
    );

    // Compute expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Create session + activity log atomically
    await prisma.$transaction(async (tx) => {
      await tx.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          description: "User logged in successfully",
          ipAddress: clientIP,
          userAgent,
        },
      });
    });

    // Set HTTP-only cookie
    setCookie(event, "auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Success
    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.ok(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          avatarPublicId: user.avatarPublicId,
          profile: user.profile,
          session: {
            expires_at: expiresAt.toISOString(),
          },
        },
      },
      "Login successful",
      {
        requestId,
        event,
        executionTime,
        nextStep: {
          action: "navigate_dashboard",
          endpoint: "/api/protected/dashboard",
          method: "GET",
          required: [],
        },
        links: {
          self: "/api/auth/login",
          related: {
            profile: "/api/user/profile",
            dashboard: "/api/protected/dashboard",
            logout: "/api/auth/logout",
          },
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const first = error.issues[0];
      return responses.validation(
        first?.message || "Validation failed",
        first?.path[0]?.toString(),
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
        },
        { requestId, event },
      );
    }

    // Handle bcrypt-specific errors
    if (error instanceof Error && error.message.includes("bcrypt")) {
      return responses.serverError(
        "Password verification failed",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        { requestId, event },
      );
    }

    // Handle JWT-specific errors
    if (error instanceof Error && /jwt/i.test(error.message)) {
      return responses.serverError(
        "Token generation failed",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        { requestId, event },
      );
    }

    // Generic server error
    const debug = error instanceof Error ? error.message : "Unknown error";
    return responses.serverError(
      "Login failed due to server error",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event },
    );
  }
});
