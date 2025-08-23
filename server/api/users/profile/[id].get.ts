// server/api/users/profile/[id].get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { userIdParamSchema } from "~~/server/validators/user";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Validate route parameter
    const { id } = userIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - users can view their own profile or if they have permission
    const canView =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      canManageUser(currentUser.role as any, targetUser.role as any) ||
      ["KETUA_RT", "SEKRETARIS", "BENDAHARA"].includes(currentUser.role);

    if (!canView) {
      return responses.forbidden(
        "You don't have permission to view this user's profile",
        { requestId, event },
      );
    }

    // Fetch comprehensive user profile data
    const userProfile = await prisma.user.findUnique({
      where: { id },
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
            birthDate: true,
            birthPlace: true,
            address: true,
            job: true,
            education: true,
            maritalStatus: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        // Related counts for profile statistics
        _count: {
          select: {
            createdWargas: true,
            families: true,
            documents: true,
            transactions: true,
            payments: true,
            announcements: true,
            activityLogs: true,
          },
        },
        // Recent activities (last 3 for profile view)
        activityLogs: {
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userProfile) {
      return responses.notFound("User profile not found", { requestId, event });
    }

    // Calculate profile completion percentage
    const profileFields = [
      userProfile.profile?.nik,
      userProfile.profile?.birthDate,
      userProfile.profile?.birthPlace,
      userProfile.profile?.address,
      userProfile.profile?.job,
      userProfile.profile?.education,
      userProfile.profile?.maritalStatus,
      userProfile.phone,
      userProfile.avatar,
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
        user: {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
          role: userProfile.role,
          is_active: userProfile.isActive,
          avatar: userProfile.avatar,
          avatar_public_id: userProfile.avatarPublicId,
          created_at: userProfile.createdAt.toISOString(),
          updated_at: userProfile.updatedAt.toISOString(),
        },
        profile: userProfile.profile
          ? {
              id: userProfile.profile.id,
              nik: userProfile.profile.nik,
              birth_date: userProfile.profile.birthDate?.toISOString(),
              birth_place: userProfile.profile.birthPlace,
              address: userProfile.profile.address,
              job: userProfile.profile.job,
              education: userProfile.profile.education,
              marital_status: userProfile.profile.maritalStatus,
              created_at: userProfile.profile.createdAt.toISOString(),
              updated_at: userProfile.profile.updatedAt.toISOString(),
              completion_percentage: completionPercentage,
            }
          : {
              completion_percentage: completionPercentage,
              message: "Profile data is incomplete",
            },
        statistics: {
          created_wargas: userProfile._count.createdWargas,
          managed_families: userProfile._count.families,
          created_documents: userProfile._count.documents,
          total_transactions: userProfile._count.transactions,
          total_payments: userProfile._count.payments,
          created_announcements: userProfile._count.announcements,
          total_activities: userProfile._count.activityLogs,
        },
        recent_activities: {
          preview: userProfile.activityLogs.map((activity) => ({
            id: activity.id,
            action: activity.action,
            description: activity.description,
            created_at: activity.createdAt.toISOString(),
          })),
          total_count: userProfile._count.activityLogs,
          showing: userProfile.activityLogs.length,
        },
        profile_suggestions:
          completionPercentage < 80
            ? [
                ...(userProfile.profile?.nik
                  ? []
                  : ["Add NIK for identification"]),
                ...(userProfile.profile?.birthDate ? [] : ["Add birth date"]),
                ...(userProfile.profile?.address
                  ? []
                  : ["Complete address information"]),
                ...(userProfile.phone ? [] : ["Add phone number"]),
                ...(userProfile.avatar ? [] : ["Upload profile picture"]),
              ]
            : [],
      },
      "User profile retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/users/profile/${id}`,
          related: {
            update_profile: `/api/users/profile/${id}`,
            upload_avatar: `/api/users/avatar/${id}`,
            user_detail: `/api/users/${id}`,
            user_activities: `/api/users/${id}/activities`,
            user_sessions: `/api/users/${id}/sessions`,
            user_search: "/api/users/search",
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
        firstError?.message || "Invalid user ID format",
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

    // Handle database errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("User profile not found", {
          requestId,
          event,
        });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve user profile",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "PROFILE_GET_ERROR" },
    );
  }
});
