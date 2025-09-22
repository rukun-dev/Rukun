// server/api/activity-logs/index.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { activityLogQuerySchema } from "~~/server/validators/rt-profile";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization - only admin users can view activity logs
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to view activity logs",
        { requestId, event },
      );
    }

    // Parse and validate query parameters
    const query = getQuery(event);
    const validatedQuery = activityLogQuerySchema.parse(query);

    const { page, limit, action, userId, startDate, endDate, search } =
      validatedQuery;

    // Build where clause for filtering
    const whereClause: any = {};

    if (action) {
      whereClause.action = { contains: action };
    }

    if (userId) {
      whereClause.userId = userId;
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

    if (search) {
      whereClause.OR = [
        { action: { contains: search } },
        { description: { contains: search } },
        { ipAddress: { contains: search } },
        { userAgent: { contains: search } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get activity logs with pagination
    const [logs, totalCount] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    // Get activity statistics for the filtered results
    const [actionStats, userStats, dailyStats] = await Promise.all([
      // Most common actions
      prisma.activityLog.groupBy({
        by: ["action"],
        where: whereClause,
        _count: { action: true },
        orderBy: { _count: { action: "desc" } },
        take: 10,
      }),
      // Most active users
      prisma.activityLog.groupBy({
        by: ["userId"],
        where: whereClause,
        _count: { userId: true },
        orderBy: { _count: { userId: "desc" } },
        take: 5,
      }),
      // Daily activity for the last 7 days (safe parameterized query)
      prisma.activityLog
        .groupBy({
          by: ["createdAt"],
          where: {
            ...whereClause,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          _count: { id: true },
          orderBy: { createdAt: "desc" },
        })
        .then((results) =>
          results.reduce(
            (acc, item) => {
              const date = item.createdAt.toISOString().split("T")[0];
              const existing = acc.find((a) => a.date === date);
              if (existing) {
                existing.count += item._count.id;
              } else {
                acc.push({ date, count: item._count.id });
              }
              return acc;
            },
            [] as Array<{ date: string; count: number }>,
          ),
        ),
    ]);

    // Get user details for user stats
    const userIds = userStats.map((stat) => stat.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    const userStatsWithDetails = userStats.map((stat) => {
      const user = users.find((u) => u.id === stat.userId);
      return {
        user: user || {
          id: stat.userId,
          name: "Unknown User",
          email: "",
          role: "WARGA",
          avatar: null,
        },
        count: stat._count.userId,
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        logs: logs.map((log) => ({
          id: log.id,
          action: log.action,
          description: log.description,
          ip_address: log.ipAddress,
          user_agent: log.userAgent,
          created_at: log.createdAt.toISOString(),
          user: {
            id: log.user.id,
            name: log.user.name,
            email: log.user.email,
            role: log.user.role,
            avatar: log.user.avatar,
          },
        })),
        statistics: {
          total_logs: totalCount,
          filtered_logs: logs.length,
          top_actions: actionStats.map((stat) => ({
            action: stat.action,
            count: stat._count.action,
          })),
          most_active_users: userStatsWithDetails,
          daily_activity: dailyStats.map((stat) => ({
            date: stat.date,
            count: stat.count,
          })),
        },
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit,
          has_next: hasNext,
          has_previous: hasPrevious,
          next_page: hasNext ? page + 1 : null,
          previous_page: hasPrevious ? page - 1 : null,
        },
        filters_applied: {
          action: action || null,
          user_id: userId || null,
          start_date: startDate || null,
          end_date: endDate || null,
          search: search || null,
        },
        available_actions: actionStats.map((stat) => stat.action).slice(0, 20),
        permissions: {
          can_export: ["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role),
          can_cleanup: currentUser.role === "SUPER_ADMIN",
        },
      },
      "Activity logs retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/activity-logs",
          export: "/api/activity-logs/export",
          cleanup: "/api/activity-logs/cleanup",
          ...(hasNext
            ? { next: `/api/activity-logs?page=${page + 1}&limit=${limit}` }
            : {}),
          ...(hasPrevious
            ? { previous: `/api/activity-logs?page=${page - 1}&limit=${limit}` }
            : {}),
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

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.serverError(
          "Database constraint error",
          process.env.NODE_ENV === "development"
            ? prismaError.message
            : undefined,
          { requestId, event, code: "DATABASE_CONSTRAINT_ERROR" },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to retrieve activity logs",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "ACTIVITY_LOGS_GET_ERROR" },
    );
  }
});
