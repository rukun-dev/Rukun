// server/api/users/statistics.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Query parameters validation schema
const statisticsQuerySchema = z
  .object({
    from: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid date format for 'from' parameter",
      ),
    to: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid date format for 'to' parameter",
      ) })
  .refine((data) => {
    if (data.from && data.to) {
      const fromDate = new Date(data.from);
      const toDate = new Date(data.to);
      return fromDate <= toDate;
    }
    return true;
  }, "The 'from' date must be before or equal to the 'to' date");

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  // Validate query parameters first (before any auth or DB calls)
  const query = getQuery(event);
  let validatedQuery;

  try {
    validatedQuery = statisticsQuerySchema.parse(query);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid query parameters",
        firstError?.path[0]?.toString(),
        {
          requestId,
          event,
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path[0]?.toString();
              if (field) acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          ) },
      );
    }
    // Re-throw non-validation errors
    throw error;
  }

  try {
    // Authentication & authorization (after validation)
    const currentUser = await requireAuth(event);

    // Check permission
    if (!hasPermission(currentUser.role as any, "read:users")) {
      return responses.forbidden(
        "Permission denied. Required permission: read:users",
        {
          requestId,
          event,
          code: "FORBIDDEN" },
      );
    }

    // Get complete user data from context or database
    const fullUser =
      event.context?.user ||
      (await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { id: true, name: true, email: true, role: true } }));

    const dateFrom = validatedQuery.from
      ? new Date(validatedQuery.from)
      : undefined;
    const dateTo = validatedQuery.to ? new Date(validatedQuery.to) : undefined;

    // Build date filter
    const dateFilter =
      dateFrom && dateTo
        ? { createdAt: { gte: dateFrom, lte: dateTo } }
        : dateFrom
          ? { createdAt: { gte: dateFrom } }
          : dateTo
            ? { createdAt: { lte: dateTo } }
            : {};

    // Execute all statistics queries in parallel
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentUsers,
      usersWithProfiles,
      usersWithAvatars,
      topActiveUsers,
      userRegistrationTrend,
      profileCompletionStats,
    ] = await Promise.all([
      // Total users count
      prisma.user.count({ where: dateFilter }),

      // Active users count
      prisma.user.count({
        where: { ...dateFilter, isActive: true } }),

      // Inactive users count
      prisma.user.count({
        where: { ...dateFilter, isActive: false } }),

      // Users grouped by role
      prisma.user.groupBy({
        by: ["role"],
        where: dateFilter,
        _count: { role: true },
        orderBy: { _count: { role: "desc" } } }),

      // Recent users (last 10)
      prisma.user.findMany({
        where: dateFilter,
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          avatar: true } }),

      // Users with complete profiles
      prisma.user.count({
        where: {
          ...dateFilter,
          profile: {
            AND: [
              { nik: { not: null } },
              { address: { not: null } },
              { birthDate: { not: null } },
            ] } } }),

      // Users with avatars
      prisma.user.count({
        where: {
          ...dateFilter,
          avatar: { not: null } } }),

      // Most active users by activity logs
      prisma.user.findMany({
        where: {
          ...dateFilter,
          activityLogs: {
            some: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              } } } },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          _count: {
            select: {
              activityLogs: {
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } } } } },
        orderBy: {
          activityLogs: {
            _count: "desc" } },
        take: 10 }),

      // User registration trend (last 12 months)
      (async () => {
        let baseQuery = `
          SELECT
            DATE_FORMAT(createdAt, '%Y-%m') as month,
            COUNT(*) as count
          FROM users
          WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        `;

        const params = [];
        if (dateFrom) {
          baseQuery += ` AND createdAt >= ?`;
          params.push(dateFrom);
        }
        if (dateTo) {
          baseQuery += ` AND createdAt <= ?`;
          params.push(dateTo);
        }

        baseQuery += `
          GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
          ORDER BY month DESC
        `;

        return await prisma.$queryRawUnsafe<{ month: string; count: bigint }[]>(
          baseQuery,
          ...params,
        );
      })(),

      // Profile completion statistics
      (async () => {
        let baseQuery = `
          SELECT
            CASE
              WHEN up.nik IS NOT NULL AND up.address IS NOT NULL AND up.birthDate IS NOT NULL
                   AND up.birthPlace IS NOT NULL AND up.job IS NOT NULL
                   AND up.education IS NOT NULL AND up.maritalStatus IS NOT NULL
                   AND u.phone IS NOT NULL AND u.avatar IS NOT NULL
              THEN 'complete'
              WHEN up.nik IS NOT NULL AND up.address IS NOT NULL AND up.birthDate IS NOT NULL
              THEN 'partial'
              ELSE 'minimal'
            END as completion_level,
            COUNT(*) as count
          FROM users u
          LEFT JOIN user_profiles up ON u.id = up.userId
          WHERE u.isActive = true
        `;

        const params = [];
        if (dateFrom) {
          baseQuery += ` AND u.createdAt >= ?`;
          params.push(dateFrom);
        }
        if (dateTo) {
          baseQuery += ` AND u.createdAt <= ?`;
          params.push(dateTo);
        }

        baseQuery += ` GROUP BY completion_level`;

        return await prisma.$queryRawUnsafe<
          { completion_level: string; count: bigint }[]
        >(baseQuery, ...params);
      })(),
    ]);

    // Convert BigInt values to numbers for JSON serialization
    const convertedRegistrationTrend = userRegistrationTrend.map((row) => ({
      month: row.month,
      count: Number(row.count) }));

    const convertedProfileCompletionStats = profileCompletionStats.map(
      (row) => ({
        completion_level: row.completion_level,
        count: Number(row.count) }),
    );

    // Calculate percentages with safety checks
    const activePercentage =
      totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
    const profileCompletionPercentage =
      totalUsers > 0 ? Math.round((usersWithProfiles / totalUsers) * 100) : 0;
    const avatarPercentage =
      totalUsers > 0 ? Math.round((usersWithAvatars / totalUsers) * 100) : 0;

    // Validate calculated percentages
    const safeActivePercentage = Math.max(0, Math.min(100, activePercentage));
    const safeProfileCompletionPercentage = Math.max(
      0,
      Math.min(100, profileCompletionPercentage),
    );
    const safeAvatarPercentage = Math.max(0, Math.min(100, avatarPercentage));

    // Process role statistics
    const roleStats = usersByRole.reduce(
      (acc, role) => {
        acc[role.role] = role._count.role;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Ensure all roles are included with 0 if not present
    const allRoles = [
      "SUPER_ADMIN",
      "KETUA_RT",
      "SEKRETARIS",
      "BENDAHARA",
      "STAFF",
      "WARGA",
    ];
    allRoles.forEach((role) => {
      if (!(role in roleStats)) {
        roleStats[role] = 0;
      }
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        overview: {
          total_users: totalUsers,
          active_users: activeUsers,
          inactive_users: inactiveUsers,
          active_percentage: safeActivePercentage,
          users_with_complete_profiles: usersWithProfiles,
          profile_completion_percentage: safeProfileCompletionPercentage,
          users_with_avatars: usersWithAvatars,
          avatar_percentage: safeAvatarPercentage },
        role_distribution: roleStats,
        profile_completion_breakdown: convertedProfileCompletionStats,
        recent_users: recentUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.isActive,
          has_avatar: !!user.avatar,
          created_at: user.createdAt.toISOString() })),
        most_active_users: topActiveUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          activity_count: user._count.activityLogs })),
        registration_trend: convertedRegistrationTrend,
        date_range: {
          from: dateFrom?.toISOString(),
          to: dateTo?.toISOString(),
          description:
            dateFrom && dateTo
              ? `Statistics from ${dateFrom.toDateString()} to ${dateTo.toDateString()}`
              : dateFrom
                ? `Statistics from ${dateFrom.toDateString()}`
                : dateTo
                  ? `Statistics up to ${dateTo.toDateString()}`
                  : "All-time statistics" },
        generated_by: {
          id: currentUser.id,
          name: fullUser?.name || "Unknown",
          role: currentUser.role } },
      "User statistics retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/users/statistics",
          related: {
            all_users: "/api/users",
            user_activities: "/api/activity-logs",
            system_health: "/api/system/health" } } },
    );
  } catch (error: unknown) {
    // Handle authentication/authorization errors
    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, {
          requestId,
          event,
          code: "UNAUTHORIZED" });
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, {
          requestId,
          event,
          code: "FORBIDDEN" });
      }
      throw error;
    }

    // Handle Prisma database errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;

      const executionTime = `${Date.now() - startedAt}ms`;

      switch (prismaError.code) {
        case "P2021":
          return responses.serverError(
            "Database table not found",
            process.env.NODE_ENV === "development"
              ? prismaError.message
              : undefined,
            { requestId, event, executionTime, code: "TABLE_NOT_FOUND" },
          );
        case "P2002":
          return responses.serverError(
            "Database constraint violation",
            process.env.NODE_ENV === "development"
              ? prismaError.message
              : undefined,
            { requestId, event, executionTime, code: "CONSTRAINT_VIOLATION" },
          );
        case "P2025":
          return responses.serverError(
            "Required database record not found",
            process.env.NODE_ENV === "development"
              ? prismaError.message
              : undefined,
            { requestId, event, executionTime, code: "RECORD_NOT_FOUND" },
          );
        default:
          return responses.serverError(
            "Database operation failed",
            process.env.NODE_ENV === "development"
              ? prismaError.message
              : undefined,
            { requestId, event, executionTime, code: "DATABASE_ERROR" },
          );
      }
    }

    // Handle validation errors
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ValidationError"
    ) {
      const executionTime = `${Date.now() - startedAt}ms`;
      const errorObj = error as any;
      const errorMessage = errorObj.message || "Validation error";
      return responses.validation("Invalid query parameters", undefined, {
        requestId,
        event,
        executionTime,
        error: errorMessage });
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[STATISTICS_ERROR]", {
      error: errorMessage,
      requestId,
      executionTime,
      stack: error instanceof Error ? error.stack : undefined });

    return responses.serverError(
      "Failed to retrieve user statistics",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "USER_STATISTICS_ERROR" },
    );
  }
});
