import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses, calculatePagination } from "~~/server/utils/response";
import type { Prisma, AnnouncementType, Priority } from "@prisma/client";

// Definisikan enum untuk validasi
const AnnouncementTypeEnum = z.enum(["INFO", "WARNING", "DANGER"]).optional();
const PriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]).optional();

// Skema untuk validasi query params.
// 'isPublished' dan 'forMe' tidak ada karena sudah menjadi logika utama endpoint ini.
const publishedQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: AnnouncementTypeEnum,
  priority: PriorityEnum,
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);

  try {
    // 1. Autentikasi: Setiap user yang login bisa melihat pengumuman yang dipublikasi
    const currentUser = await requireAuth(event);

    // 2. Validasi Query Params
    const query = getQuery(event);
    const validatedQuery = publishedQuerySchema.parse(query);
    const { page, limit, search, type, priority } = validatedQuery;

    // 3. Bangun klausa 'where' untuk query Prisma
    const whereClause: Prisma.AnnouncementWhereInput = {
      // Filter WAJIB untuk endpoint ini:
      isPublished: true,
      // Filter WAJIB: Pastikan pengumuman belum kedaluwarsa
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
      // Filter WAJIB: Hanya untuk user yang berhak (sesuai recipients)
      recipients: {
        some: {
          OR: [
            { recipientType: "ALL" },
            { recipientType: "ROLE", recipientId: currentUser.role },
            { recipientType: "SPECIFIC", recipientId: currentUser.id },
          ],
        },
      },
    };

    // Tambahkan filter opsional dari query params
    if (search) {
      whereClause.AND = [
        ...(Array.isArray(whereClause.AND) ? whereClause.AND : []),
        {
          OR: [
            // PERBAIKAN: Menghapus `mode: "insensitive"` untuk kompatibilitas
            { title: { contains: search } },
            { content: { contains: search } },
          ],
        },
      ];
    }
    if (type) whereClause.type = type as AnnouncementType;
    if (priority) whereClause.priority = priority as Priority;

    // 4. Lakukan query ke database
    const skip = (page - 1) * limit;
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where: whereClause,
        orderBy: { publishedAt: "desc" }, // Urutkan berdasarkan kapan di-publish
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, role: true },
          },
        },
      }),
      prisma.announcement.count({ where: whereClause }),
    ]);

    // 5. Siapkan metadata paginasi
    const pagination = calculatePagination(page, limit, totalCount);
    
    // 6. Kirim respons sukses
    return responses.ok(
      { announcements },
      "Published announcements retrieved successfully",
      {
        requestId,
        event,
        pagination,
        userId: currentUser.id,
      },
    );

  } catch (error: unknown) {
    const errorOptions = { requestId, event };
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid query parameters",
        firstError?.path.join('.'),
        error.format(),
        errorOptions
      );
    }
    
    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, errorOptions);
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, errorOptions);
      }
    }

    return responses.serverError(
      "Failed to retrieve published announcements",
      error,
      errorOptions,
    );
  }
});

