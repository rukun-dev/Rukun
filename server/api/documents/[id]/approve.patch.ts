// server/api/documents/[id]/approve.patch.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { getRouterParam, getHeader } from "#imports";
import { hasPermission } from "~~/server/helpers/permissions";
import type { Document } from "@prisma/client";

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

    // Hanya peran tertentu yang bisa menyetujui dokumen
    if (!hasPermission(currentUser.role as any, "approve:documents" as any)) {
      return responses.forbidden("Permission denied to approve documents", {
        requestId,
        event,
      });
    }

    // Validasi ID dari URL
    const { id: documentId } = documentIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Cari dokumen yang akan disetujui
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        status: true,
      },
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
    const approvedDocument = await prisma.$transaction(async (tx) => {
      // Langkah 1: Update status dokumen menjadi APPROVED dan set approverId
      const doc = await tx.document.update({
        where: { id: documentId },
        data: {
          status: "APPROVED",
          approverId: currentUser.id,
        },
        include: {
          requester: { select: { id: true, name: true } },
        },
      });

      // Langkah 2: Catat aktivitas persetujuan
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "APPROVE_DOCUMENT",
          description: `Approved document "${doc.title}" (ID: ${doc.id})`,
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
          id: approvedDocument.id,
          title: approvedDocument.title,
          status: approvedDocument.status,
          requester: approvedDocument.requester,
          approver: {
            id: currentUser.id,
            name: currentUser.name,
          },
        },
      },
      "Document approved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/documents/${documentId}/approve`,
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
        firstError?.message || "Invalid document ID format",
        firstError?.path[0]?.toString(),
        {},
        { requestId, event },
      );
    }

    // Tangani error Prisma (misalnya, record yang akan diupdate tidak ditemukan)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Document not found during approval operation", { requestId, event });
      }
    }

    // Tangani error server umum
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Failed to approve document",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_APPROVE_ERROR" },
    );
  }
});

