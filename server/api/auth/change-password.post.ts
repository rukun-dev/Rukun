// server/api/auth/change-password.post.ts
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Change password validation schema
const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(72, "New password is too long")
      .refine((p) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p), {
        message: "New password must contain uppercase, lowercase, and numbers",
      }),
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  });

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication required
    const currentUser = await requireAuth(event);

    // Parse and validate request body
    const body = await readBody(event);
    const validatedData = changePasswordSchema.parse(body);

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return responses.unauthorized("User account not found or inactive", {
        requestId,
        event,
        code: "USER_NOT_FOUND",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.current_password,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return responses.validation(
        "Current password is incorrect",
        "current_password",
        {
          hint: "Please enter your current password correctly",
          security_note:
            "For your security, we don't provide specific details about password verification",
        },
        { requestId, event },
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(validatedData.new_password, 12);

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");
    const currentToken = getCookie(event, "auth-token");

    // Update password and invalidate other sessions in transaction
    const updateResult = await prisma.$transaction(async (tx) => {
      // Update user password
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
        select: {
          id: true,
          name: true,
          email: true,
          updatedAt: true,
        },
      });

      // Count sessions before invalidation
      const sessionCount = await tx.session.count({
        where: { userId: user.id },
      });

      // Invalidate all other sessions except current one
      const deletedSessions = await tx.session.deleteMany({
        where: {
          userId: user.id,
          ...(currentToken ? { token: { not: currentToken } } : {}),
        },
      });

      // Clean up any existing password reset tokens for this user
      await tx.systemSetting.deleteMany({
        where: {
          key: {
            startsWith: `reset_token_${user.id}`,
          },
        },
      });

      // Log password change activity
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_CHANGED",
          description: `Password changed successfully. ${deletedSessions.count} other sessions invalidated.`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return {
        user: updatedUser,
        sessionsInvalidated: deletedSessions.count,
        totalSessionsBefore: sessionCount,
      };
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        password_changed: true,
        user: {
          id: updateResult.user.id,
          name: updateResult.user.name,
          email: updateResult.user.email,
          updated_at: updateResult.user.updatedAt.toISOString(),
        },
        security_actions: {
          sessions_invalidated: updateResult.sessionsInvalidated,
          total_sessions_before: updateResult.totalSessionsBefore,
          current_session_kept: !!currentToken,
          reset_tokens_cleared: true,
        },
        recommendations: [
          "Make sure to save your new password in a secure location",
          "Consider enabling two-factor authentication for enhanced security",
          "Regularly update your password for better account security",
        ],
      },
      "Password changed successfully",
      {
        requestId,
        event,
        executionTime,
        nextStep: {
          action: "verify_login",
          description: "You may need to log in again on other devices",
          affected_devices: updateResult.sessionsInvalidated,
        },
        links: {
          self: "/api/auth/change-password",
          related: {
            my_profile: "/api/auth/me",
            logout: "/api/auth/logout",
            login: "/api/auth/login",
            profile_settings: `/api/users/profile/${currentUser.id}`,
          },
        },
      },
    );
  } catch (error: unknown) {
    // Handle authentication errors first (they have statusCode property)
    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, {
          requestId,
          event,
          code: "UNAUTHORIZED",
        });
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, {
          requestId,
          event,
          code: "FORBIDDEN",
        });
      }
      throw error;
    }

    // Handle Zod validation errors
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
            "Different from current password",
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
        { requestId, event, code: "PASSWORD_HASH_ERROR" },
      );
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("User not found", { requestId, event });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Password change failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "PASSWORD_CHANGE_ERROR" },
    );
  }
});
