// server/api/users/[id].put.ts
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { updateUserSchema, userIdParamSchema } from "~~/server/validators/user";
import { logUserUpdate } from "~~/server/utils/activity-log";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Validate route parameter
    const { id } = userIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = updateUserSchema.parse(body);

    // Check if target user exists and get current data
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        password: true,
        isActive: true,
        name: true,
      },
    });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - users can update their own basic info or if they have permission
    const canUpdate =
      currentUser.id === id ||
      canManageUser(currentUser.role as any, targetUser.role as any);

    if (!canUpdate) {
      return responses.forbidden(
        "You don't have permission to update this user",
        { requestId, event },
      );
    }

    // Additional role-based checks
    if (validatedData.role && currentUser.id !== id) {
      // Only users with management permissions can change roles
      if (!["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role)) {
        return responses.forbidden(
          "You don't have permission to change user roles",
          { requestId, event },
        );
      }

      // Check if current user can assign the target role
      if (!canManageUser(currentUser.role as any, validatedData.role as any)) {
        return responses.forbidden(
          `You don't have permission to assign role: ${validatedData.role}`,
          { requestId, event },
        );
      }
    }

    // Prevent users from changing their own role or active status (except SUPER_ADMIN)
    if (currentUser.id === id && currentUser.role !== "SUPER_ADMIN") {
      if (validatedData.role && validatedData.role !== targetUser.role) {
        return responses.forbidden("You cannot change your own role", {
          requestId,
          event,
        });
      }
      if (
        typeof validatedData.isActive === "boolean" &&
        validatedData.isActive !== targetUser.isActive
      ) {
        return responses.forbidden(
          "You cannot change your own account status",
          { requestId, event },
        );
      }
    }

    // Check email uniqueness if provided and changed
    if (validatedData.email && validatedData.email !== targetUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
        select: { id: true },
      });
      if (existingUser) {
        return responses.conflict("Email already registered", {
          requestId,
          event,
        });
      }
    }

    // Check phone uniqueness if provided and changed
    if (validatedData.phone && validatedData.phone !== targetUser.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: validatedData.phone, NOT: { id } },
        select: { id: true },
      });
      if (existingPhone) {
        return responses.conflict("Phone number already registered", {
          requestId,
          event,
        });
      }
    }

    // Handle password update
    let hashedPassword: string | undefined;
    if (validatedData.password) {
      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(
        validatedData.password,
        targetUser.password,
      );
      if (isSamePassword) {
        return responses.validation(
          "New password must be different from current password",
          "password",
          {},
          { requestId, event },
        );
      }
      hashedPassword = await bcrypt.hash(validatedData.password, 12);
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Build update data object
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.email !== undefined)
      updateData.email = validatedData.email;
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone;
    if (validatedData.role !== undefined) updateData.role = validatedData.role;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;
    if (hashedPassword) updateData.password = hashedPassword;

    // Track changes for activity log
    const changes: string[] = [];
    if (validatedData.name && validatedData.name !== targetUser.name)
      changes.push(`name: ${targetUser.name} → ${validatedData.name}`);
    if (validatedData.email && validatedData.email !== targetUser.email)
      changes.push(`email: ${targetUser.email} → ${validatedData.email}`);
    if (validatedData.phone && validatedData.phone !== targetUser.phone)
      changes.push(
        `phone: ${targetUser.phone || "null"} → ${validatedData.phone}`,
      );
    if (validatedData.role && validatedData.role !== targetUser.role)
      changes.push(`role: ${targetUser.role} → ${validatedData.role}`);
    if (
      typeof validatedData.isActive === "boolean" &&
      validatedData.isActive !== targetUser.isActive
    )
      changes.push(
        `status: ${targetUser.isActive ? "active" : "inactive"} → ${validatedData.isActive ? "active" : "inactive"}`,
      );
    if (hashedPassword) changes.push("password updated");

    // Perform update in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          avatar: true,
          avatarPublicId: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              nik: true,
              address: true,
              birthDate: true,
              birthPlace: true,
              job: true,
              education: true,
              maritalStatus: true,
            },
          },
        },
      });

      // Log user update activity
      await logUserUpdate({
        currentUserId: currentUser.id,
        targetUserId: user.id,
        targetUserName: user.name,
        targetUserEmail: user.email,
        changes,
        event,
        transaction: tx,
        isSelfUpdate: currentUser.id === id,
      });

      // If password was changed, invalidate other sessions (except current if it's the same user)
      if (hashedPassword) {
        if (currentUser.id === id) {
          // Keep current session but invalidate others
          const currentToken = getCookie(event, "auth-token");
          if (currentToken) {
            await tx.session.deleteMany({
              where: {
                userId: id,
                token: { not: currentToken },
              },
            });
          }
        } else {
          // Invalidate all sessions for the user
          await tx.session.deleteMany({
            where: { userId: id },
          });
        }
      }

      return user;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Build response
    return responses.ok(
      {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          is_active: updatedUser.isActive,
          avatar: updatedUser.avatar,
          avatar_public_id: updatedUser.avatarPublicId,
          created_at: updatedUser.createdAt.toISOString(),
          updated_at: updatedUser.updatedAt.toISOString(),
          profile: updatedUser.profile
            ? {
                id: updatedUser.profile.id,
                nik: updatedUser.profile.nik,
                address: updatedUser.profile.address,
                birth_date: updatedUser.profile.birthDate?.toISOString(),
                birth_place: updatedUser.profile.birthPlace,
                job: updatedUser.profile.job,
                education: updatedUser.profile.education,
                marital_status: updatedUser.profile.maritalStatus,
              }
            : null,
        },
        changes_made: changes,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        ...(hashedPassword
          ? {
              security_note:
                currentUser.id === id
                  ? "Password updated. Other sessions have been invalidated."
                  : "Password updated. All user sessions have been invalidated.",
            }
          : {}),
      },
      "User updated successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/users/${id}`,
          related: {
            user_detail: `/api/users/${id}`,
            user_profile: `/api/users/profile/${id}`,
            upload_avatar: `/api/users/avatar/${id}`,
            all_users: "/api/users",
            ...(currentUser.id === id
              ? {
                  change_password: "/api/auth/change-password",
                  my_profile: "/api/auth/me",
                }
              : {}),
          },
        },
      },
    );
  } catch (error: unknown) {
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
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    // Handle authentication/authorization errors
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

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("User not found", { requestId, event });
      }
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target?.[0];
        const field =
          target === "email" ? "email" : target === "phone" ? "phone" : "field";
        return responses.conflict(
          `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
          { requestId, event },
        );
      }
    }

    // Handle bcrypt errors
    if (error instanceof Error && error.message.includes("bcrypt")) {
      return responses.serverError(
        "Password hashing failed",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        { requestId, event },
      );
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "User update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "USER_UPDATE_ERROR" },
    );
  }
});
