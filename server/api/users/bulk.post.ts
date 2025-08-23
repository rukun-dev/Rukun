// server/api/users/bulk.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Bulk operations schema
const bulkOperationSchema = z.object({
  action: z.enum(["activate", "deactivate", "delete", "update_role"]),
  user_ids: z
    .array(z.string().min(1, "User ID cannot be empty"))
    .min(1, "At least one user ID is required")
    .max(50, "Cannot process more than 50 users at once"),
  data: z
    .object({
      role: z
        .enum([
          "SUPER_ADMIN",
          "KETUA_RT",
          "SEKRETARIS",
          "BENDAHARA",
          "STAFF",
          "WARGA",
        ])
        .optional(),
    })
    .optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Check permission
    if (!hasPermission(currentUser.role as any, "manage:users")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:users",
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const { action, user_ids, data } = bulkOperationSchema.parse(body);

    // Prevent self-operations in certain actions
    if (
      (action === "delete" || action === "deactivate") &&
      user_ids.includes(currentUser.id)
    ) {
      return responses.badRequest(
        `You cannot ${action} your own account`,
        undefined,
        {
          affected_user_id: currentUser.id,
          suggestion: "Remove your own ID from the operation",
        },
        { requestId, event },
      );
    }

    // Fetch target users to validate permissions and existence
    const targetUsers = await prisma.user.findMany({
      where: { id: { in: user_ids } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        _count: {
          select: {
            createdWargas: true,
            families: true,
            documents: true,
            transactions: true,
          },
        },
      },
    });

    // Check if all users exist
    const foundUserIds = targetUsers.map((user) => user.id);
    const missingUserIds = user_ids.filter((id) => !foundUserIds.includes(id));
    if (missingUserIds.length > 0) {
      return responses.notFound(`${missingUserIds.length} user(s) not found`, {
        requestId,
        event,
        missing_user_ids: missingUserIds,
      });
    }

    // Check permissions for each user
    const unauthorizedUsers = targetUsers.filter(
      (user) => !canManageUser(currentUser.role as any, user.role as any),
    );
    if (unauthorizedUsers.length > 0) {
      return responses.forbidden(
        `You don't have permission to manage ${unauthorizedUsers.length} user(s)`,
        {
          requestId,
          event,
          unauthorized_users: unauthorizedUsers.map((u) => ({
            id: u.id,
            name: u.name,
            role: u.role,
          })),
        },
      );
    }

    // Additional validation for role updates
    if (action === "update_role") {
      if (!data?.role) {
        return responses.validation(
          "Role is required for role update operation",
          "data.role",
          {
            available_roles: [
              "SUPER_ADMIN",
              "KETUA_RT",
              "SEKRETARIS",
              "BENDAHARA",
              "STAFF",
              "WARGA",
            ],
          },
          { requestId, event },
        );
      }

      // Check if current user can assign the target role
      if (!canManageUser(currentUser.role as any, data.role as any)) {
        return responses.forbidden(
          `You don't have permission to assign role: ${data.role}`,
          { requestId, event },
        );
      }
    }

    // Check for users with related data for delete operation
    if (action === "delete") {
      const usersWithRelatedData = targetUsers.filter(
        (user) =>
          user._count.createdWargas > 0 ||
          user._count.families > 0 ||
          user._count.documents > 0 ||
          user._count.transactions > 0,
      );
      if (usersWithRelatedData.length > 0) {
        return responses.badRequest(
          "Cannot delete users with related data",
          undefined,
          {
            users_with_data: usersWithRelatedData.map((user) => ({
              id: user.id,
              name: user.name,
              related_counts: {
                wargas: user._count.createdWargas,
                families: user._count.families,
                documents: user._count.documents,
                transactions: user._count.transactions,
              },
            })),
            suggestion: "Consider deactivating these users instead",
          },
          { requestId, event },
        );
      }
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    let results = {};

    // Execute bulk operation
    const operationResult = await prisma.$transaction(async (tx) => {
      let updatedUsers: any[] = [];
      let deletedUsers: any[] = [];

      switch (action) {
        case "activate":
          updatedUsers = await tx.user.findMany({
            where: { id: { in: user_ids } },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          });
          await tx.user.updateMany({
            where: { id: { in: user_ids } },
            data: { isActive: true },
          });
          break;

        case "deactivate":
          updatedUsers = await tx.user.findMany({
            where: { id: { in: user_ids } },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          });
          await tx.user.updateMany({
            where: { id: { in: user_ids } },
            data: { isActive: false },
          });
          // Invalidate all sessions for deactivated users
          await tx.session.deleteMany({
            where: { userId: { in: user_ids } },
          });
          break;

        case "update_role":
          updatedUsers = await tx.user.findMany({
            where: { id: { in: user_ids } },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
            },
          });
          await tx.user.updateMany({
            where: { id: { in: user_ids } },
            data: { role: data!.role },
          });
          break;

        case "delete":
          deletedUsers = await tx.user.findMany({
            where: { id: { in: user_ids } },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });
          // Delete user profiles first
          await tx.userProfile.deleteMany({
            where: { userId: { in: user_ids } },
          });
          // Delete sessions
          await tx.session.deleteMany({
            where: { userId: { in: user_ids } },
          });
          // Delete users (this will cascade delete activity logs)
          await tx.user.deleteMany({
            where: { id: { in: user_ids } },
          });
          break;
      }

      // Log bulk operation activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: `BULK_${action.toUpperCase()}`,
          description: `Bulk ${action} operation on ${user_ids.length} users: ${targetUsers.map((u) => `${u.name} (${u.email})`).join(", ")}`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return { updatedUsers, deletedUsers };
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Build response based on action
    const responseData: any = {
      operation: action,
      processed_count: user_ids.length,
      success: true,
      executed_by: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
    };

    if (action === "delete") {
      responseData.deleted_users = operationResult.deletedUsers;
    } else {
      responseData.affected_users = operationResult.updatedUsers.map(
        (user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.isActive,
        }),
      );
    }

    // Add action-specific information
    switch (action) {
      case "activate":
        responseData.message = `${user_ids.length} users activated`;
        break;
      case "deactivate":
        responseData.message = `${user_ids.length} users deactivated`;
        responseData.additional_actions = ["Sessions invalidated"];
        break;
      case "update_role":
        responseData.message = `${user_ids.length} users role updated to ${data!.role}`;
        responseData.new_role = data!.role;
        break;
      case "delete":
        responseData.message = `${user_ids.length} users deleted permanently`;
        responseData.additional_actions = [
          "Profiles deleted",
          "Sessions invalidated",
        ];
        break;
    }

    return responses.ok(responseData, responseData.message, {
      requestId,
      event,
      executionTime,
      links: {
        self: "/api/users/bulk",
        related: {
          all_users: "/api/users",
          activity_logs: "/api/activity-logs",
          user_statistics: "/api/users/statistics",
        },
      },
    });
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const providedFields = body ? Object.keys(body) : [];
      let customMessage = "";
      let suggestions: string[] = [];

      // Check for common field name mistakes
      if (
        providedFields.includes("operation") &&
        !providedFields.includes("action")
      ) {
        customMessage =
          "Invalid field name: use 'action' instead of 'operation'";
        suggestions.push("Change 'operation' to 'action'");
      }

      if (
        providedFields.includes("userIds") &&
        !providedFields.includes("user_ids")
      ) {
        if (customMessage) {
          customMessage += " and use 'user_ids' instead of 'userIds'";
        } else {
          customMessage =
            "Invalid field name: use 'user_ids' instead of 'userIds'";
        }
        suggestions.push("Change 'userIds' to 'user_ids'");
      }

      // If no custom message, use the first Zod error
      if (!customMessage) {
        const firstError = error.issues[0];
        customMessage = firstError?.message || "Validation failed";
      }

      return responses.validation(
        customMessage,
        error.issues[0]?.path[0]?.toString() || "body",
        {
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path.join(".");
              acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
          error_count: error.issues.length,
          provided_data: providedFields,
          suggestions: suggestions.length > 0 ? suggestions : undefined,
          expected_format: {
            action: "One of: activate, deactivate, delete, update_role",
            user_ids: "Array of user ID strings (1-50 items)",
            data: "Optional object (required for update_role action)",
          },
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
        return responses.conflict("Unique constraint violation", {
          requestId,
          event,
        });
      }
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Cannot complete operation due to foreign key constraints",
          undefined,
          {
            suggestion: "Check for related records that prevent the operation",
          },
          { requestId, event },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Bulk operation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "BULK_OPERATION_ERROR" },
    );
  }
});
