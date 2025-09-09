// server/api/documents/[id]/reject.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { getRouterParam, getHeader, readBody } from "#imports";
import { hasPermission } from "~~/server/helpers/permissions";

// Skema untuk validasi parameter ID
const documentIdParamSchema = z.object({
  id: z.string().cuid("Invalid document ID format"),
});

// Skema untuk validasi body request
const rejectDocumentBodySchema = z.object({
  rejectionReason: z
    .string()
    .min(10, "Rejection reason must be at least 10 characters long"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);

    // Hanya peran tertentu yang bisa menolak dokumen
    if (!hasPermission(currentUser.role as any, "reject:documents" as any)) {
      return responses.forbidden("Permission denied to reject documents", {
        requestId,
        event,
      });
    }

    // Validasi ID dari URL
    const { id: documentId } = documentIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Validasi body request
    body = await readBody(event);
    const { rejectionReason } = rejectDocumentBodySchema.parse(body);

    // Cari dokumen yang akan ditolak
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true, title: true, status: true },
    });

    if (!existingDocument) {
      return responses.notFound("Document not found", { requestId, event });
    }

    // Periksa apakah dokumen sudah dalam status akhir
    if (["APPROVED", "REJECTED", "COMPLETED"].includes(existingDocument.status)) {
      return responses.conflict(
        `Document is already in '${existingDocument.status}' state.`,
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Lakukan pembaruan status dan pencatatan dalam satu transaksi
    const rejectedDocument = await prisma.$transaction(async (tx) => {
      // Langkah 1: Update status dokumen menjadi REJECTED
      const doc = await tx.document.update({
        where: { id: documentId },
        data: {
          status: "REJECTED",
          approverId: currentUser.id,
          // Anda mungkin perlu menambahkan kolom `rejectionReason` di skema Prisma Anda
          // rejectionReason: rejectionReason,
        },
        include: {
          requester: { select: { id: true, name: true } },
        },
      });

      // Langkah 2: Catat aktivitas penolakan
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "REJECT_DOCUMENT",
          description: `Rejected document "${doc.title}" (ID: ${doc.id}) with reason: "${rejectionReason}"`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return doc;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Kembalikan respons sukses
    return responses.ok(
      {
        document: {
          id: rejectedDocument.id,
          title: rejectedDocument.title,
          status: rejectedDocument.status,
          rejection_reason: rejectionReason, // Dikembalikan dari body, bukan dari DB (kecuali jika Anda menyimpannya)
          requester: rejectedDocument.requester,
          rejected_by: {
            id: currentUser.id,
            name: currentUser.name,
          },
        },
      },
      "Document rejected successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/documents/${documentId}/reject`,
          related: {
            document_detail: `/api/documents/${documentId}`,
          },
        },
      },
    );
  } catch (error: unknown) {
    // Tangani error validasi Zod
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        { provided_data: body ? Object.keys(body) : [] },
        { requestId, event },
      );
    }

    // Tangani error Prisma
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Document not found during rejection operation", { requestId, event });
      }
    }

    // Tangani error server umum
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Failed to reject document",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_REJECT_ERROR" },
    );
  }
});
