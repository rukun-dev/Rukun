/**
 * @file Endpoint untuk mengambil daftar semua template dokumen.
 * @description Mengembalikan daftar template dengan paginasi, pencarian, dan pengurutan.
 * Konten template tidak disertakan untuk menjaga respons tetap ringan.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Skema validasi untuk query parameter
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'type', 'createdAt', 'updatedAt']).default('createdAt'),
  orderBy: z.enum(['asc', 'desc']).default('desc'),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "STAFF", "BENDAHARA", "WARGA"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "Anda tidak memiliki izin untuk melihat daftar template.",
        { requestId, event }
      );
    }

    // 2. Validasi Query Parameter
    const queries = await getValidatedQuery(event, (rawQueries) =>
      querySchema.parse(rawQueries)
    );
    const { page, limit, search, sortBy, orderBy } = queries;
    
    // 3. Persiapkan Opsi Query untuk Prisma
    const skip = (page - 1) * limit;
    const whereClause = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive', // Case-insensitive search
          },
        }
      : {};

    // 4. Ambil Data dan Total Count dari Database
    const [templates, total] = await prisma.$transaction([
      prisma.documentTemplate.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          type: true,
          // DIHAPUS: Baris ini tidak lagi mengambil status isActive dari database
          // isActive: true, 
          variables: true,
          createdAt: true,
          updatedAt: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: orderBy,
        },
      }),
      prisma.documentTemplate.count({
        where: whereClause,
      }),
    ]);

    // 5. Hitung Metadata Paginasi
    const totalPages = Math.ceil(total / limit);

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Kirim Respons Sukses
    return responses.ok(
      {
        data: templates.map(template => ({
            id: template.id,
            name: template.name,
            type: template.type,
            // DIHAPUS: Baris ini tidak lagi menampilkan is_active di objek respons
            // is_active: template.isActive,
            variables_count: (JSON.parse(template.variables as string || '[]')).length,
            created_at: template.createdAt.toISOString(),
            updated_at: template.updatedAt.toISOString(),
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
      "Daftar template berhasil diambil.",
      {
        requestId,
        event,
        executionTime,
        links: {
            self: `/api/documents/templates?page=${page}&limit=${limit}`,
            first: `/api/documents/templates?page=1&limit=${limit}`,
            last: `/api/documents/templates?page=${totalPages}&limit=${limit}`,
            ...(page > 1 && { prev: `/api/documents/templates?page=${page - 1}&limit=${limit}`}),
            ...(page < totalPages && { next: `/api/documents/templates?page=${page + 1}&limit=${limit}`}),
        }
      }
    );

  } catch (error: unknown) {
    // 7. Penanganan Error
    if (error instanceof z.ZodError) {
      return responses.validation(
        "Query parameter tidak valid.",
        error.issues[0]?.path[0]?.toString(),
        { issues: error.issues },
        { requestId, event }
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan internal.";
    return responses.serverError(
      "Gagal mengambil daftar template dokumen.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "TEMPLATE_LIST_FETCH_ERROR" }
    );
  }
});
