import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Validator input body (tanpa number manual)
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
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    const currentUser = await requireAuth(event);

    if (!hasPermission(currentUser.role as any, "manage:documents")) {
      return responses.forbidden("Permission denied", {
        requestId,
        event,
      });
    }

    // Validasi body
    body = await readBody(event);
    const validatedData = createDocumentSchema.parse(body);

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // =========================
    // 🔢 Buat nomor otomatis
    // =========================
    const lastDoc = await prisma.document.findFirst({
      orderBy: { createdAt: "desc" },
      select: { number: true },
    });

    // Dapatkan urutan terakhir
    let nextNumber = 1;
    if (lastDoc?.number) {
      const match = lastDoc.number.match(/\/(\d{4})\//); // ambil angka di tengah format
      if (match) nextNumber = parseInt(match[1]) + 1;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    // Tentukan prefix berdasarkan jenis surat
    const prefixMap: Record<string, string> = {
      SURAT_PENGANTAR: "SKP",
      SURAT_KETERANGAN: "SK",
      SURAT_DOMISILI: "SKD",
      SURAT_TIDAK_MAMPU: "STM",
      SURAT_KELAHIRAN: "SKL",
      SURAT_KEMATIAN: "SKM",
      SURAT_PINDAH: "SPN",
      OTHER: "OTR",
    };

    const prefix = prefixMap[validatedData.type] || "DOC";

    // Format nomor akhir
    const formattedNumber = `${prefix}/${nextNumber
      .toString()
      .padStart(4, "0")}/${day}/${month}/${year}`;

    // =========================
    // 🧾 Buat dokumen
    // =========================
    const newDocument = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title: validatedData.title,
          type: validatedData.type,
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
          number: formattedNumber, // ✅ nomor otomatis
        },
        include: {
          requester: { select: { id: true, name: true, email: true } },
          warga: { select: { id: true, name: true } },
          template: { select: { id: true, name: true } },
        },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_DOCUMENT",
          description: `Created document ${doc.title} (Number: ${doc.number})`,
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
          number: newDocument.number,
          content: newDocument.content,
          file_path: newDocument.filePath,
          file_size: newDocument.fileSize,
          mime_type: newDocument.mimeType,
          status: newDocument.status,
          is_archived: newDocument.isArchived,
          created_at: newDocument.createdAt.toISOString(),
          updated_at: newDocument.updatedAt.toISOString(),
          requester: newDocument.requester,
          warga: newDocument.warga,
          template: newDocument.template,
          approver_id: newDocument.approverId,
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
