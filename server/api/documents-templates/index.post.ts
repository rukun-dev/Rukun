import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

/**
 * Endpoint untuk membuat TEMPLATE DOKUMEN baru menggunakan AI.
 * Menerima form data dengan field: 'title', 'file', dan 'parameters'.
 * Hasilnya akan disimpan sebagai record baru di tabel 'DocumentTemplate'.
 */
export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // 1. Autentikasi & Otorisasi
    const currentUser = await requireAuth(event);
    const allowedRoles = ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "STAFF"];
    if (!allowedRoles.includes(currentUser.role)) {
      return responses.forbidden(
        "Anda tidak memiliki izin untuk membuat template.",
        { requestId, event }
      );
    }

    // 2. Baca Form Data
    const form = await readMultipartFormData(event);
    if (!form) {
      return responses.badRequest("Form data tidak ditemukan.", undefined, {}, { requestId, event });
    }

    // 3. Ekstrak Input Utama
    const titleField = form.find((f) => f.name === 'title');
    const fileField = form.find((f) => f.name === 'file');
    const parametersField = form.find((f) => f.name === 'parameters');

    if (!titleField || !fileField || !parametersField) {
      const missingField = !titleField ? 'title' : !fileField ? 'file' : 'parameters';
      return responses.validation(
        `Input tidak lengkap. Field '${missingField}' wajib diisi.`,
        missingField,
        undefined,
        { requestId, event }
      );
    }

    // 4. Persiapkan Data untuk AI Utility
    const title = titleField.data.toString().trim();
    const parameters = parametersField.data.toString().trim().split(',').map(p => p.trim()).filter(Boolean);
    
    let fileTypeForAI: 'image' | 'pdf' | 'text' | 'code' = 'text';
    if (fileField.type?.startsWith('image/')) fileTypeForAI = 'image';
    else if (fileField.type === 'application/pdf') fileTypeForAI = 'pdf';

    const fileInput = {
      content: fileField.data.toString('base64'),
      type: fileTypeForAI,
      filename: fileField.filename || 'file_referensi',
    };

    // 5. Panggil AI untuk Menghasilkan Template HTML
    console.log(`[AI Template] Meminta AI untuk membuat template: "${title}"`);
    const htmlTemplate = await createHtmlTemplate(title, fileInput, parameters);

    // Cek jika utility AI mengembalikan error
    if (htmlTemplate.trim().startsWith('<!-- ERROR:')) {
      return responses.serverError(
        "Layanan AI gagal memproses permintaan Anda.",
        process.env.NODE_ENV === "development" ? htmlTemplate : "Terjadi kesalahan pada layanan AI.",
        { requestId, event, code: "AI_GENERATION_FAILED" }
      );
    }

    // 6. Simpan Hasil ke Tabel 'DocumentTemplate'
    const newTemplate = await prisma.$transaction(async (tx) => {
        const template = await tx.documentTemplate.create({
            data: {
                name: title,
                content: htmlTemplate,
                variables: JSON.stringify(parameters),
                type: 'OTHER', // Default tipe, bisa disesuaikan
                isActive: true,
            },
        });

        // Catat aktivitas (opsional tapi direkomendasikan)
        await tx.activityLog.create({
            data: {
                userId: currentUser.id,
                action: "CREATE_AI_TEMPLATE",
                description: `Membuat template dokumen via AI: "${title}" (ID Template: ${template.id})`,
                ipAddress: getClientIP(event),
                userAgent: getHeader(event, "user-agent"),
            }
        });
        
        return template;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // 7. Kirim Respons Sukses
    return responses.created(
      {
        template: {
          id: newTemplate.id,
          name: newTemplate.name,
          type: newTemplate.type,
          variables: JSON.parse(newTemplate.variables as string),
          createdAt: newTemplate.createdAt,
        },
      },
      "Template dokumen berhasil dibuat oleh AI.",
      { 
        requestId, 
        event, 
        executionTime,
        links: {
            self: `/api/documents/templates/${newTemplate.id}`,
            all_templates: `/api/documents/templates`
        }
      }
    );

  } catch (error: any) {
    // 8. Penanganan Error Menyeluruh
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan server.";
    return responses.serverError(
      "Gagal memproses pembuatan template.",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, code: "TEMPLATE_GENERATION_ERROR" }
    );
  }
});