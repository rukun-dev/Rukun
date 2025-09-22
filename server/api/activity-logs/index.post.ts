// server/api/activity-logs/index.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { activityLogSchema } from "~~/server/validators/rt-profile";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only admin users can create manual activity logs
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to create activity logs",
        { requestId, event }
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = activityLogSchema.parse(body);

    // Check if target user exists (if userId is provided and different from current user)
    if (validatedData.userId && validatedData.userId !== currentUser.id) {
      const targetUser = await prisma.user.findUnique({
        where: { id: validatedData.userId },
        select: { id: true, name: true, email: true, role: true, isActive: true },
      });

      if (!targetUser) {
        return responses.notFound(
          `User with ID '${validatedData.userId}' not found`,
          { requestId, event }
        );
      }

      if (!targetUser.isActive) {
        return responses.badRequest(
          "Cannot create activity log for inactive user",
          undefined,
          {
            target_user: {
              id: targetUser.id,
              name: targetUser.name,
              email: targetUser.email,
              is_active: targetUser.isActive,
            },
          },
          { requestId, event }
        );
      }
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Use provided IP and user agent or fall back to current request's
    const logData = {
      userId: validatedData.userId,
      action: validatedData.action,
      description: validatedData.description,
      ipAddress: validatedData.ipAddress || clientIP,
      userAgent: validatedData.userAgent || userAgent,
    };

    // Create activity log in transaction
    const createdLog = await prisma.$transaction(async (tx) => {
      // Create the activity log
      const log = await tx.activityLog.create({
        data: logData,
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
      });

      // Log the creation of this manual activity log (meta-log)
      if (validatedData.userId !== currentUser.id) {
        await tx.activityLog.create({
          data: {
            userId: currentUser.id,
            action: "CREATE_ACTIVITY_LOG",
            description: `Created manual activity log for user: ${log.user.name} (${log.user.email}) - Action: ${validatedData.action}`,
            ipAddress: clientIP,
            userAgent,
          },
        });
      }

      return log;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        log: {
          id: createdLog.id,
          action: createdLog.action,
          description: createdLog.description,
          ip_address: createdLog.ipAddress,
          user_agent: createdLog.userAgent,
          created_at: createdLog.createdAt.toISOString(),
          user: {
            id: createdLog.user.id,
            name: createdLog.user.name,
            email: createdLog.user.email,
            role: createdLog.user.role,
            avatar: createdLog.user.avatar,
          },
        },
        is_manual: true,
        created_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        source_info: {
          original_ip: validatedData.ipAddress,
          original_user_agent: validatedData.userAgent,
          request_ip: clientIP,
          request_user_agent: userAgent,
        },
      },
      "Activity log created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/activity-logs`,
          view_all: "/api/activity-logs",
          user_logs: `/api/activity-logs?userId=${createdLog.userId}`,
          action_logs: `/api/activity-logs?action=${encodeURIComponent(createdLog.action)}`,
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
          required_fields: ["userId", "action"],
          optional_fields: ["description", "ipAddress", "userAgent"],
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
        return responses.conflict(
          "Duplicate activity log entry",
          { requestId, event }
        );
      }
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Foreign key constraint failed - invalid user ID",
          undefined,
          {
            suggestion: "Check if the provided userId exists and is valid",
          },
          { requestId, event }
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Activity log creation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "ACTIVITY_LOG_CREATE_ERROR" }
    );
  }
});
