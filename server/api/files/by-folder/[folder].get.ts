// server/api/files/by-folder/[folder].get.ts

/**
 * @file Endpoint to retrieve files belonging to a specific folder.
 * @description Returns a paginated, searchable, and sortable list of files filtered by a folder name.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Schema to validate query parameters (for pagination, sorting, etc.)
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['filename', 'size', 'resourceType', 'createdAt']).default('createdAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

// Schema to validate the route parameter
const folderParamSchema = z.object({
  folder: z.string().min(1, { message: "Folder name cannot be empty." }),
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
        "You do not have permission to view this file list.",
        { requestId, event }
      );
    }

    // 2. Validate Route and Query Parameters
    const { folder } = await getValidatedRouterParams(event, (params) => folderParamSchema.parse(params));
    const { page, limit, search, sortBy, orderBy } = await getValidatedQuery(event, (queries) => querySchema.parse(queries));
    
    // 3. Prepare Query Options for Prisma
    const skip = (page - 1) * limit;
    
    // The main difference: We add a mandatory filter for the 'folder' field.
    // We can also combine it with an optional search term.
    const whereClause: any = {
      folder: folder, // Filter by the folder name from the URL
    };

    if (search) {
      whereClause.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
      ];
    }

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
      `File list for folder '${folder}' retrieved successfully.`,
      {
        requestId,
        event,
        executionTime,
        links: {
            self: `/api/files/by-folder/${folder}?page=${page}&limit=${limit}`,
            first: `/api/files/by-folder/${folder}?page=1&limit=${limit}`,
            last: `/api/files/by-folder/${folder}?page=${totalPages}&limit=${limit}`,
            ...(page > 1 && { prev: `/api/files/by-folder/${folder}?page=${page - 1}&limit=${limit}` }),
            ...(page < totalPages && { next: `/api/files/by-folder/${folder}?page=${page + 1}&limit=${limit}` }),
        }
      }
    );

  } catch (error: unknown) {
    // 7. Error Handling
    if (error instanceof z.ZodError) {
      return responses.validation(
        "Invalid parameters.",
        error.issues[0]?.path[0]?.toString(),
        { issues: error.issues },
        { requestId, event }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "An internal error occurred.";
    return responses.serverError(
      "Failed to retrieve file list by folder.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "FILE_LIST_BY_FOLDER_FETCH_ERROR" }
    );
  }
});