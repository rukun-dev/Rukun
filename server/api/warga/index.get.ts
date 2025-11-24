// server/api/warga/index.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Schema untuk validasi query params
const wargaQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Role check (misalnya hanya admin & pengurus yang bisa lihat)
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to view warga data",
        { requestId, event },
      );
    }

    // Query params
    const query = getQuery(event);
    const validatedQuery = wargaQuerySchema.parse(query);

    const { page, limit, search, isActive } = validatedQuery;

    // Build where clause
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { nik: { contains: search } },
        { noKk: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (typeof isActive === "boolean") {
      whereClause.isActive = isActive;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Ambil data warga
    const [wargas, totalCount] = await Promise.all([
      prisma.warga.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.warga.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        data: wargas,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit,
          has_next: hasNext,
          has_previous: hasPrevious,
          next_page: hasNext ? page + 1 : null,
          previous_page: hasPrevious ? page - 1 : null,
        },
        filters_applied: {
          search: search || null,
          is_active: typeof isActive === "boolean" ? isActive : null,
        },
      },
      "Warga data retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/warga",
          ...(hasNext
            ? { next: `/api/warga?page=${page + 1}&limit=${limit}` }
            : {}),
          ...(hasPrevious
            ? { previous: `/api/warga?page=${page - 1}&limit=${limit}` }
            : {}),
        },
      },
    );
  } catch (error: unknown) {
    // Zod error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid query parameters",
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

    // Auth error
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

    // Prisma constraint error
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.serverError(
          "Database constraint error",
          process.env.NODE_ENV === "development"
            ? prismaError.message
            : undefined,
          { requestId, event, code: "DATABASE_CONSTRAINT_ERROR" },
        );
      }
    }

    // Generic error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to retrieve warga data",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "WARGA_GET_ERROR" },
    );
  }
});
