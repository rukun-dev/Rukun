// server/api/users/avatar/[id].delete.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
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

    // Validate route parameter
    const { id } = userIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Check if target user exists and has avatar
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
      },
    });

    if (!targetUser) {
      return responses.notFound("User not found", { requestId, event });
    }

    // Authorization check - users can delete their own avatar or if they have permission
    const canUpdate =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      canManageUser(currentUser.role as any, targetUser.role as any) ||
      ["KETUA_RT", "SEKRETARIS"].includes(currentUser.role);

    if (!canUpdate) {
      return responses.forbidden(
        "You don't have permission to delete this user's avatar",
        { requestId, event },
      );
    }

    // Check if user has an avatar to delete
    if (!targetUser.avatar || !targetUser.avatarPublicId) {
      return responses.badRequest(
        "User doesn't have an avatar to delete",
        undefined,
        {
          current_avatar: null,
          suggestion: "Upload an avatar first",
          upload_endpoint: `/api/users/avatar/${id}`,
        },
        { requestId, event },
      );
    }

    // Validate Cloudinary configuration for deletion
    const configValidation = CloudinaryService.validateConfig();
    if (!configValidation.valid) {
      return responses.serverError(
        "Image service is not configured",
        process.env.NODE_ENV === "development"
          ? `Missing: ${configValidation.missing.join(", ")}`
          : undefined,
        { requestId, event, code: "CLOUDINARY_CONFIG_ERROR" },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Store avatar info for response
    const deletedAvatarInfo = {
      url: targetUser.avatar,
      public_id: targetUser.avatarPublicId,
    };

    // Delete avatar from Cloudinary and update user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user to remove avatar references
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          avatar: null,
          avatarPublicId: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          avatarPublicId: true,
          updatedAt: true,
        },
      });

      // Log activity for the user performing the deletion
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "AVATAR_DELETE",
          description: `Deleted avatar for: ${targetUser.name} (${targetUser.email})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Log activity for the updated user (if different)
      if (currentUser.id !== id) {
        await tx.activityLog.create({
          data: {
            userId: id,
            action: "AVATAR_DELETED_BY_ADMIN",
            description: `Avatar deleted by ${currentUser.name} (${currentUser.email})`,
            ipAddress: clientIP,
            userAgent,
          },
        });
      }

      return updatedUser;
    });

    // Delete from Cloudinary after successful database update
    let cloudinaryDeletion: { result: string; error?: string } | null = null;
    try {
      cloudinaryDeletion = await CloudinaryService.deleteImage(
        targetUser.avatarPublicId,
      );
    } catch (cloudinaryError) {
      // Log but don't fail the deletion since DB is already updated
      console.warn(
        `Failed to delete avatar from Cloudinary: ${targetUser.avatarPublicId}`,
        cloudinaryError,
      );
      cloudinaryDeletion = {
        error: "Failed to delete from cloud storage",
        result: "db_updated",
      };
    }

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        deleted: true,
        user: {
          id: result.id,
          name: result.name,
          email: result.email,
          avatar: result.avatar,
          avatar_public_id: result.avatarPublicId,
          updated_at: result.updatedAt.toISOString(),
        },
        deleted_avatar: {
          url: deletedAvatarInfo.url,
          public_id: deletedAvatarInfo.public_id,
          cloudinary_result: cloudinaryDeletion?.result || "unknown",
        },
        deletion_summary: {
          database_updated: true,
          cloudinary_deleted: cloudinaryDeletion?.result === "ok",
          cleanup_warning:
            cloudinaryDeletion && "error" in cloudinaryDeletion
              ? cloudinaryDeletion.error
              : null,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Avatar deleted successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/users/avatar/${id}`,
          related: {
            upload_new_avatar: `/api/users/avatar/${id}`,
            user_profile: `/api/users/profile/${id}`,
            user_detail: `/api/users/${id}`,
            all_users: "/api/users",
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
      if (prismaError.code === "P2025") {
        return responses.notFound("User not found", { requestId, event });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Avatar deletion failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "AVATAR_DELETE_ERROR" },
    );
  }
});
