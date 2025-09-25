import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Validator untuk input body
const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum([
    "SURAT_PENGANTAR",
    "SURAT_KETERANGAN",
    "SURAT_DOMISILI",
    "SURAT_TIDAK_MAMPU",
    "SURAT_KELAHIRAN",
    "SURAT_KEMATIAN",
    "SURAT_PINDAH",
    "OTHER",
  ]),
  content: z.string().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  requesterId: z.string().optional(),
  approverId: z.string().optional(),
  wargaId: z.string().optional(),
  templateId: z.string().optional(),
  number: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    if (!hasPermission(currentUser.role as any, "manage:documents")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:documents",
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse & validate body
    body = await readBody(event);
    const validatedData = createDocumentSchema.parse(body);

    // Cek nomor dokumen unik
    if (validatedData.number) {
      const existingDoc = await prisma.document.findUnique({
        where: { number: validatedData.number },
        select: { id: true },
      });

      if (existingDoc) {
        return responses.conflict("Document number already exists", {
          requestId,
          event,
        });
      }
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Create Document dalam transaction
    const newDocument = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: validatedData.title,
          type: validatedData.type, // enum DocumentType sudah valid
          ...(validatedData.content && { content: validatedData.content }),
          ...(validatedData.filePath && { filePath: validatedData.filePath }),
          ...(validatedData.fileSize && { fileSize: validatedData.fileSize }),
          ...(validatedData.mimeType && { mimeType: validatedData.mimeType }),
          requesterId: validatedData.requesterId ?? currentUser.id,
          ...(validatedData.approverId && {
            approverId: validatedData.approverId,
          }),
          ...(validatedData.wargaId && { wargaId: validatedData.wargaId }),
          ...(validatedData.templateId && {
            templateId: validatedData.templateId,
          }),
          ...(validatedData.number && { number: validatedData.number }),
        },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          warga: { select: { id: true, name: true } },
          template: { select: { id: true, name: true } },
        },
      });

      // Log ke activityLog
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_DOCUMENT",
          description: `Created document ${doc.title} (Number: ${
            doc.number ?? "-"
          })`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return doc;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.created(
      {
        document: {
          id: newDocument.id,
          title: newDocument.title,
          type: newDocument.type,
          content: newDocument.content,
          file_path: newDocument.filePath,
          file_size: newDocument.fileSize,
          mime_type: newDocument.mimeType,
          number: newDocument.number,
          status: newDocument.status,
          is_archived: newDocument.isArchived,
          created_at: newDocument.createdAt.toISOString(),
          updated_at: newDocument.updatedAt.toISOString(),
          requester: newDocument.requester,
          warga: newDocument.warga,
          template: newDocument.template,
          approver_id: newDocument.approverId, // tampilkan ID saja
        },
      },
      "Document created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/documents",
          detail: `/api/documents/${newDocument.id}`,
        },
      },
    );
  } catch (error: unknown) {
    // Validation error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path[0]?.toString();
              if (field) acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    // Prisma constraint error (unique number)
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.conflict("Document number already exists", {
          requestId,
          event,
        });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Document creation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "DOCUMENT_CREATE_ERROR" },
    );
  }
});
