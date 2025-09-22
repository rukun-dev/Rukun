import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Query validator untuk pagination & filter
const familyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to view families",
        { requestId, event },
      );
    }

    // Validate query
    const query = getQuery(event);
    const validated = familyQuerySchema.parse(query);
    const { page, limit, search, kelurahan, kecamatan, kabupaten, provinsi } =
      validated;

    // Build filter
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { headName: { contains: search, mode: "insensitive" } },
        { noKk: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }
    if (kelurahan) whereClause.kelurahan = { contains: kelurahan, mode: "insensitive" };
    if (kecamatan) whereClause.kecamatan = { contains: kecamatan, mode: "insensitive" };
    if (kabupaten) whereClause.kabupaten = { contains: kabupaten, mode: "insensitive" };
    if (provinsi) whereClause.provinsi = { contains: provinsi, mode: "insensitive" };

    // Pagination
    const skip = (page - 1) * limit;

    // Query DB
    const [families, totalCount] = await Promise.all([
      prisma.family.findMany({
        where: whereClause,
        include: {
          members: {
            select: {
              id: true,
              relationship: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.family.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        families: families.map((fam) => ({
          id: fam.id,
          no_kk: fam.noKk,
          name: fam.name,
          head_name: fam.headName,
          address: fam.address,
          rt_number: fam.rtNumber,
          rw_number: fam.rwNumber,
          kelurahan: fam.kelurahan,
          kecamatan: fam.kecamatan,
          kabupaten: fam.kabupaten,
          provinsi: fam.provinsi,
          postal_code: fam.postalCode,
          created_at: fam.createdAt.toISOString(),
          updated_at: fam.updatedAt.toISOString(),
          created_by: fam.createdById,
        })),
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
          kelurahan: kelurahan || null,
          kecamatan: kecamatan || null,
          kabupaten: kabupaten || null,
          provinsi: provinsi || null,
        },
      },
      "Families retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/families",
          ...(hasNext
            ? { next: `/api/families?page=${page + 1}&limit=${limit}` }
            : {}),
          ...(hasPrevious
            ? { previous: `/api/families?page=${page - 1}&limit=${limit}` }
            : {}),
        },
      },
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

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";

    return responses.serverError(
      "Failed to retrieve families",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "FAMILIES_GET_ERROR" },
    );
  }
});
