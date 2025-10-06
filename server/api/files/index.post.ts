import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { CloudinaryService } from "~~/server/utils/cloudinary";

/**
 * Endpoint to upload a new file.
 * Accepts form data with the field: 'file', and optionally 'folder', 'tags'.
 * The file will be uploaded to Cloudinary and its details saved in the database.
 */
export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Authentication & Authorization
    // All authenticated users are allowed to upload.
    // You can add specific role checks here if needed.
    const currentUser = await requireAuth(event);
    if (!currentUser) {
      return responses.unauthorized(
        "You must be logged in to upload a file.",
        { requestId, event }
      );
    }

    // 2. Read Multipart Form Data
    const form = await readMultipartFormData(event);
    if (!form) {
      return responses.badRequest("Form data not found.", undefined, {}, { requestId, event });
    }

    // 3. Extract File and Optional Metadata
    const fileField = form.find((f) => f.name === 'file');
    const folderField = form.find((f) => f.name === 'folder');
    const tagsField = form.find((f) => f.name === 'tags'); // tags in a comma-separated string format

    if (!fileField || !fileField.data.length) {
      return responses.validation(
        "Incomplete input. The 'file' field is required and cannot be empty.",
        'file',
        undefined,
        { requestId, event }
      );
    }

    // 4. Process Upload to Cloudinary using CloudinaryService
    const folder = folderField?.data.toString().trim();
    const tags = tagsField?.data.toString().trim().split(',').map(t => t.trim()).filter(Boolean);

    console.log(`[File Upload] Uploading file "${fileField.filename}" to Cloudinary...`);
    // Using a static method from CloudinaryService
    const cloudinaryResult = await CloudinaryService.uploadFromBuffer(
      fileField.data,
      {
        folder: folder,
        tags: tags,
        resource_type: 'auto',
        // Clean up the filename for a better public_id
        public_id: fileField.filename ? 
          fileField.filename.substring(0, fileField.filename.lastIndexOf('.')) 
          : undefined,
      }
    );

    // 5. Save the Result to the Database in a single Transaction
    const newFile = await prisma.$transaction(async (tx) => {
      const fileRecord = await tx.fileUpload.create({
        data: {
          filename: `${cloudinaryResult.public_id}.${cloudinaryResult.format}`,
          originalName: fileField.filename || 'untitled',
          cloudinaryUrl: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          resourceType: cloudinaryResult.resource_type,
          format: cloudinaryResult.format,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          size: cloudinaryResult.bytes,
          mimeType: fileField.type || 'application/octet-stream',
          uploadedBy: currentUser.id,
          folder: folder, // Using the folder variable from the input
          tags: tags ? tags.join(',') : null, // Using the tags variable from the input
        },
      });

      // Log activity (adapted from the example)
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "UPLOAD_FILE",
          description: `Uploaded a new file: "${fileRecord.originalName}" (ID: ${fileRecord.id})`,
          ipAddress: getClientIP(event),
          userAgent: getHeader(event, "user-agent"),
        }
      });

      return fileRecord;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Send Success Response (adapted from the example format)
    return responses.created(
      {
        file: {
          id: newFile.id,
          filename: newFile.filename,
          url: newFile.cloudinaryUrl,
          size: newFile.size,
          mimeType: newFile.mimeType,
          createdAt: newFile.createdAt,
        },
      },
      "File uploaded successfully.",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/files/${newFile.id}`, // Assuming there's an endpoint to get file details
          view: newFile.cloudinaryUrl,
        }
      }
    );

  } catch (error: any) {
    // 7. Comprehensive Error Handling (adapted from the example)
    const errorMessage = error instanceof Error ? error.message : "A server error occurred.";
    console.error(`[File Upload Error] RequestID: ${requestId}`, error);

    return responses.serverError(
      "Failed to process file upload.",
      process.env.NODE_ENV === "development" ? errorMessage : "Please try again later.",
      { requestId, event, code: "FILE_UPLOAD_ERROR" }
    );
  }
});