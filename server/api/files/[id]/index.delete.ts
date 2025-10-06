/**
 * @file Endpoint to delete a file by its ID.
 * @description Permanently deletes a file from Cloudinary and its corresponding record from the database.
 * This action is restricted to specific roles.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { CloudinaryService } from "~~/server/utils/cloudinary";
import { z } from "zod";

// Schema to validate the ID parameter from the URL
const fileIdParamSchema = z.object({
  id: z.string().cuid({ message: "Invalid file ID format." }),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Authentication & Authorization
    const currentUser = await requireAuth(event);
    // Only high-privilege roles can delete files
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "You do not have permission to delete this file.",
        { requestId, event }
      );
    }

    // 2. Validate Route Parameter
    const { id } = await getValidatedRouterParams(event, (rawParams) =>
      fileIdParamSchema.parse(rawParams)
    );

    // 3. Find the File Record
    const file = await prisma.fileUpload.findUnique({
      where: { id },
      select: {
        id: true,
        filename: true,
        publicId: true,
      },
    });

    if (!file) {
      return responses.notFound("File not found.", { requestId, event });
    }

    // 4. Delete File from Cloudinary First
    // This is done before the database transaction to prevent orphaned DB records if Cloudinary fails.
    try {
        await CloudinaryService.deleteImage(file.publicId);
    } catch(cloudinaryError) {
        console.error(`Cloudinary deletion failed for public_id: ${file.publicId}`, cloudinaryError);
        // We can choose to proceed or to stop. For now, we stop to ensure consistency.
        return responses.serverError(
            "Failed to delete the file from the storage provider.",
            process.env.NODE_ENV === "development" ? (cloudinaryError as Error).message : undefined,
            { requestId, event, code: "CLOUDINARY_DELETE_ERROR" }
        );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // 5. Perform Deletion from Database in a Transaction
    await prisma.$transaction(async (tx) => {
      // Log the deletion activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_FILE",
          description: `Deleted file: "${file.filename}" (ID: ${file.id})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Delete the file record from the database
      await tx.fileUpload.delete({
        where: { id },
      });
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Send Success Response
    return responses.ok(
      {
        deleted: true,
        file_id: id,
        deleted_file: {
          name: file.filename,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
        },
      },
      "File deleted successfully.",
      {
        requestId,
        event,
        executionTime,
        links: {
          collection: "/api/files",
          activity_logs: `/api/users/${currentUser.id}/activities`,
        },
      }
    );

  } catch (error: unknown) {
    // 7. Error Handling
    if (error instanceof z.ZodError) {
      return responses.validation(
        error.issues[0]?.message || "Invalid ID format.",
        error.issues[0]?.path[0]?.toString(),
        { issues: error.issues },
        { requestId, event }
      );
    }

    // Handle Prisma's record not found error during the delete operation
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("File not found when attempting to delete.", { requestId, event });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "A server error occurred.";
    return responses.serverError(
      "Failed to delete the file.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "FILE_DELETE_ERROR" }
    );
  }
});
