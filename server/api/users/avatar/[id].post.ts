// server/api/users/avatar/[id].post.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP, canManageUser } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { userIdParamSchema } from "~~/server/validators/user";
import CloudinaryService, {
  validateImageFile } from "~~/server/utils/cloudinary";
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

    // Check if target user exists
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

    // Authorization check - users can update their own avatar or if they have permission
    const canUpdate =
      currentUser.id === id ||
      currentUser.role === "SUPER_ADMIN" ||
      canManageUser(currentUser.role as any, targetUser.role as any) ||
      ["KETUA_RT", "SEKRETARIS"].includes(currentUser.role);

    if (!canUpdate) {
      return responses.forbidden(
        "You don't have permission to update this user's avatar",
        { requestId, event },
      );
    }

    // Validate Cloudinary configuration
    const configValidation = CloudinaryService.validateConfig();
    if (!configValidation.valid) {
      return responses.serverError(
        "Image upload service is not configured",
        process.env.NODE_ENV === "development"
          ? `Missing: ${configValidation.missing.join(", ")}`
          : undefined,
        { requestId, event, code: "CLOUDINARY_CONFIG_ERROR" },
      );
    }

    // Parse multipart form data
    const form = await readMultipartFormData(event);
    const fileField = form?.find(
      (field) => field.name === "avatar" || field.name === "file",
    );

    if (
      !fileField ||
      !fileField.filename ||
      !fileField.type ||
      !fileField.data
    ) {
      return responses.validation(
        "Avatar image file is required",
        "avatar",
        {
          expected_field: "avatar or file",
          supported_formats: ["JPEG", "PNG", "WebP"],
          max_size: "5MB",
        },
        { requestId, event },
      );
    }

    // Create File object for validation
    const file = new File([fileField.data as BlobPart], fileField.filename, {
      type: fileField.type,
    });

    // Validate image file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      return responses.validation(
        fileValidation.error || "Invalid image file",
        "avatar",
        {
          provided_type: fileField.type,
          provided_size: `${Math.round(fileField.data.length / 1024)}KB`,
          supported_formats: ["image/jpeg", "image/png", "image/webp"],
          max_size: "5MB",
        },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    try {
      // Upload to Cloudinary with avatar-specific transformations
      const uploadResult = await CloudinaryService.uploadAvatar(
        fileField.data,
        id,
        {
          tags: [`user_${id}`, "avatar", targetUser.role.toLowerCase()],
        },
      );

      // Update user in transaction
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Delete old avatar from Cloudinary if exists
        if (targetUser.avatarPublicId) {
          try {
            await CloudinaryService.deleteImage(targetUser.avatarPublicId);
          } catch (cloudinaryError) {
            // Log but don't fail the upload
            console.warn(
              `Failed to delete old avatar: ${targetUser.avatarPublicId}`,
              cloudinaryError,
            );
          }
        }

        // Update user with new avatar info
        const user = await tx.user.update({
          where: { id },
          data: {
            avatar: uploadResult.secure_url,
            avatarPublicId: uploadResult.public_id,
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

        // Log activity for the user performing the upload
        await tx.activityLog.create({
          data: {
            userId: currentUser.id,
            action: "AVATAR_UPLOAD",
            description: `Uploaded avatar for: ${targetUser.name} (${targetUser.email})`,
            ipAddress: clientIP,
            userAgent,
          },
        });

        // Log activity for the updated user (if different)
        if (currentUser.id !== id) {
          await tx.activityLog.create({
            data: {
              userId: id,
              action: "AVATAR_UPDATED_BY_ADMIN",
              description: `Avatar updated by ${currentUser.name} (${currentUser.email})`,
              ipAddress: clientIP,
              userAgent,
            },
          });
        }

        return user;
      });

      const executionTime = `${Date.now() - startedAt}ms`;

      // Generate different size variants for response
      const avatarVariants = {
        original: uploadResult.secure_url,
        small: CloudinaryService.getAvatarUrl(uploadResult.public_id, "sm"),
        medium: CloudinaryService.getAvatarUrl(uploadResult.public_id, "md"),
        large: CloudinaryService.getAvatarUrl(uploadResult.public_id, "lg"),
        extra_large: CloudinaryService.getAvatarUrl(
          uploadResult.public_id,
          "xl",
        ),
      };

      return responses.ok(
        {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            avatar_public_id: updatedUser.avatarPublicId,
            updated_at: updatedUser.updatedAt.toISOString(),
          },
          avatar_variants: avatarVariants,
          upload_info: {
            original_filename: fileField.filename,
            file_size: fileField.data.length,
            format: uploadResult.format,
            width: uploadResult.width,
            height: uploadResult.height,
            public_id: uploadResult.public_id,
            created_at: uploadResult.created_at,
          },
          updated_by: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
        },
        "Avatar uploaded successfully",
        {
          requestId,
          event,
          executionTime,
          links: {
            self: `/api/users/avatar/${id}`,
            related: {
              user_profile: `/api/users/profile/${id}`,
              user_detail: `/api/users/${id}`,
              delete_avatar: `/api/users/avatar/${id}`,
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
    } catch (cloudinaryError: any) {
      // Handle Cloudinary-specific errors
      return responses.serverError(
        "Failed to upload image to cloud storage",
        process.env.NODE_ENV === "development"
          ? cloudinaryError.message
          : undefined,
        {
          requestId,
          event,
          code: "CLOUDINARY_UPLOAD_ERROR",
          error_details:
            process.env.NODE_ENV === "development"
              ? {
                  http_code: cloudinaryError.http_code,
                  error: cloudinaryError.error,
                }
              : undefined,
        },
      );
    }
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

    // Handle multipart form parsing errors
    if (error instanceof Error && error.message.includes("multipart")) {
      return responses.badRequest(
        "Invalid multipart form data",
        undefined,
        {
          expected_format: "multipart/form-data",
          field_name: "avatar or file",
        },
        { requestId, event },
      );
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
      "Avatar upload failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "AVATAR_UPLOAD_ERROR" },
    );
  }
});
