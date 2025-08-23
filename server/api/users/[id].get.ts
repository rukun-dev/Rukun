// server/api/users/[id].get.ts
import { prisma } from "~~/server/utils/database";
import {
  requireAuth,
  canManageUser } from "~~/server/utils/auth";
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
      id: getRouterParam(event, "id") });

    // Check if user exists first
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        isActive: true } });

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
        "You don't have permission to view this user's details",
        { requestId, event },
      );
    }

    // Fetch comprehensive user data
    const user = await prisma.user.findUnique({
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
            updatedAt: true } },
        // Statistics and counts
        _count: {
          select: {
            sessions: {
              where: {
                expiresAt: { gt: new Date() } } },
            activityLogs: true,
            createdWargas: true,
            families: true,
            documents: true,
            transactions: true,
            payments: true,
            announcements: true,
            emailCampaigns: true } },
        // Recent activity (last 5 records only for preview)
        activityLogs: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            action: true,
            description: true,
            createdAt: true } },
        // Active sessions preview (only for own profile or admin)
        ...(currentUser.id === id || currentUser.role === "SUPER_ADMIN"
          ? {
              sessions: {
                where: {
                  expiresAt: { gt: new Date() } },
                select: {
                  id: true,
                  expiresAt: true,
                  createdAt: true },
                orderBy: { createdAt: "desc" },
                take: 3 } }
          : {}) } });

    if (!user) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Build response data based on permission level
    const responseData: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      is_active: user.isActive,
      avatar: user.avatar,
      avatar_public_id: user.avatarPublicId,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      profile: user.profile
        ? {
            id: user.profile.id,
            nik: user.profile.nik,
            birth_date: user.profile.birthDate?.toISOString(),
            birth_place: user.profile.birthPlace,
            address: user.profile.address,
            job: user.profile.job,
            education: user.profile.education,
            marital_status: user.profile.maritalStatus,
            created_at: user.profile.createdAt.toISOString(),
            updated_at: user.profile.updatedAt.toISOString() }
        : null,
      statistics: {
        active_sessions: user._count.sessions,
        total_activity_logs: user._count.activityLogs,
        created_wargas: user._count.createdWargas,
        families_managed: user._count.families,
        documents_created: user._count.documents,
        transactions_made: user._count.transactions,
        payments_made: user._count.payments,
        announcements_created: user._count.announcements,
        email_campaigns_created: user._count.emailCampaigns },
      recent_activities: {
        preview: user.activityLogs.map((log) => ({
          id: log.id,
          action: log.action,
          description: log.description,
          created_at: log.createdAt.toISOString() })),
        total_count: user._count.activityLogs,
        showing: user.activityLogs.length } };

    // Add sensitive data only for own profile or admin
    if (currentUser.id === id || currentUser.role === "SUPER_ADMIN") {
      responseData.sessions = {
        preview:
          (user as any).sessions?.map((session: any) => ({
            id: session.id,
            expires_at: session.expiresAt.toISOString(),
            created_at: session.createdAt.toISOString() })) || [],
        active_count: user._count.sessions,
        showing: (user as any).sessions?.length || 0 };
    }

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      { user: responseData },
      "User details retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/users/${id}`,
          related: {
            update_user: `/api/users/${id}`,
            user_profile: `/api/users/profile/${id}`,
            upload_avatar: `/api/users/avatar/${id}`,
            user_activities: `/api/users/${id}/activities`,
            user_sessions: `/api/users/${id}/sessions`,
            all_users: "/api/users",
            user_search: "/api/users/search",
            ...(currentUser.id === id
              ? {
                  change_password: "/api/auth/change-password",
                  logout: "/api/auth/logout",
                  my_account: "/api/auth/me" }
              : {}),
            ...(canManageUser(currentUser.role as any, user.role as any)
              ? {
                  delete_user: `/api/users/${id}` }
              : {}) } } },
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
          error_count: error.issues.length },
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
        return responses.notFound("User not found", { requestId, event });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve user details",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "USER_DETAIL_ERROR" },
    );
  }
});
