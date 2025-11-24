import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses, calculatePagination } from "~~/server/utils/response"; // Menggunakan utilitas response Anda
// PERBAIKAN: Impor tipe Enum dari Prisma Client
import type { Prisma, AnnouncementType, Priority } from "@prisma/client";

// Definisikan enum untuk validasi, cocokkan dengan schema.prisma Anda
const AnnouncementTypeEnum = z.enum(["INFO", "WARNING", "DANGER"]).optional();
const PriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]).optional();

// Skema untuk validasi query params
const announcementQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: AnnouncementTypeEnum,
  priority: PriorityEnum,
  isPublished: z.coerce.boolean().optional(),
  // Filter khusus untuk mengambil pengumuman yang ditujukan ke user saat ini
  forMe: z.coerce.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  // Menggunakan startRequest dari utilitas response Anda
  const requestId = startRequest(event);

  try {
    // 1. Autentikasi: Setiap user yang login bisa melihat pengumuman
    const currentUser = await requireAuth(event);

    // 2. Validasi Query Params
    const query = getQuery(event);
    const validatedQuery = announcementQuerySchema.parse(query);

    const { page, limit, search, type, priority, isPublished, forMe } = validatedQuery;

    // 3. Bangun klausa 'where' untuk query Prisma secara dinamis
    const whereClause: Prisma.AnnouncementWhereInput = {};

    if (search) {
      // PERBAIKAN: Menghapus `mode: "insensitive"` untuk kompatibilitas database yang lebih luas.
      // Pencarian ini sekarang akan case-sensitive. Tambahkan kembali `mode` jika database Anda mendukungnya (misal: PostgreSQL).
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (type) {
      // PERBAIKAN: Lakukan type casting untuk mengatasi error Tipe
      whereClause.type = type as AnnouncementType;
    }

    if (priority) {
      // PERBAIKAN: Lakukan type casting untuk mengatasi error Tipe
      whereClause.priority = priority as Priority;
    }

    if (typeof isPublished === "boolean") {
      whereClause.isPublished = isPublished;
    }

    // PERBAIKAN LOGIKA: Filter 'forMe' hanya berlaku untuk user biasa.
    // Admin dan pengurus akan melewati filter ini untuk dapat melihat semua pengumuman.
    if (forMe && !["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      whereClause.recipients = {
        some: {
          OR: [
            // 1. Untuk semua orang
            { recipientType: "ALL" },
            // 2. Berdasarkan peran user
            { recipientType: "ROLE", recipientId: currentUser.role },
            // 3. Ditujukan spesifik ke user ID
            { recipientType: "SPECIFIC", recipientId: currentUser.id },
          ],
        },
      };
    }

    // 4. Lakukan query ke database
    const skip = (page - 1) * limit;
    const [announcements, totalCount] = await Promise.all([
      prisma.announcement.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          recipients: true, // Sertakan penerima untuk debugging atau tampilan di frontend
        },
      }),
      prisma.announcement.count({ where: whereClause }),
    ]);

    // 5. Siapkan metadata paginasi menggunakan helper Anda
    const pagination = calculatePagination(page, limit, totalCount);

    const appliedFilters = {
      search: search || null,
      type: type || null,
      priority: priority || null,
      is_published: typeof isPublished === "boolean" ? isPublished : null,
      for_me: forMe || null,
    };
    
    // 6. Kirim respons sukses menggunakan utilitas response Anda
    return responses.ok(
      { 
        announcements,
        filters_applied: appliedFilters,
      },
      "Announcements retrieved successfully",
      {
        requestId,
        event,
        pagination,
        userId: currentUser.id,
        links: {
          self: `/api/announcements?page=${page}&limit=${limit}`,
          next: pagination.has_next ? `/api/announcements?page=${page + 1}&limit=${limit}` : undefined,
          prev: pagination.has_prev ? `/api/announcements?page=${page - 1}&limit=${limit}` : undefined,
        },
      },
    );

  } catch (error: unknown) {
    const errorOptions = { requestId, event };
    // Penanganan error (Zod, Auth, dll.)
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
      "Failed to retrieve announcements",
      error,
      errorOptions,
    );
  }
});

