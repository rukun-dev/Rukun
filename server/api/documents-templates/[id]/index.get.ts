/**
 * @file Endpoint untuk mengambil detail satu template dokumen berdasarkan ID.
 * @description Mengembalikan data lengkap dari sebuah template, termasuk konten HTML-nya.
 */

import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Skema untuk memvalidasi parameter ID dari URL
const templateIdParamSchema = z.object({
  id: z.string().cuid("Format ID template tidak valid."),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Autentikasi & Otorisasi
    // Asumsinya, semua role yang bisa melihat daftar, bisa juga melihat detailnya.
    const currentUser = await requireAuth(event);
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "STAFF", "BENDAHARA", "WARGA"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "Anda tidak memiliki izin untuk melihat detail template.",
        { requestId, event }
      );
    }

    // 2. Validasi Parameter ID
    const { id } = templateIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // 3. Ambil data template dari database
    const template = await prisma.documentTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        content: true, // Konten disertakan karena ini adalah halaman detail
        type: true,
        // DIHAPUS: Baris ini tidak lagi mengambil status isActive dari database
        // isActive: true,
        variables: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 4. Jika template tidak ditemukan, kirim respons 404
    if (!template) {
      return responses.notFound("Template dokumen tidak ditemukan.", { requestId, event });
    }

    // 5. Format data untuk respons
    const responseData = {
      id: template.id,
      name: template.name,
      content: template.content,
      type: template.type,
      // DIHAPUS: Baris ini tidak lagi menampilkan is_active di objek respons
      // is_active: template.isActive,
      variables: JSON.parse(template.variables as string || '[]'), // Ubah string JSON menjadi array
      created_at: template.createdAt.toISOString(),
      updated_at: template.updatedAt.toISOString(),
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    // 6. Kirim Respons Sukses
    return responses.ok(
      {
        template: responseData,
      },
      "Detail template dokumen berhasil diambil.",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/documents/templates/${id}`,
          related: {
            update: `/api/documents/templates/${id}`,
            delete: `/api/documents/templates/${id}`,
            all_templates: "/api/documents/templates",
          },
        },
      }
    );

  } catch (error: unknown) {
    // 7. Penanganan Error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Format ID tidak valid.",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.flatten().fieldErrors,
        },
        { requestId, event }
      );
    }
    
    // Penanganan error jika Prisma tidak menemukan data (sebagai fallback)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Template dokumen tidak ditemukan.", { requestId, event });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return responses.serverError(
      "Gagal mengambil detail template dokumen.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "TEMPLATE_DETAIL_FETCH_ERROR" }
    );
  }
});
