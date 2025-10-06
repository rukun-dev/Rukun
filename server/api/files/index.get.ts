/**
 * @file Endpoint to retrieve a list of all uploaded files.
 * @description Returns a paginated, searchable, and sortable list of files.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Schema to validate query parameters
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['filename', 'size', 'resourceType', 'createdAt']).default('createdAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Authentication & Authorization
    const currentUser = await requireAuth(event);
    // Adjust allowed roles if necessary
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "STAFF", "BENDAHARA"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "You do not have permission to view the file list.",
        { requestId, event }
      );
    }

    // 2. Validate Query Parameters
    const queries = await getValidatedQuery(event, (rawQueries) =>
      querySchema.parse(rawQueries)
    );
    const { page, limit, search, sortBy, orderBy } = queries;
    
    // 3. Prepare Query Options for Prisma
    const skip = (page - 1) * limit;
    const whereClause = search
      ? {
          OR: [
            { filename: { contains: search, mode: 'insensitive' } },
            { originalName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // 4. Fetch Data and Total Count from the Database
    const [files, total] = await prisma.$transaction([
      prisma.fileUpload.findMany({
        where: whereClause,
        select: {
          id: true,
          filename: true,
          originalName: true,
          cloudinaryUrl: true,
          resourceType: true,
          format: true,
          size: true,
          mimeType: true,
          folder: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: orderBy,
        },
      }),
      prisma.fileUpload.count({
        where: whereClause,
      }),
    ]);

    // 5. Calculate Pagination Metadata
    const totalPages = Math.ceil(total / limit);
    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Send Success Response
    return responses.ok(
      {
        data: files.map(file => ({
            id: file.id,
            file_name: file.filename,
            original_name: file.originalName,
            url: file.cloudinaryUrl,
            resource_type: file.resourceType,
            format: file.format,
            size_in_bytes: file.size,
            mime_type: file.mimeType,
            folder: file.folder,
            created_at: file.createdAt.toISOString(),
        })),
        meta: {
            total,
            page,
            limit,
            total_pages: totalPages,
            has_prev_page: page > 1,
            has_next_page: page < totalPages,
        }
      },
      "File list retrieved successfully.",
      {
        requestId,
        event,
        executionTime,
        links: {
            self: `/api/files?page=${page}&limit=${limit}`,
            first: `/api/files?page=1&limit=${limit}`,
            last: `/api/files?page=${totalPages}&limit=${limit}`,
            ...(page > 1 && { prev: `/api/files?page=${page - 1}&limit=${limit}`}),
            ...(page < totalPages && { next: `/api/files?page=${page + 1}&limit=${limit}`}),
        }
      }
    );

  } catch (error: unknown) {
    // 7. Error Handling
    if (error instanceof z.ZodError) {
      return responses.validation(
        "Invalid query parameters.",
        error.issues[0]?.path[0]?.toString(),
        { issues: error.issues },
        { requestId, event }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "An internal error occurred.";
    return responses.serverError(
      "Failed to retrieve file list.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "FILE_LIST_FETCH_ERROR" }
    );
  }
});

