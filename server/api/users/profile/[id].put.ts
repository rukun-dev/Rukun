// server/api/users/profile/[id].put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import {
  updateProfileSchema,
  userIdParamSchema,
} from "~~/server/validators/user";
import { logProfileUpdate } from "~~/server/utils/activity-log";

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
    const validatedData = updateProfileSchema.parse(body);

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        profile: {
          select: {
            id: true,
            nik: true,
            birthDate: true,
            birthPlace: true,
            address: true,
            job: true,
            education: true,
            maritalStatus: true,
          },
        },
      },
    });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - users can update their own profile or if they have permission
    const canUpdate =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      canManageUser(currentUser.role as any, targetUser.role as any) ||
      ["KETUA_RT", "SEKRETARIS"].includes(currentUser.role);

    if (!canUpdate) {
      return responses.forbidden(
        "You don't have permission to update this user's profile",
        { requestId, event },
      );
    }

    // Check NIK uniqueness if provided and changed
    if (validatedData.nik && validatedData.nik !== targetUser.profile?.nik) {
      const existingNik = await prisma.userProfile.findFirst({
        where: {
          nik: validatedData.nik,
          userId: { not: id },
        },
        select: { id: true },
      });

      if (existingNik) {
        return responses.conflict("NIK already registered", {
          requestId,
          event,
        });
      }
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Build update data object (only include fields that are provided)
    const updateData: any = {};
    if (validatedData.nik !== undefined) updateData.nik = validatedData.nik;
    if (validatedData.birthDate !== undefined)
      updateData.birthDate = validatedData.birthDate;
    if (validatedData.birthPlace !== undefined)
      updateData.birthPlace = validatedData.birthPlace;
    if (validatedData.address !== undefined)
      updateData.address = validatedData.address;
    if (validatedData.job !== undefined) updateData.job = validatedData.job;
    if (validatedData.education !== undefined)
      updateData.education = validatedData.education;
    if (validatedData.maritalStatus !== undefined)
      updateData.maritalStatus = validatedData.maritalStatus;

    // Track changes for activity log
    const changes: string[] = [];
    if (
      validatedData.nik !== undefined &&
      validatedData.nik !== targetUser.profile?.nik
    )
      changes.push(
        `NIK: ${targetUser.profile?.nik || "null"} → ${validatedData.nik || "null"}`,
      );
    if (
      validatedData.birthDate !== undefined &&
      validatedData.birthDate?.toISOString() !==
        targetUser.profile?.birthDate?.toISOString()
    )
      changes.push(
        `Birth Date: ${targetUser.profile?.birthDate?.toDateString() || "null"} → ${validatedData.birthDate?.toDateString() || "null"}`,
      );
    if (
      validatedData.birthPlace !== undefined &&
      validatedData.birthPlace !== targetUser.profile?.birthPlace
    )
      changes.push(
        `Birth Place: ${targetUser.profile?.birthPlace || "null"} → ${validatedData.birthPlace || "null"}`,
      );
    if (
      validatedData.address !== undefined &&
      validatedData.address !== targetUser.profile?.address
    )
      changes.push(
        `Address: ${targetUser.profile?.address || "null"} → ${validatedData.address || "null"}`,
      );
    if (
      validatedData.job !== undefined &&
      validatedData.job !== targetUser.profile?.job
    )
      changes.push(
        `Job: ${targetUser.profile?.job || "null"} → ${validatedData.job || "null"}`,
      );
    if (
      validatedData.education !== undefined &&
      validatedData.education !== targetUser.profile?.education
    )
      changes.push(
        `Education: ${targetUser.profile?.education || "null"} → ${validatedData.education || "null"}`,
      );
    if (
      validatedData.maritalStatus !== undefined &&
      validatedData.maritalStatus !== targetUser.profile?.maritalStatus
    )
      changes.push(
        `Marital Status: ${targetUser.profile?.maritalStatus || "null"} → ${validatedData.maritalStatus || "null"}`,
      );

    // Update profile in transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update or create profile
      const profile = await tx.userProfile.upsert({
        where: { userId: id },
        update: updateData,
        create: {
          userId: id,
          ...updateData,
        },
        select: {
          id: true,
          nik: true,
          birthDate: true,
          birthPlace: true,
          address: true,
          job: true,
          education: true,
          maritalStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Log profile update activity
      await logProfileUpdate({
        currentUserId: currentUser.id,
        targetUserId: id,
        targetUserName: targetUser.name,
        targetUserEmail: targetUser.email,
        changes,
        event,
        transaction: tx,
        isSelfUpdate: currentUser.id === id,
      });

      return profile;
    });

    // Calculate new profile completion percentage
    const profileFields = [
      updatedProfile.nik,
      updatedProfile.birthDate,
      updatedProfile.birthPlace,
      updatedProfile.address,
      updatedProfile.job,
      updatedProfile.education,
      updatedProfile.maritalStatus,
    ];
    const filledFields = profileFields.filter(
      (field) => field !== null && field !== undefined,
    );
    const completionPercentage = Math.round(
      (filledFields.length / profileFields.length) * 100,
    );

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        profile: {
          id: updatedProfile.id,
          nik: updatedProfile.nik,
          birth_date: updatedProfile.birthDate?.toISOString(),
          birth_place: updatedProfile.birthPlace,
          address: updatedProfile.address,
          job: updatedProfile.job,
          education: updatedProfile.education,
          marital_status: updatedProfile.maritalStatus,
          created_at: updatedProfile.createdAt.toISOString(),
          updated_at: updatedProfile.updatedAt.toISOString(),
          completion_percentage: completionPercentage,
        },
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        },
        changes_made: changes,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        profile_suggestions:
          completionPercentage < 100
            ? [
                ...(updatedProfile.nik ? [] : ["Add NIK for identification"]),
                ...(updatedProfile.birthDate ? [] : ["Add birth date"]),
                ...(updatedProfile.birthPlace ? [] : ["Add birth place"]),
                ...(updatedProfile.address
                  ? []
                  : ["Complete address information"]),
                ...(updatedProfile.job ? [] : ["Add job information"]),
                ...(updatedProfile.education
                  ? []
                  : ["Add education information"]),
                ...(updatedProfile.maritalStatus ? [] : ["Add marital status"]),
              ]
            : [],
      },
      "Profile updated successfully",
      {
        requestId,
        event,
        executionTime,
        nextStep:
          completionPercentage < 100
            ? {
                action: "complete_profile",
                endpoint: `/api/users/profile/${id}`,
                method: "PUT",
                optional: [
                  "nik",
                  "birthDate",
                  "birthPlace",
                  "address",
                  "job",
                  "education",
                  "maritalStatus",
                ],
                description: "Complete remaining profile information",
              }
            : undefined,
        links: {
          self: `/api/users/profile/${id}`,
          related: {
            view_profile: `/api/users/profile/${id}`,
            upload_avatar: `/api/users/avatar/${id}`,
            user_detail: `/api/users/${id}`,
            all_users: "/api/users",
            ...(currentUser.id === id
              ? {
                  my_account: "/api/auth/me",
                  change_password: "/api/auth/change-password",
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
        return responses.notFound("User or profile not found", {
          requestId,
          event,
        });
      }
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target?.[0];
        const field = target === "nik" ? "NIK" : "field";
        return responses.conflict(`${field} already exists`, {
          requestId,
          event,
        });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Profile update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "PROFILE_UPDATE_ERROR" },
    );
  }
});
