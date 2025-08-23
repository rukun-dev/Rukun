// server/api/users/index.post.ts
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";
import { createUserSchema } from "~~/server/validators/user";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Check permission
    if (!hasPermission(currentUser.role as any, "manage:users")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:users",
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = createUserSchema.parse(body);

    // Role-based authorization - check if current user can create user with the specified role
    if (!canManageUser(currentUser.role as any, validatedData.role as any)) {
      return responses.forbidden(
        `You don't have permission to create users with role: ${validatedData.role}`,
        { requestId, event },
      );
    }

    // Check for existing user and phone in parallel
    const [existingUser, existingPhone] = await Promise.all([
      prisma.user.findUnique({
        where: { email: validatedData.email },
        select: { id: true },
      }),
      validatedData.phone
        ? prisma.user.findFirst({
            where: { phone: validatedData.phone },
            select: { id: true },
          })
        : null,
    ]);

    // Handle conflicts
    if (existingUser) {
      return responses.conflict("Email already registered", {
        requestId,
        event,
      });
    }

    if (existingPhone) {
      return responses.conflict("Phone number already registered", {
        requestId,
        event,
      });
    }

    // Hash password and prepare user data
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Create user with profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user with profile
      const user = await tx.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
          phone: validatedData.phone,
          role: validatedData.role,
          isActive: validatedData.isActive ?? true,
          profile: {
            create: {},
          },
        },
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

      // Log creation activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_USER",
          description: `Created user: ${user.name} (${user.email}) with role: ${user.role}`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Log activity for the new user
      await tx.activityLog.create({
        data: {
          userId: user.id,
          action: "ACCOUNT_CREATED",
          description: `Account created by ${currentUser.name} (${currentUser.email})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return user;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Success response with comprehensive data
    return responses.created(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          is_active: newUser.isActive,
          avatar: newUser.avatar,
          avatar_public_id: newUser.avatarPublicId,
          created_at: newUser.createdAt.toISOString(),
          updated_at: newUser.updatedAt.toISOString(),
          profile: newUser.profile
            ? {
                id: newUser.profile.id,
                nik: newUser.profile.nik,
                address: newUser.profile.address,
                birth_date: newUser.profile.birthDate?.toISOString(),
                birth_place: newUser.profile.birthPlace,
                job: newUser.profile.job,
                education: newUser.profile.education,
                marital_status: newUser.profile.maritalStatus,
              }
            : null,
        },
        created_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "User created successfully",
      {
        requestId,
        event,
        executionTime,
        nextStep: {
          action: "setup_user_profile",
          endpoint: `/api/users/profile/${newUser.id}`,
          method: "PUT",
          optional: ["nik", "address", "birthDate", "job", "education"],
          description:
            "Complete user profile setup with additional information",
        },
        links: {
          self: "/api/users",
          related: {
            user_detail: `/api/users/${newUser.id}`,
            user_profile: `/api/users/profile/${newUser.id}`,
            upload_avatar: `/api/users/avatar/${newUser.id}`,
            all_users: "/api/users",
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
      "User creation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "USER_CREATE_ERROR" },
    );
  }
});
