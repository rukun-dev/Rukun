// server/api/activity-logs/cleanup.delete.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Cleanup options schema
const cleanupSchema = z.object({
  older_than_days: z
    .number()
    .int()
    .min(30, "Must keep at least 30 days of logs")
    .max(3650, "Cannot specify more than 10 years")
    .default(365), // Default: older than 1 year
  action_filter: z
    .string()
    .max(100, "Action filter must be at most 100 characters")
    .optional(),
  user_id_filter: z
    .string()
    .cuid("Invalid user ID format")
    .optional(),
  dry_run: z.boolean().default(true), // Default to dry run for safety
  batch_size: z
    .number()
    .int()
    .min(100, "Batch size must be at least 100")
    .max(10000, "Batch size cannot exceed 10000")
    .default(1000),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only SUPER_ADMIN can cleanup logs
    const currentUser = await requireAuth(event);

    if (currentUser.role !== "SUPER_ADMIN") {
      return responses.forbidden(
        "You don't have permission to cleanup activity logs. Only SUPER_ADMIN can perform this operation.",
        { requestId, event }
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = cleanupSchema.parse(body);

    const { older_than_days, action_filter, user_id_filter, dry_run, batch_size } = validatedData;

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - older_than_days);

    // Build where clause for deletion
    const whereClause: any = {
      createdAt: {
        lt: cutoffDate,
      },
    };

    if (action_filter) {
      whereClause.action = { contains: action_filter };
    }

    if (user_id_filter) {
      // Validate user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: user_id_filter },
        select: { id: true, name: true, email: true },
      });

      if (!targetUser) {
        return responses.notFound(
          `User with ID '${user_id_filter}' not found`,
          { requestId, event }
        );
      }

      whereClause.userId = user_id_filter;
    }

    // Get count of logs to be deleted
    const logsToDelete = await prisma.activityLog.count({
      where: whereClause,
    });

    if (logsToDelete === 0) {
      return responses.ok(
        {
          dry_run,
          logs_found: 0,
          logs_deleted: 0,
          cutoff_date: cutoffDate.toISOString(),
          filters: {
            older_than_days,
            action_filter: action_filter || null,
            user_id_filter: user_id_filter || null,
          },
          message: "No logs found matching the cleanup criteria",
        },
        "No activity logs to cleanup",
        {
          requestId,
          event,
          executionTime: `${Date.now() - startedAt}ms`,
          links: {
            view_logs: "/api/activity-logs",
            export_before_cleanup: "/api/activity-logs/export",
          },
        }
      );
    }

    // If dry run, just return what would be deleted
    if (dry_run) {
      // Get sample of logs that would be deleted
      const sampleLogs = await prisma.activityLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
        take: 10,
      });

      return responses.ok(
        {
          dry_run: true,
          logs_found: logsToDelete,
          logs_deleted: 0,
          cutoff_date: cutoffDate.toISOString(),
          filters: {
            older_than_days,
            action_filter: action_filter || null,
            user_id_filter: user_id_filter || null,
          },
          sample_logs: sampleLogs.map(log => ({
            id: log.id,
            action: log.action,
            description: log.description,
            created_at: log.createdAt.toISOString(),
            user: {
              id: log.user.id,
              name: log.user.name,
              email: log.user.email,
            },
          })),
          warning: "This is a dry run. No logs were actually deleted.",
          next_steps: {
            to_proceed: "Set dry_run: false in request body",
            recommendation: "Consider exporting logs before deletion",
          },
        },
        `Found ${logsToDelete} activity logs that would be deleted`,
        {
          requestId,
          event,
          executionTime: `${Date.now() - startedAt}ms`,
          links: {
            execute_cleanup: "/api/activity-logs/cleanup",
            export_logs: "/api/activity-logs/export",
            view_logs: "/api/activity-logs",
          },
        }
      );
    }

    // Perform actual cleanup in batches
    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    let totalDeleted = 0;
    let batchCount = 0;
    const startTime = Date.now();

    // Delete in batches to avoid timeout and memory issues
    while (true) {
      const batch = await prisma.activityLog.findMany({
        where: whereClause,
        select: { id: true },
        take: batch_size,
      });

      if (batch.length === 0) {
        break; // No more logs to delete
      }

      const batchIds = batch.map(log => log.id);
      const deleteResult = await prisma.activityLog.deleteMany({
        where: {
          id: { in: batchIds },
        },
      });

      totalDeleted += deleteResult.count;
      batchCount++;

      // Break if we've deleted fewer than the batch size (last batch)
      if (batch.length < batch_size) {
        break;
      }

      // Small delay between batches to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Log the cleanup activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "CLEANUP_ACTIVITY_LOGS",
        description: `Cleaned up ${totalDeleted} activity logs older than ${older_than_days} days${action_filter ? ` with action filter: ${action_filter}` : ""}${user_id_filter ? ` for user: ${user_id_filter}` : ""}`,
        ipAddress: clientIP,
        userAgent,
      },
    });

    const executionTime = `${Date.now() - startedAt}ms`;
    const cleanupTime = `${Date.now() - startTime}ms`;

    return responses.ok(
      {
        dry_run: false,
        logs_found: logsToDelete,
        logs_deleted: totalDeleted,
        batches_processed: batchCount,
        batch_size,
        cutoff_date: cutoffDate.toISOString(),
        filters: {
          older_than_days,
          action_filter: action_filter || null,
          user_id_filter: user_id_filter || null,
        },
        timing: {
          total_execution_time: executionTime,
          cleanup_time: cleanupTime,
          average_batch_time: batchCount > 0 ? `${Math.round((Date.now() - startTime) / batchCount)}ms` : "0ms",
        },
        cleanup_summary: {
          success: true,
          deleted_count: totalDeleted,
          remaining_logs_estimate: Math.max(0, logsToDelete - totalDeleted),
        },
        performed_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      `Successfully cleaned up ${totalDeleted} activity logs`,
      {
        requestId,
        event,
        executionTime,
        links: {
          view_remaining_logs: "/api/activity-logs",
          export_logs: "/api/activity-logs/export",
          system_settings: "/api/system/settings",
        },
      }
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
            {} as Record<string, string>
          ),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
          default_values: {
            older_than_days: 365,
            dry_run: true,
            batch_size: 1000,
          },
        },
        { requestId, event }
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
          "Database constraint error during cleanup",
          process.env.NODE_ENV === "development" ? prismaError.message : undefined,
          { requestId, event, code: "DATABASE_CONSTRAINT_ERROR" }
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Activity logs cleanup failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "ACTIVITY_LOGS_CLEANUP_ERROR" }
    );
  }
});
