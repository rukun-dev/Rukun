// server/api/users/[id]/activities.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses, calculatePagination } from "~~/server/utils/response";
import { userIdParamSchema } from "~~/server/validators/user";

// Query parameters validation schema
const activitiesQuerySchema = z.object({
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
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100")
    .default(() => 20),
  action: z.string().max(100).optional(),
  search: z.string().max(255).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
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
    const { page, limit, action, search, startDate, endDate, sortOrder } =
      activitiesQuerySchema.parse(query);

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

    // Authorization check - users can view their own activities or if they have permission
    const canView =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      canManageUser(currentUser.role as any, targetUser.role as any) ||
      ["KETUA_RT", "SEKRETARIS", "BENDAHARA"].includes(currentUser.role);

    if (!canView) {
      return responses.forbidden(
        "You don't have permission to view this user's activities",
        { requestId, event },
      );
    }

    // Build where clause for filtering
    const whereClause: any = {
      userId: id,
    };

    if (action) {
      whereClause.action = { contains: action };
    }

    if (search) {
      whereClause.OR = [
        { action: { contains: search } },
        { description: { contains: search } },
        { ipAddress: { contains: search } },
        { userAgent: { contains: search } },
      ];
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get activities with pagination
    const [activities, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        orderBy: { createdAt: sortOrder },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          description: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
        },
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    // Get activity statistics for this user
    const [actionStats, dailyStats, recentActions] = await Promise.all([
      // Most common actions for this user
      prisma.activityLog.groupBy({
        by: ["action"],
        where: { userId: id },
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
      // Daily activity for the last 7 days for this user
      prisma.$queryRaw`
        SELECT
          DATE(createdAt) as date,
          COUNT(*) as count
        FROM activity_logs
        WHERE userId = ${id}
          AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
        LIMIT 7
      ` as unknown as Array<{ date: Date; count: bigint }>,
      // Most recent unique actions (last 5 distinct actions)
      prisma.activityLog.findMany({
        where: { userId: id },
        select: { action: true },
        distinct: ["action"],
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

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
        activities: activities.map((activity) => ({
          id: activity.id,
          action: activity.action,
          description: activity.description,
          ip_address: activity.ipAddress,
          user_agent: activity.userAgent,
          created_at: activity.createdAt.toISOString(),
        })),
        statistics: {
          total_activities: totalCount,
          filtered_activities: activities.length,
          top_actions: actionStats.map((stat) => ({
            action: stat.action,
            count: stat._count.action,
          })),
          daily_activity: dailyStats.map((stat) => ({
            date: stat.date.toISOString().split("T")[0],
            count: Number(stat.count),
          })),
          recent_unique_actions: recentActions.map((a) => a.action),
        },
        filters_applied: {
          action: action || null,
          search: search || null,
          start_date: startDate || null,
          end_date: endDate || null,
          sort_order: sortOrder,
        },
        available_actions: actionStats.map((stat) => stat.action),
      },
      "User activities retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        pagination,
        links: {
          self: `/api/users/${id}/activities?page=${page}&limit=${limit}${action ? `&action=${action}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
          related: {
            user_profile: `/api/users/profile/${id}`,
            user_detail: `/api/users/${id}`,
            user_sessions: `/api/users/${id}/sessions`,
            all_activities: "/api/activity-logs",
            export_activities: `/api/users/${id}/activities/export`,
            ...(currentUser.id === id
              ? {
                  my_account: "/api/auth/me",
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
        return responses.notFound("User or activities not found", {
          requestId,
          event,
        });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve user activities",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "USER_ACTIVITIES_ERROR" },
    );
  }
});
