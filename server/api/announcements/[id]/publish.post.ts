import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Skema untuk memvalidasi parameter ID dari URL.
// Sama seperti di endpoint GET [id] dan PUT [id].
const paramsSchema = z.object({
  id: z.string().cuid({ message: "Invalid announcement ID format." }),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);

  try {
    // 1. Validasi ID dari parameter rute
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    // 2. Autentikasi & Otorisasi
    // Hanya user dengan peran admin yang bisa melakukan publish
    const currentUser = await requireAuth(event);
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden("You don't have permission to publish announcements.", { requestId, event });
    }

    // 3. Cari pengumuman yang akan di-publish
    const announcementToPublish = await prisma.announcement.findUnique({
      where: { id },
    });

    // 4. Handle jika pengumuman tidak ditemukan
    if (!announcementToPublish) {
      return responses.notFound("The announcement you are trying to publish does not exist.", { requestId, event });
    }

    // 5. Handle jika pengumuman sudah di-publish sebelumnya
    if (announcementToPublish.isPublished) {
      // Menggunakan 400 Bad Request karena ini adalah kesalahan state dari client (mencoba publish sesuatu yang sudah publish)
      return responses.badRequest(
        "This announcement has already been published.",
        "state", // field/konteks error
        null,    // detail error
        { requestId, event }
      );
    }

    // 6. Lakukan update: set isPublished menjadi true dan catat waktu publish
    const publishedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(), // Catat waktu saat ini sebagai waktu publish
      },
      // Sertakan relasi untuk respons yang konsisten dengan endpoint lain
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
        recipients: true,
      },
    });

    // 7. Kirim respons sukses
    return responses.ok(
      publishedAnnouncement,
      "Announcement published successfully.",
      {
        requestId,
        event,
        userId: currentUser.id,
        links: {
          self: `/api/announcements/${id}`,
        },
      }
    );

  } catch (error: unknown) {
    const errorOptions = { requestId, event };

    // Penanganan error validasi Zod dari parameter URL
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.badRequest(
        firstError?.message || "Invalid request parameters.",
        firstError?.path.join("."),
        error.format(),
        errorOptions
      );
    }

    // Penanganan error autentikasi/otorisasi
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
      "Failed to publish announcement.",
      error,
      errorOptions
    );
  }
});

