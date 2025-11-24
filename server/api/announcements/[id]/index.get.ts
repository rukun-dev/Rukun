// server/api/announcements/[id].get.ts

import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Skema untuk memvalidasi parameter ID dari URL
// Menggunakan .cuid() untuk memastikan format ID sesuai dengan yang digenerate Prisma
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid announcement ID format." }),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event, event.context.auth?.user?.id);

  try {
    // 1. Validasi ID dari parameter rute
    // getValidatedRouterParams adalah helper dari Nuxt 3 untuk validasi
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    // 2. Autentikasi user
    const currentUser = await requireAuth(event);

    // 3. Ambil data pengumuman dari database
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true },
        },
        recipients: true, // Sertakan data penerima untuk logic otorisasi
      },
    });

    // 4. Handle jika pengumuman tidak ditemukan
    if (!announcement) {
      return responses.notFound("Announcement not found.", { requestId, event });
    }

    // 5. Otorisasi: Periksa apakah user berhak melihat pengumuman ini
    const isAdmin = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(
      currentUser.role,
    );

    // Jika user bukan admin, lakukan pengecekan yang lebih ketat
    if (!isAdmin) {
      // a. Pengumuman harus sudah di-publish dan belum kedaluwarsa
      if (
        !announcement.isPublished ||
        (announcement.expiresAt && announcement.expiresAt < new Date())
      ) {
        // Mengembalikan 404 agar tidak membocorkan keberadaan pengumuman
        return responses.notFound("Announcement not found.", { requestId, event });
      }

      // b. User harus termasuk dalam daftar penerima
      const isRecipient = announcement.recipients.some(
        (recipient) =>
          recipient.recipientType === "ALL" ||
          (recipient.recipientType === "ROLE" &&
            recipient.recipientId === currentUser.role) ||
          (recipient.recipientType === "SPECIFIC" &&
            recipient.recipientId === currentUser.id),
      );

      if (!isRecipient) {
        // Mengembalikan 404 agar tidak membocorkan keberadaan pengumuman
        return responses.notFound("Announcement not found.", { requestId, event });
      }
    }

    // 6. Kirim respons sukses jika semua pengecekan berhasil
    return responses.ok(announcement, "Announcement retrieved successfully.", {
      requestId,
      event,
      userId: currentUser.id,
      links: {
        self: `/api/announcements/${id}`,
        collection: "/api/announcements",
      },
    });
  } catch (error: unknown) {
    const errorOptions = { requestId, event };

    // Penanganan error Zod untuk parameter yang tidak valid
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.badRequest(
        firstError?.message || "Invalid request parameters.",
        firstError?.path.join("."),
        error.format(),
        errorOptions,
      );
    }

    // Penanganan error otentikasi/otorisasi dari `requireAuth`
    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, errorOptions);
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, errorOptions);
      }
    }

    // Penanganan error server umum
    return responses.serverError(
      "Failed to retrieve the announcement.",
      error,
      errorOptions,
    );
  }
});