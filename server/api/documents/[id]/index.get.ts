// server/api/documents/[id].get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { getRouterParam } from "#imports";

// Schema untuk validasi param id
const documentIdParamSchema = z.object({
  id: z.string().cuid("Invalid document ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Memastikan hanya peran tertentu yang dapat mengakses.
    // Anda mungkin ingin menambahkan logika tambahan di sini,
    // misalnya memeriksa apakah pengguna adalah pemohon dokumen.
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "WARGA"].includes(currentUser.role)) {
      return responses.forbidden("You don't have permission to view this document", {
        requestId,
        event,
      });
    }

    // Validasi dan ambil param id
    const { id: documentId } = documentIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Mengambil data dokumen tunggal berdasarkan ID
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
        warga: {
          select: { id: true, name: true, nik: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });

    // Jika dokumen tidak ditemukan, kirim respons 404
    if (!document) {
      return responses.notFound("Document not found", { requestId, event });
    }
    
    // Otorisasi tambahan: Warga hanya boleh melihat dokumen miliknya sendiri
    if (currentUser.role === "WARGA" && document.requesterId !== currentUser.id) {
        return responses.forbidden("You can only view your own documents", {
            requestId,
            event,
        });
    }

    // Membangun data respons
    const responseData = {
      id: document.id,
      title: document.title,
      type: document.type,
      status: document.status,
      number: document.number,
      file_path: document.filePath,
      file_size: document.fileSize,
      mime_type: document.mimeType,
      created_at: document.createdAt.toISOString(),
      updated_at: document.updatedAt.toISOString(),
      requester: document.requester,
      warga: document.warga,
      template: document.template,
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    // Mengembalikan data dokumen yang ditemukan
    return responses.ok(
      { document: responseData },
      "Document retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
            self: `/api/documents/${documentId}`,
            related: {
                update_document: `/api/documents/${documentId}`,
                delete_document: `/api/documents/${documentId}`,
                all_documents: "/api/documents",
            }
        }
      },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid document ID format",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
        },
        { requestId, event },
      );
    }
    
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    // Menangani error server
    return responses.serverError(
      "Failed to retrieve document",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_GET_BY_ID_ERROR" },
    );
  }
});

