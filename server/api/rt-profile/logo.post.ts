// server/api/rt-profile/logo.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { validateImageFile, fileToBuffer } from "~~/server/utils/cloudinary";
import CloudinaryService from "~~/server/utils/cloudinary";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization - only SUPER_ADMIN, KETUA_RT, SEKRETARIS can upload logo
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to upload RT logo",
        { requestId, event },
      );
    }

    // Parse multipart form data
    const form = await readMultipartFormData(event);
    if (!form) {
      return responses.badRequest(
        "No file uploaded",
        undefined,
        {
          expected_field: "logo",
          supported_formats: ["JPEG", "PNG", "WebP"],
          max_size: "5MB",
        },
        { requestId, event },
      );
    }

    // Find logo file in form data
    const logoField = form.find((field) => field.name === "logo");
    if (!logoField || !logoField.data) {
      return responses.badRequest(
        "Logo file is required",
        undefined,
        {
          field_name: "logo",
          supported_formats: ["JPEG", "PNG", "WebP"],
          max_size: "5MB",
        },
        { requestId, event },
      );
    }

    // Create File object for validation
    const file = new File(
      [logoField.data as BlobPart],
      logoField.filename || "logo",
      {
        type: logoField.type || "application/octet-stream",
      },
    );

    // Validate image file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      return responses.validation(
        fileValidation.error || "Invalid logo file",
        "logo",
        {
          provided_type: logoField.type,
          provided_size: `${Math.round(logoField.data.length / 1024)}KB`,
          max_size: "5MB",
          allowed_types: ["image/jpeg", "image/png", "image/webp"],
        },
        { requestId, event },
      );
    }

    // Validate Cloudinary configuration
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

    // Get existing RT profile
    const existingProfile = await prisma.rtProfile.findFirst({
      select: {
        id: true,
        rtNumber: true,
        rwNumber: true,
        logo: true,
        logoPublicId: true,
      },
    });

    if (!existingProfile) {
      return responses.notFound(
        "RT profile not found. Please create RT profile first.",
        {
          requestId,
          event,
          setup_endpoint: "/api/rt-profile",
        },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Upload to Cloudinary and update database in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete old logo from Cloudinary if exists
      if (existingProfile.logoPublicId) {
        try {
          await CloudinaryService.deleteImage(existingProfile.logoPublicId);
        } catch (deleteError) {
          console.warn(
            `Failed to delete old logo from Cloudinary: ${existingProfile.logoPublicId}`,
            deleteError,
          );
        }
      }

      // Upload new logo to Cloudinary
      const uploadResult = await CloudinaryService.uploadFromBuffer(
        logoField.data as Buffer,
        {
          folder: "rt-profile/logos",
          public_id: `rt-${existingProfile.rtNumber}-rw-${existingProfile.rwNumber}-logo`,
          transformation: {
            width: 500,
            height: 500,
            crop: "limit",
            quality: "auto:good",
            format: "webp",
          },
          tags: ["rt-profile", "logo", `rt-${existingProfile.rtNumber}`],
        },
      );

      // Update RT profile with new logo info
      const updatedProfile = await tx.rtProfile.update({
        where: { id: existingProfile.id },
        data: {
          logo: uploadResult.secure_url,
          logoPublicId: uploadResult.public_id,
        },
        select: {
          id: true,
          rtNumber: true,
          rwNumber: true,
          kelurahan: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
          postalCode: true,
          description: true,
          logo: true,
          logoPublicId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "UPLOAD_RT_LOGO",
          description: `Uploaded logo for RT ${existingProfile.rtNumber}/RW ${existingProfile.rwNumber}`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return { updatedProfile, uploadResult };
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        profile: {
          id: result.updatedProfile.id,
          rt_number: result.updatedProfile.rtNumber,
          rw_number: result.updatedProfile.rwNumber,
          kelurahan: result.updatedProfile.kelurahan,
          kecamatan: result.updatedProfile.kecamatan,
          kabupaten: result.updatedProfile.kabupaten,
          provinsi: result.updatedProfile.provinsi,
          postal_code: result.updatedProfile.postalCode,
          description: result.updatedProfile.description,
          logo: result.updatedProfile.logo,
          logo_public_id: result.updatedProfile.logoPublicId,
          created_at: result.updatedProfile.createdAt.toISOString(),
          updated_at: result.updatedProfile.updatedAt.toISOString(),
        },
        upload_info: {
          original_filename: logoField.filename,
          file_size: logoField.data.length,
          mime_type: logoField.type,
          cloudinary_url: result.uploadResult.secure_url,
          cloudinary_public_id: result.uploadResult.public_id,
          width: result.uploadResult.width,
          height: result.uploadResult.height,
          format: result.uploadResult.format,
          bytes: result.uploadResult.bytes,
        },
        uploaded_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        previous_logo: existingProfile.logo
          ? {
              url: existingProfile.logo,
              public_id: existingProfile.logoPublicId,
              status: "replaced",
            }
          : null,
      },
      "RT logo uploaded successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          view_profile: "/api/rt-profile",
          update_profile: "/api/rt-profile",
          delete_logo: `/api/rt-profile/logo`,
        },
      },
    );
  } catch (error: unknown) {
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

    // Handle Cloudinary errors
    if (error && typeof error === "object" && "http_code" in error) {
      const cloudinaryError = error as any;
      return responses.badRequest(
        "Image upload failed",
        undefined,
        {
          cloudinary_error: cloudinaryError.message,
          suggestion: "Please try with a different image or check file format",
        },
        { requestId, event },
      );
    }

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("RT profile not found", { requestId, event });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Logo upload failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "RT_LOGO_UPLOAD_ERROR" },
    );
  }
});
