/**
 * @file Endpoint to retrieve the details of a single file by its ID.
 * @description Returns the complete data of an uploaded file.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Schema to validate the ID parameter from the URL
const fileIdParamSchema = z.object({
  id: z.string().cuid("Invalid file ID format."),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Authentication & Authorization
    const currentUser = await requireAuth(event);
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "STAFF", "BENDAHARA"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "You do not have permission to view file details.",
        { requestId, event }
      );
    }

    // 2. Validate ID Parameter
    const { id } = fileIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // 3. Fetch file data from the database
    const file = await prisma.fileUpload.findUnique({
      where: { id },
    });

    // 4. If file is not found, send a 404 response
    if (!file) {
      return responses.notFound("File not found.", { requestId, event });
    }

    // 5. Format data for the response
    const responseData = {
      id: file.id,
      file_name: file.filename,
      original_name: file.originalName,
      url: file.cloudinaryUrl,
      public_id: file.publicId,
      resource_type: file.resourceType,
      format: file.format,
      width: file.width,
      height: file.height,
      size_in_bytes: file.size,
      mime_type: file.mimeType,
      uploaded_by: file.uploadedBy,
      folder: file.folder,
      tags: file.tags ? file.tags.split(',').map(tag => tag.trim()) : [],
      created_at: file.createdAt.toISOString(),
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Send Success Response
    return responses.ok(
      {
        file: responseData,
      },
      "File details retrieved successfully.",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/files/${id}`,
          related: {
            delete: `/api/files/${id}`,
            all_files: "/api/files",
          },
        },
      }
    );

  } catch (error: unknown) {
    // 7. Error Handling
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid ID format.",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.flatten().fieldErrors,
        },
        { requestId, event }
      );
    }
    
    // Fallback for Prisma not found error
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("File not found.", { requestId, event });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "A server error occurred.";
    return responses.serverError(
      "Failed to retrieve file details.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "FILE_DETAIL_FETCH_ERROR" }
    );
  }
});

