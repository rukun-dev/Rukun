// server/api/documents/index.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Validator query
const documentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  wargaId: z.string().optional(),
  requesterId: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden("You don't have permission to view documents", {
        requestId,
        event,
      });
    }

    // Query params
    const query = getQuery(event);
    const { page, limit, type, status, search, wargaId, requesterId } =
      documentQuerySchema.parse(query);

    const whereClause: any = {};

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;
    if (wargaId) whereClause.wargaId = wargaId;
    if (requesterId) whereClause.requesterId = requesterId;

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { number: { contains: search, mode: "insensitive" } },
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Query documents
    const [documents, totalCount] = await Promise.all([
      prisma.document.findMany({
        where: whereClause,
        include: {
          requester: {
            select: { id: true, name: true, email: true, role: true },
          },
          warga: {
            select: { id: true, name: true, nik: true },
          },
          template: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        documents: documents.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          status: doc.status,
          number: doc.number,
          file_path: doc.filePath,
          file_size: doc.fileSize,
          mime_type: doc.mimeType,
          created_at: doc.createdAt.toISOString(),
          updated_at: doc.updatedAt.toISOString(),
          requester: doc.requester,
          warga: doc.warga,
          template: doc.template,
        })),
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit,
          has_next: page < totalPages,
          has_previous: page > 1,
          next_page: page < totalPages ? page + 1 : null,
          previous_page: page > 1 ? page - 1 : null,
        },
        filters_applied: { type, status, search, wargaId, requesterId },
      },
      "Documents retrieved successfully",
      { requestId, event, executionTime },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid query parameters",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
        },
        { requestId, event },
      );
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Failed to retrieve documents",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENTS_GET_ERROR" },
    );
  }
});
