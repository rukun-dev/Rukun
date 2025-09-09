// server/api/documents/[id].delete.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { getRouterParam, getHeader } from "#imports";
import { hasPermission } from "~~/server/helpers/permissions";

// Skema untuk validasi parameter ID
const documentIdParamSchema = z.object({
  id: z.string().cuid("Invalid document ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);

    if (!hasPermission(currentUser.role as any, "manage:documents")) {
      return responses.forbidden("Permission denied to delete documents", {
        requestId,
        event,
      });
    }

    // Validasi ID dari URL
    const { id: documentId } = documentIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Cari dokumen yang akan dihapus untuk memastikan ada
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        number: true,
        filePath: true, // Untuk potensi penghapusan file fisik
      },
    });

    if (!existingDocument) {
      return responses.notFound("Document not found", { requestId, event });
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Lakukan penghapusan dan pencatatan dalam satu transaksi
    await prisma.$transaction(async (tx) => {
      // Langkah 1: Hapus record dokumen dari database
      await tx.document.delete({
        where: { id: documentId },
      });

      // Langkah 2: Catat aktivitas penghapusan
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_DOCUMENT",
          description: `Deleted document "${existingDocument.title}" (ID: ${existingDocument.id}, Number: ${existingDocument.number ?? "-"})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // (Opsional) Langkah 3: Hapus file terkait dari penyimpanan.
      // Bagian ini memerlukan fungsi utilitas untuk berinteraksi dengan penyimpanan file Anda.
      if (existingDocument.filePath) {
        // Contoh: await deleteFileFromStorage(existingDocument.filePath);
      }
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Kembalikan respons sukses
    return responses.ok(
      {
        deleted_document: {
          id: existingDocument.id,
          title: existingDocument.title,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
        },
      },
      "Document deleted successfully",
      {
        requestId,
        event,
        executionTime,
      },
    );
  } catch (error: unknown) {
    // Tangani error validasi Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid document ID format",
        firstError?.path[0]?.toString(),
        {},
        { requestId, event },
      );
    }

    // Tangani error Prisma (misalnya, record yang akan dihapus tidak ditemukan)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Document not found during delete operation", { requestId, event });
      }
    }

    // Tangani error server umum
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Failed to delete document",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_DELETE_ERROR" },
    );
  }
});
