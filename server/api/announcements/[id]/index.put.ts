import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { Prisma } from "@prisma/client";
import type { AnnouncementType, Priority, RecipientType } from "@prisma/client";

// Definisikan enum untuk validasi, cocokkan dengan schema.prisma
const AnnouncementTypeEnum = z.enum(["INFO", "WARNING", "DANGER"]);
const PriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]);
const RecipientTypeEnum = z.enum(["ALL", "ROLE", "SPECIFIC"]);

// Skema untuk validasi parameter ID dari URL
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid announcement ID format." }),
});

// Skema untuk validasi body request (semua field opsional untuk update)
const updateAnnouncementSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long").optional(),
  content: z.string().min(10, "Content must be at least 10 characters long").optional(),
  type: AnnouncementTypeEnum.optional(),
  priority: PriorityEnum.optional(),
  isPublished: z.boolean().optional(),
  expiresAt: z.string().datetime({ message: "Invalid datetime format for expiresAt" }).optional().nullable()
    .refine((val) => !val || new Date(val) > new Date(), {
      message: "Expiration date must be in the future",
    }),
  recipients: z.array(z.object({
    recipientType: RecipientTypeEnum,
    recipientId: z.string().optional().nullable(),
  })).min(1, "At least one recipient is required").optional(), // Recipients juga opsional
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);

  try {
    // 1. Validasi ID dari parameter rute
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    // 2. Autentikasi & Otorisasi: Hanya admin yang boleh mengedit
    const currentUser = await requireAuth(event);
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden("You don't have permission to update announcements.", { requestId, event });
    }

    // 3. Baca dan validasi body
    const body = await readBody(event);
    if (Object.keys(body).length === 0) {
      return responses.badRequest("Request body cannot be empty.", "body", null, { requestId, event });
    }
    const validatedBody = updateAnnouncementSchema.parse(body);

    // 4. Lakukan update dalam satu transaksi
    const updatedAnnouncement = await prisma.$transaction(async (tx) => {
      // Langkah A: Cek apakah pengumuman ada
      const existingAnnouncement = await tx.announcement.findUnique({
        where: { id },
      });
      if (!existingAnnouncement) {
        // Melempar error spesifik untuk ditangkap di blok catch
        throw new Prisma.PrismaClientKnownRequestError("Announcement not found.", {
          code: 'P2025',
          clientVersion: 'x.x.x',
          meta: { target: ['announcement'] }
        });
      }

      // Langkah B: Siapkan data untuk diupdate
      const dataToUpdate: Prisma.AnnouncementUpdateInput = {};
      if (validatedBody.title) dataToUpdate.title = validatedBody.title;
      if (validatedBody.content) dataToUpdate.content = validatedBody.content;
      if (validatedBody.type) dataToUpdate.type = validatedBody.type as AnnouncementType;
      if (validatedBody.priority) dataToUpdate.priority = validatedBody.priority as Priority;
      if (validatedBody.expiresAt !== undefined) dataToUpdate.expiresAt = validatedBody.expiresAt ? new Date(validatedBody.expiresAt) : null;

      // Logika khusus untuk 'isPublished'
      // Jika status berubah menjadi 'published', set 'publishedAt'
      if (typeof validatedBody.isPublished === 'boolean' && validatedBody.isPublished !== existingAnnouncement.isPublished) {
        dataToUpdate.isPublished = validatedBody.isPublished;
        if (validatedBody.isPublished) {
          dataToUpdate.publishedAt = new Date();
        } else {
          dataToUpdate.publishedAt = null; // Menjadi draft kembali
        }
      }

      // Langkah C: Update data pengumuman utama
      await tx.announcement.update({
        where: { id },
        data: dataToUpdate,
      });

      // Langkah D: Handle recipients (delete-and-replace strategy)
      // Hanya berjalan jika field 'recipients' ada di request body
      if (validatedBody.recipients) {
        // Hapus semua penerima yang ada
        await tx.announcementRecipient.deleteMany({
          where: { announcementId: id },
        });

        // Buat ulang penerima yang baru
        const recipientData = validatedBody.recipients.map(r => ({
          announcementId: id,
          recipientType: r.recipientType as RecipientType,
          recipientId: r.recipientId,
        }));

        await tx.announcementRecipient.createMany({
          data: recipientData,
        });
      }

      // Langkah E: Ambil data terbaru untuk dikirim sebagai respons
      return tx.announcement.findUnique({
        where: { id },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          recipients: true,
        },
      });
    });

    // 5. Kirim respons sukses
    return responses.ok(
      updatedAnnouncement,
      "Announcement updated successfully",
      {
        requestId,
        event,
        links: {
          self: `/api/announcements/${id}`,
          collection: "/api/announcements",
        },
      },
    );

  } catch (error: unknown) {
    const errorOptions = { requestId, event };

    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid request body",
        firstError?.path[0]?.toString(),
        error.format(),
        errorOptions
      );
    }
    
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return responses.notFound("The announcement you are trying to update does not exist.", errorOptions);
    }

    // --- PERBAIKAN DI SINI ---
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
      "Failed to update announcement",
      error,
      errorOptions,
    );
  }
});

