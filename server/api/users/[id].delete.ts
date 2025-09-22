// server/api/users/[id].delete.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth,
  getClientIP,
  canManageUser  } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";
import { userIdParamSchema } from "~~/server/validators/user";
import CloudinaryService from "~~/server/utils/cloudinary";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

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
          code: "FORBIDDEN" },
      );
    }

    // Validate route parameter
    const { id } = userIdParamSchema.parse({
      id: getRouterParam(event, "id") });

    // Prevent users from deleting themselves
    if (currentUser.id === id) {
      return responses.badRequest(
        "You cannot delete your own account",
        undefined,
        undefined,
        { requestId, event },
      );
    }

    // Check if target user exists and get their data
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
        avatarPublicId: true,
        // Count related records that might prevent deletion
        _count: {
          select: {
            createdWargas: true,
            families: true,
            documents: true,
            transactions: true,
            payments: true,
            announcements: true,
            emailCampaigns: true } } } });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - verify user can delete target user based on role hierarchy
    if (!canManageUser(currentUser.role as any, targetUser.role as any)) {
      return responses.forbidden(
        `You don't have permission to delete users with role: ${targetUser.role}`,
        { requestId, event },
      );
    }

    // Check for related data that might prevent deletion
    const hasRelatedData = Object.values(targetUser._count).some(
      (count) => count > 0,
    );

    if (hasRelatedData) {
      const relatedDataInfo = [];
      if (targetUser._count.createdWargas > 0)
        relatedDataInfo.push(
          `${targetUser._count.createdWargas} wargas created`,
        );
      if (targetUser._count.families > 0)
        relatedDataInfo.push(`${targetUser._count.families} families managed`);
      if (targetUser._count.documents > 0)
        relatedDataInfo.push(`${targetUser._count.documents} documents`);
      if (targetUser._count.transactions > 0)
        relatedDataInfo.push(`${targetUser._count.transactions} transactions`);
      if (targetUser._count.payments > 0)
        relatedDataInfo.push(`${targetUser._count.payments} payments`);
      if (targetUser._count.announcements > 0)
        relatedDataInfo.push(
          `${targetUser._count.announcements} announcements`,
        );
      if (targetUser._count.emailCampaigns > 0)
        relatedDataInfo.push(
          `${targetUser._count.emailCampaigns} email campaigns`,
        );

      return responses.badRequest(
        "Cannot delete user with related data. Please transfer or remove related records first.",
        undefined,
        {
          related_data: relatedDataInfo,
          suggestion: "Consider deactivating the user instead of deleting",
          alternative_endpoint: `/api/users/${id}`,
          alternative_data: { isActive: false } },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Perform deletion in transaction
    const deletionResult = await prisma.$transaction(async (tx) => {
      // Get all sessions for cleanup
      const sessions = await tx.session.findMany({
        where: { userId: id },
        select: { id: true } });

      // Delete user profile first (cascade should handle this, but being explicit)
      await tx.userProfile.deleteMany({
        where: { userId: id } });

      // Delete sessions
      await tx.session.deleteMany({
        where: { userId: id } });

      // Log the deletion activity before deleting the user
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_USER",
          description: `Deleted user: ${targetUser.name} (${targetUser.email}, ${targetUser.role})`,
          ipAddress: clientIP,
          userAgent } });

      // Delete the user (this will cascade delete activity logs due to FK constraint)
      await tx.user.delete({
        where: { id } });

      return {
        sessionsDeleted: sessions.length,
        profileDeleted: true };
    });

    // Clean up Cloudinary avatar if exists
    let avatarCleanup = null;
    if (targetUser.avatarPublicId) {
      try {
        avatarCleanup = await CloudinaryService.deleteImage(
          targetUser.avatarPublicId,
        );
      } catch (cloudinaryError) {
        // Log but don't fail the deletion
        console.warn(
          `Failed to delete avatar from Cloudinary: ${targetUser.avatarPublicId}`,
          cloudinaryError,
        );
        avatarCleanup = { error: "Failed to delete avatar from Cloudinary" };
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        deleted: true,
        user_id: id,
        deleted_user: {
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role },
        cleanup_summary: {
          sessions_deleted: deletionResult.sessionsDeleted,
          profile_deleted: deletionResult.profileDeleted,
          avatar_deleted: avatarCleanup ? avatarCleanup.result === "ok" : false },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email } },
      "User deleted successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          related: {
            all_users: "/api/users",
            create_new_user: "/api/users",
            activity_logs: "/api/activity-logs" } } },
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

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("User not found", { requestId, event });
      }
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Cannot delete user due to foreign key constraints. Please remove related records first.",
          undefined,
          {
            error_code: "FOREIGN_KEY_CONSTRAINT",
            suggestion: "Check for related wargas, families, documents, etc." },
          { requestId, event },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "User deletion failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "USER_DELETE_ERROR" },
    );
  }
});
