// server/api/users/[id]/sessions.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses, calculatePagination } from "~~/server/utils/response";
import { userIdParamSchema } from "~~/server/validators/user";

// Query parameters validation schema
const sessionsQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1, "Page must be at least 1")
    .default(() => 1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1 && val <= 50, "Limit must be between 1 and 50")
    .default(() => 10),
  status: z.enum(["active", "expired", "all"]).default("all"),
  sortBy: z.enum(["createdAt", "expiresAt", "lastUsed"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

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

    // Parse and validate query parameters
    const query = getQuery(event);
    const { page, limit, status, sortBy, sortOrder } =
      sessionsQuerySchema.parse(query);

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - only own sessions or admin can view sessions
    const canView =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      (["KETUA_RT", "SEKRETARIS"].includes(currentUser.role) &&
       canManageUser(currentUser.role as any, targetUser.role as any));

    if (!canView) {
      return responses.forbidden(
        "You don't have permission to view this user's sessions",
        { requestId, event },
      );
    }

    // Build where clause for filtering
    const whereClause: any = {
      userId: id,
    };

    const now = new Date();
    if (status === "active") {
      whereClause.expiresAt = { gt: now };
    } else if (status === "expired") {
      whereClause.expiresAt = { lte: now };
    }

    // Build order by clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get sessions with pagination
    const [sessions, totalCount] = await Promise.all([
      prisma.session.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          token: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
      prisma.session.count({ where: whereClause }),
    ]);

    // Get session statistics
    const [activeSessions, expiredSessions, totalSessions] = await Promise.all([
      prisma.session.count({
        where: { userId: id, expiresAt: { gt: now } },
      }),
      prisma.session.count({
        where: { userId: id, expiresAt: { lte: now } },
      }),
      prisma.session.count({
        where: { userId: id },
      }),
    ]);

    // Get current session token (if viewing own sessions)
    const currentToken = getCookie(event, "auth-token");

    // Calculate pagination info
    const pagination = calculatePagination(page, limit, totalCount);

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        user: {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          is_active: targetUser.isActive,
        },
        sessions: sessions.map((session) => ({
          id: session.id,
          token_preview: currentUser.id === id
            ? `${session.token.slice(0, 8)}...${session.token.slice(-8)}`
            : "***hidden***",
          is_current: currentToken === session.token,
          is_active: session.expiresAt > now,
          expires_at: session.expiresAt.toISOString(),
          created_at: session.createdAt.toISOString(),
          time_until_expiry: session.expiresAt > now
            ? Math.ceil((session.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : null,
          status: session.expiresAt > now ? "active" : "expired",
        })),
        statistics: {
          total_sessions: totalSessions,
          active_sessions: activeSessions,
          expired_sessions: expiredSessions,
          active_percentage: totalSessions > 0
            ? Math.round((activeSessions / totalSessions) * 100)
            : 0,
          filtered_sessions: sessions.length,
        },
        filters_applied: {
          status,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
        security_info: {
          current_session_included: currentUser.id === id && sessions.some(s => s.token === currentToken),
          can_revoke_sessions: currentUser.id === id || currentUser.role === "SUPER_ADMIN",
          session_cleanup_available: expiredSessions > 0,
        },
      },
      "User sessions retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        pagination,
        links: {
          self: `/api/users/${id}/sessions?page=${page}&limit=${limit}&status=${status}`,
          related: {
            user_profile: `/api/users/profile/${id}`,
            user_detail: `/api/users/${id}`,
            user_activities: `/api/users/${id}/activities`,
            revoke_sessions: `/api/users/${id}/sessions/revoke`,
            cleanup_expired: `/api/users/${id}/sessions/cleanup`,
            ...(currentUser.id === id
              ? {
                  my_account: "/api/auth/me",
                  logout: "/api/auth/logout",
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
        firstError?.message || "Invalid query parameters",
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
        return responses.notFound("User or sessions not found", {
          requestId,
          event,
        });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve user sessions",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "USER_SESSIONS_ERROR" },
    );
  }
});
