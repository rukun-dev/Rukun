// server/api/activity-logs/export.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { exportLogsSchema } from "~~/server/validators/rt-profile";

// Helper function to convert logs to CSV
function logsToCSV(logs: any[]): string {
  const headers = [
    "ID",
    "User Name",
    "User Email",
    "User Role",
    "Action",
    "Description",
    "IP Address",
    "User Agent",
    "Created At",
  ];

  const rows = logs.map((log) => [
    log.id,
    log.user.name,
    log.user.email,
    log.user.role,
    log.action,
    log.description || "",
    log.ipAddress || "",
    log.userAgent || "",
    log.createdAt.toISOString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((field) =>
          typeof field === "string" && field.includes(",")
            ? `"${field.replace(/"/g, '""')}"`
            : field,
        )
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

// Helper function to convert logs to Excel format (basic CSV with .xlsx extension)
function logsToExcel(logs: any[]): string {
  // For now, return CSV format - in production you might want to use a library like xlsx
  return logsToCSV(logs);
}

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only SUPER_ADMIN and KETUA_RT can export logs
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to export activity logs",
        { requestId, event },
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = exportLogsSchema.parse(body);

    const { format, startDate, endDate, action, userId, limit } = validatedData;

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

    // Get logs for export
    const logs = await prisma.activityLog.findMany({
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
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (logs.length === 0) {
      return responses.notFound(
        "No activity logs found matching the criteria",
        {
          requestId,
          event,
          filters: {
            action: action || null,
            userId: userId || null,
            startDate: startDate || null,
            endDate: endDate || null,
            limit,
          },
        },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Prepare export data
    let exportContent: string;
    let mimeType: string;
    let fileExtension: string;
    let fileName: string;

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFileName = `activity-logs-${timestamp}`;

    switch (format) {
      case "csv":
        exportContent = logsToCSV(logs);
        mimeType = "text/csv";
        fileExtension = "csv";
        fileName = `${baseFileName}.csv`;
        break;
      case "excel":
        exportContent = logsToExcel(logs);
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileExtension = "xlsx";
        fileName = `${baseFileName}.xlsx`;
        break;
      case "json":
      default:
        exportContent = JSON.stringify(
          {
            exported_at: new Date().toISOString(),
            exported_by: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            },
            filters: {
              action: action || null,
              userId: userId || null,
              startDate: startDate || null,
              endDate: endDate || null,
              limit,
            },
            total_records: logs.length,
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
              },
            })),
          },
          null,
          2,
        );
        mimeType = "application/json";
        fileExtension = "json";
        fileName = `${baseFileName}.json`;
        break;
    }

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "EXPORT_ACTIVITY_LOGS",
        description: `Exported ${logs.length} activity logs in ${format.toUpperCase()} format${action ? ` - Action filter: ${action}` : ""}${userId ? ` - User filter: ${userId}` : ""}`,
        ipAddress: clientIP,
        userAgent,
      },
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Set response headers for file download
    setHeader(event, "Content-Type", mimeType);
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    setHeader(event, "X-Request-ID", requestId);
    setHeader(event, "X-Execution-Time", executionTime);

    // Return the file content
    return exportContent;
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
          available_formats: ["json", "csv", "excel"],
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
      "Activity logs export failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "ACTIVITY_LOGS_EXPORT_ERROR" },
    );
  }
});
