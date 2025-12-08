// DIUBAH: Menggunakan import dari paket Google GenAI yang benar
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// DIPERBAIKI: Import yang diperlukan untuk struktur pesan yang benar
import { HumanMessage, SystemMessage } from "@langchain/core/messages";


// Mengambil konfigurasi runtime, termasuk API Key dari .env
const config = useRuntimeConfig();

// --- INTERFACES ---
interface FileInput {
  content: string;
  type: 'image' | 'pdf' | 'code' | 'text';
  filename: string;
}

// --- PRISMA SCHEMA CONTEXT ---
const prismaSchema = `
model User {
  id        String      @id @default(cuid())
  email     String      @unique
  name      String
  profile   UserProfile?
  // ...dan model-model lainnya
}

model UserProfile {
  id      String   @id @default(cuid())
  userId  String   @unique
  nik     String?  @unique
  address String?
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
// << PASTIKAN ANDA MENEMPELKAN SKEMA LENGKAP ANDA DI SINI >>
`;

/**
 * Membuat template HTML dinamis menggunakan LangChain dengan Google Generative AI.
 * @param title Judul utama untuk dokumen HTML.
 * @param file Objek file yang akan dirender di dalam template.
 * @param requiredVariables Array string berisi nama-nama variabel yang harus ada di template.
 * @returns Promise<string> yang berisi potongan kode HTML untuk body.
 */
export async function createHtmlTemplate(
  title: string,
  file: FileInput,
  requiredVariables: string[]
): Promise<string> {
  if (!config.exnestApiKey) {
    console.error("EXNEST_API_KEY tidak ditemukan.");
    throw new Error("Konfigurasi server tidak lengkap: EXNEST_API_KEY tidak ada.");
  }

  // --- Konfigurasi LangChain untuk Google GenAI ---
  const chat = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-pro',
    apiKey: config.exnestApiKey,
    temperature: 0.1,
  });

  // --- PROMPT YANG JAUH LEBIH SEDERHANA DAN TEGAS ---
  const systemPrompt = `
    **PERAN ANDA:**
    Anda adalah generator kode HTML yang sangat presisi.

    **TUGAS UTAMA:**
    Buat potongan kode HTML HANYA untuk isi BODY sebuah dokumen, tiru persis struktur dan gaya dari contoh.

    **ATURAN MUTLAK (JANGAN DILANGGAR):**
    1.  **HANYA KONTEN BODY**: Jangan pernah menulis \`<html>\`, \`<head>\`, atau \`<body>\`. Output Anda HARUS dimulai dengan \`<div class="card-container">\`.
    2.  **TIDAK ADA LINK**: Jangan gunakan tag \`<a>\`.
    3.  **GUNAKAN STRUKTUR INI SECARA PERSIS**:
        - Pembungkus: \`<div class="card-container">\`
        - Judul: \`<h1>${title}</h1>\`
        - Seksi: \`<section class="info-section">\`.
        - Judul Seksi: \`<h2 class="section-title">Judul Seksi Di Sini</h2>\`
        - Baris Data: \`<div class="data-item">\`
        - Isi Baris Data: \`<label>Label Data:</label> <span>\${placeholder}</span>\`
    4.  **SINTAKS PLACEHOLDER**: Gunakan SINTAKS INI: \`\${nama_variabel}\`. Untuk setiap variabel dari daftar yang diberikan, buat satu baris data.
        Contoh: Jika diberi variabel 'name', buat \`<label>Nama:</label> <span>\${name}</span>\`. Jika diberi 'profile.nik', buat \`<label>NIK:</label> <span>\${profile.nik}</span>\`.
    5.  **SEKSI FILE**: Buat seksi dengan judul "Dokumen Lampiran". Di dalamnya, buat baris data untuk "Nama File" dan "Tipe File", lalu isi dengan informasi dari file referensi.

    Mulai buat kode HTML sekarang.
  `;

  // --- Data yang akan diolah oleh prompt ---
  const humanInput = `
    DAFTAR VARIABEL YANG HARUS DIBUATKAN PLACEHOLDER:
    \`[${requiredVariables.join(', ')}]\`

    FILE REFERENSI UNTUK DITAMPILKAN:
    - Nama File: \`${file.filename}\`
    - Tipe File: \`${file.type}\`
  `;

  try {
    // DIPERBAIKI: Menggunakan class SystemMessage dan HumanMessage secara eksplisit
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(humanInput),
    ];
    
    // Memanggil model AI menggunakan LangChain dengan metode .invoke() yang benar
    const response = await chat.invoke(messages);

    if (!response || !response.content) {
      console.error('[AI Template] Gagal mendapatkan konten dari LangChain:', response);
      return `<!-- ERROR: Gagal mendapatkan konten dari model AI via LangChain. -->`;
    }

    const htmlBodyContent = response.content.toString();
    // Membersihkan jika AI masih menyertakan markdown
    return htmlBodyContent.replace(/```html|```/g, "").trim();

  } catch (error) {
    console.error("[AI Template] Terjadi error saat memanggil LangChain API:", error);
    return `<!-- ERROR: ${error instanceof Error ? error.message : "Unknown Error"} -->`;
  }
}

