// server/api/documents/[id].put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { getRouterParam, readBody, getHeader } from "#imports";
import { hasPermission } from "~~/server/helpers/permissions";
import { Prisma } from "@prisma/client";
import type { Document, DocumentType, DocumentStatus } from "@prisma/client";

// Tipe helper untuk dokumen dengan relasi
type DocumentWithRelations = Document & {
  requester: { id: string; name: string; email: string; role: string; };
  warga: { id: string; name: string; nik: string; } | null;
  template: { id: string; name: string; } | null;
};

// Schema untuk validasi param id
const documentIdParamSchema = z.object({
  id: z.string().cuid("Invalid document ID format"),
});

// Schema untuk validasi body update, disesuaikan dengan schema create
const updateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  type: z.enum([
    "SURAT_PENGANTAR",
    "SURAT_KETERANGAN",
    "SURAT_DOMISILI",
    "SURAT_TIDAK_MAMPU",
    "SURAT_KELAHIRAN",
    "SURAT_KEMATIAN",
    "SURAT_PINDAH",
    "OTHER",
  ]).optional(),
  status: z.enum([
    "PENDING",
    "IN_PROGRESS",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
  ]).optional(),
  content: z.string().optional(),
  number: z.string().nullable().optional(),
  approverId: z.string().cuid().nullable().optional(),
  wargaId: z.string().cuid().nullable().optional(),
  templateId: z.string().cuid().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Otorisasi menggunakan helper
    if (!hasPermission(currentUser.role as any, "manage:documents")) {
      return responses.forbidden("Permission denied to update documents", {
        requestId,
        event,
      });
    }

    // Validasi param id
    const { id: documentId } = documentIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Parse dan validasi body
    body = await readBody(event);
    const validatedData = updateDocumentSchema.parse(body);

    // Cek apakah Dokumen ada dan sertakan relasi
    const existingDocument = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        warga: { select: { id: true, name: true, nik: true } },
        template: { select: { id: true, name: true } },
      },
    });

    if (!existingDocument) {
      return responses.notFound("Document not found", { requestId, event });
    }
    
    // Cek nomor dokumen unik jika diubah
    if (validatedData.number && validatedData.number !== existingDocument.number) {
        const docWithSameNumber = await prisma.document.findFirst({
            where: { 
                number: validatedData.number,
                id: { not: documentId } 
            },
            select: { id: true }
        });

        if(docWithSameNumber) {
            return responses.conflict("Document number already exists", { requestId, event });
        }
    }


    // Lacak perubahan untuk log
    const changes: string[] = [];
    for (const key in validatedData) {
      const typedKey = key as keyof typeof validatedData;
      if (
        validatedData[typedKey] !== undefined &&
        validatedData[typedKey] !== (existingDocument as any)[typedKey]
      ) {
        changes.push(
          `${key}: '${(existingDocument as any)[typedKey] ?? "null"}' → '${validatedData[typedKey] ?? "null"}'`,
        );
      }
    }
    
    // Jika tidak ada perubahan, kembalikan respons
    if (changes.length === 0 && Object.keys(validatedData).length > 0) {
      return responses.ok(
        { document: existingDocument, changes_made: ["No changes detected."] },
        "No changes were made to the document.",
        { requestId, event }
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Update data dan buat log dalam satu transaksi
    const updatedDocument = await prisma.$transaction(async (tx) => {
        const doc = await tx.document.update({
            where: { id: documentId },
            data: validatedData as Prisma.DocumentUncheckedUpdateInput,
            include: {
                requester: { select: { id: true, name: true, email: true, role: true } },
                warga: { select: { id: true, name: true, nik: true } },
                template: { select: { id: true, name: true } },
            },
        });

        // Log ke activityLog
        if (changes.length > 0) {
            await tx.activityLog.create({
                data: {
                    userId: currentUser.id,
                    action: "UPDATE_DOCUMENT",
                    description: `Updated document ${doc.title} (ID: ${doc.id}). Changes: ${changes.join(", ")}`,
                    ipAddress: clientIP,
                    userAgent,
                },
            });
        }

        return doc;
    }) as DocumentWithRelations;

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        document: {
          id: updatedDocument.id,
          title: updatedDocument.title,
          type: updatedDocument.type,
          status: updatedDocument.status,
          number: updatedDocument.number,
          file_path: updatedDocument.filePath,
          file_size: updatedDocument.fileSize,
          mime_type: updatedDocument.mimeType,
          created_at: updatedDocument.createdAt.toISOString(),
          updated_at: updatedDocument.updatedAt.toISOString(),
          requester: updatedDocument.requester,
          warga: updatedDocument.warga,
          template: updatedDocument.template,
        },
        changes_made: changes,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Document updated successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/documents/${documentId}`,
          related: {
            document_detail: `/api/documents/${documentId}`,
            all_documents: "/api/documents",
          },
        },
      },
    );
  } catch (error: unknown) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    // Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Document not found during update operation", { requestId, event });
      }
      if (prismaError.code === "P2002") {
        return responses.conflict("Document number already exists", { requestId, event });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Document update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_UPDATE_ERROR" },
    );
  }
});

