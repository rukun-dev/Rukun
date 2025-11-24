// server/api/warga/search.get.ts
import { prisma } from '~~/server/utils/database';

export default defineEventHandler(async (event) => {
  try {
    const { q } = getQuery(event) as { q?: string };

    if (typeof q !== 'string' || !q.trim()) {
      setResponseStatus(event, 400);
      return { code: 400, message: 'Parameter "q" diperlukan dan harus berupa string.' };
    }

    // Cari Warga berdasarkan nama saja
    const wargaList = await prisma.warga.findMany({
      where: {
        isActive: true,
        name: { contains: q }, // case-insensitive jika kolom/table ber-collation *_ci
      },
      select: {
        id: true,
        nik: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        rtNumber: true,
        rwNumber: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        createdAt: true,
        updatedAt: true,
        // ringkas: sertakan hitungan dokumen terkait (opsional, ringan)
        _count: { select: { documents: true } },
      },
      orderBy: { name: 'asc' },
    });

    setResponseStatus(event, 200);
    return {
      code: 200,
      message: 'Data warga berhasil dikembalikan.',
      data: {
        citizens: wargaList.map((w) => ({
          id: w.id,
          nik: w.nik,
          name: w.name,
          email: w.email,
          phone: w.phone,
          address: w.address,
          rt: w.rtNumber,
          rw: w.rwNumber,
          kelurahan: w.kelurahan,
          kecamatan: w.kecamatan,
          kabupaten: w.kabupaten,
          provinsi: w.provinsi,
          created_at: w.createdAt.toISOString(),
          updated_at: w.updatedAt.toISOString(),
          documents_count: w._count.documents,
        })),
      },
    };
  } catch (error: any) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: error?.message || 'Internal Server Error',
      }),
    );
  }
});
