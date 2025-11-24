/**
 * @file Endpoint untuk menghapus template dokumen berdasarkan ID.
 * @description Menghapus record template dokumen secara permanen.
 * Aksi ini dibatasi untuk peran tertentu dan akan dicegah jika template sudah digunakan.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Skema validasi untuk parameter ID dari URL
const templateIdParamSchema = z.object({
  id: z.string().cuid({ message: "Format ID template tidak valid." }),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);
    // Hanya peran dengan hak akses tinggi yang boleh menghapus template
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "Anda tidak memiliki izin untuk menghapus template.",
        { requestId, event }
      );
    }

    // 2. Validasi Parameter ID dari Route
    const { id } = await getValidatedRouterParams(event, (rawParams) =>
      templateIdParamSchema.parse(rawParams)
    );

    // 3. Cek Keberadaan Template dan Ketergantungannya
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        // Cek apakah ada dokumen yang dibuat menggunakan template ini
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!template) {
      return responses.notFound("Template dokumen tidak ditemukan.", { requestId, event });
    }

    // 4. Mencegah Penghapusan Jika Template Sudah Digunakan
    if (template._count.documents > 0) {
      return responses.badRequest(
        `Template tidak dapat dihapus karena telah digunakan untuk membuat ${template._count.documents} dokumen.`,
        undefined,
        {
          suggestion: "Nonaktifkan template ini jika tidak ingin digunakan lagi.",
          related_documents: template._count.documents,
        },
        { requestId, event, code: "DELETE_PREVENTION_USED_TEMPLATE" }
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // 5. Lakukan Penghapusan dalam Transaksi
    await prisma.$transaction(async (tx) => {
      // Catat aktivitas penghapusan
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_TEMPLATE",
          description: `Menghapus template dokumen: "${template.name}" (ID: ${template.id})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Hapus template
      await tx.documentTemplate.delete({
        where: { id },
      });
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Kirim Respons Sukses
    return responses.ok(
      {
        deleted: true,
        template_id: id,
        deleted_template: {
          name: template.name,
          type: template.type,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
        },
      },
      "Template dokumen berhasil dihapus.",
      {
        requestId,
        event,
        executionTime,
        links: {
          collection: "/api/documents/templates",
          create_new: "/api/documents/templates/ai",
          activity_logs: `/api/users/${currentUser.id}/activities`,
        },
      }
    );

  } catch (error: unknown) {
    // 7. Penanganan Error
    if (error instanceof z.ZodError) {
      return responses.validation(
        error.issues[0]?.message || "Format ID tidak valid.",
        error.issues[0]?.path[0]?.toString(),
        { issues: error.issues },
        { requestId, event }
      );
    }

    // Handle error dari Prisma (misal, record tidak ditemukan saat proses delete)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Template dokumen tidak ditemukan saat mencoba menghapus.", { requestId, event });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return responses.serverError(
      "Gagal menghapus template dokumen.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "TEMPLATE_DELETE_ERROR" }
    );
  }
});
