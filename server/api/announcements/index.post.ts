import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import type { AnnouncementType, Priority, RecipientType } from "@prisma/client";

// Asumsi enums ini ada di Prisma Client, kita akan memvalidasi berdasarkan itu
// Ini hanya untuk referensi, Zod akan menggunakan nativeEnum dari Prisma Client
const AnnouncementTypeEnum = z.enum(["INFO", "WARNING", "DANGER"]);
const PriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]);
const RecipientTypeEnum = z.enum(["ALL", "ROLE", "SPECIFIC"]);

// Skema untuk validasi body request
const createAnnouncementSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(5, "Title must be at least 5 characters long"),
  content: z.string({ required_error: "Content is required" }).min(10, "Content must be at least 10 characters long"),
  type: AnnouncementTypeEnum.default("INFO"),
  priority: PriorityEnum.default("NORMAL"),
  isPublished: z.boolean().default(false),
  expiresAt: z.string().datetime({ message: "Invalid datetime format for expiresAt" }).optional().nullable()
    .refine((val) => !val || new Date(val) > new Date(), {
      message: "Expiration date must be in the future",
    }),
  recipients: z.array(z.object({
    recipientType: RecipientTypeEnum,
    // recipientId bisa berupa role name atau user ID, tergantung recipientType
    recipientId: z.string().optional().nullable(),
  })).min(1, "At least one recipient is required"),
});


export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to create announcements",
        { requestId, event },
      );
    }

    // 2. Baca dan validasi body
    const body = await readBody(event);
    const validatedBody = createAnnouncementSchema.parse(body);

    const {
      title,
      content,
      type,
      priority,
      isPublished,
      expiresAt,
      recipients,
    } = validatedBody;

    // 3. Buat pengumuman dan penerima dalam satu transaksi
    const newAnnouncement = await prisma.$transaction(async (tx) => {
      // Langkah A: Buat entitas Announcement utama
      const announcement = await tx.announcement.create({
        data: {
          title,
          content,
          type: type as AnnouncementType,
          priority: priority as Priority,
          isPublished,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          publishedAt: isPublished ? new Date() : null, // Jika langsung publish, catat waktunya
          createdById: currentUser.id,
        },
      });

      // Langkah B: Siapkan data penerima
      const recipientData = recipients.map(r => ({
        announcementId: announcement.id,
        recipientType: r.recipientType as RecipientType,
        recipientId: r.recipientId,
      }));

      // Langkah C: Buat semua entitas AnnouncementRecipient
      await tx.announcementRecipient.createMany({
        data: recipientData,
      });

      // Kembalikan data pengumuman yang baru dibuat untuk disertakan dalam response
      // Kita perlu query lagi untuk mendapatkan relasi createdBy
      return tx.announcement.findUnique({
        where: { id: announcement.id },
        include: {
          createdBy: {
            select: { id: true, name: true, role: true },
          },
          recipients: true, // Sertakan juga data penerima dalam response
        },
      });
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // 4. Kirim response sukses
    return responses.created(
      newAnnouncement,
      "Announcement created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/announcements/${newAnnouncement?.id}`,
          collection: "/api/announcements",
        },
      },
    );

  } catch (error: unknown) {
    // Penanganan error (Zod, Auth, Prisma, dll.)
    // Dicuplik dari contoh yang Anda berikan untuk konsistensi
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid request body",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path.join('.');
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

    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, { requestId, event });
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, { requestId, event });
      }
      throw error;
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to create announcement",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "ANNOUNCEMENT_CREATE_ERROR" },
    );
  }
});
