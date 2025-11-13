import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);

  try {
    // Pastikan user terautentikasi
    const user = await requireAuth(event);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Jalankan query paralel untuk performa yang lebih baik
    const [
      totalWarga,
      totalFamilies,
      monthlyPaymentsAgg,
      activeAnnouncements,
    ] = await Promise.all([
      // Total warga aktif
      prisma.warga.count({ where: { isActive: true } }),

      // Total keluarga
      prisma.family.count(),

      // Total pembayaran iuran bulanan yang berhasil dibayar di bulan ini
      prisma.payment.aggregate({
        where: {
          status: "PAID",
          type: "IURAN_BULANAN",
          paidDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: { amount: true },
      }),

      // Pengumuman aktif (dipublikasikan dan belum kedaluwarsa)
      prisma.announcement.count({
        where: {
          isPublished: true,
          OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
        },
      }),
    ]);

    const monthlyPayments = Number(monthlyPaymentsAgg._sum.amount ?? 0);

    return responses.ok(
      {
        totalWarga,
        totalFamilies,
        monthlyPayments,
        activeAnnouncements,
      },
      "Dashboard stats retrieved successfully",
      {
        requestId,
        event,
        links: {
          self: "/api/dashboard",
          related: {
            users_statistics: "/api/users/statistics",
            announcements: "/api/announcements",
            families: "/api/families",
            residents: "/api/warga",
          },
        },
      },
    );
  } catch (error: any) {
    // Tangani error autentikasi/otorisasi
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      if (error.statusCode === 401) {
        return responses.unauthorized(error.statusMessage, { requestId, event });
      }
      return responses.forbidden(error.statusMessage, { requestId, event });
    }

    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return responses.serverError(
      "Failed to retrieve dashboard stats",
      errMessage,
      { requestId, event },
    );
  }
});