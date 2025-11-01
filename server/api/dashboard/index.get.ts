// server/api/dashboard/index.get.ts
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { requireAuth } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    // Auth (all authenticated users can see dashboard)
    await requireAuth(event)

    // --- Calculate stats --- //
    // Total warga (citizens)
    const totalWargaPromise = prisma.warga.count()

    // Total families
    const totalFamiliesPromise = prisma.family.count()

    // Total payments for current month (only verified payments)
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyPaymentsPromise = prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: now
        },
        isVerified: true
      },
      _sum: {
        amount: true
      }
    })

    // Active announcements (published and not expired)
    const activeAnnouncementsPromise = prisma.announcement.count({
      where: {
        isPublished: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      }
    })

    const [totalWarga, totalFamilies, monthlyPaymentsAgg, activeAnnouncements] = await Promise.all([
      totalWargaPromise,
      totalFamiliesPromise,
      monthlyPaymentsPromise,
      activeAnnouncementsPromise
    ])

    const monthlyPayments = monthlyPaymentsAgg._sum.amount || 0

    const executionTime = `${Date.now() - startedAt}ms`

    return responses.ok(
      {
        totalWarga,
        totalFamilies,
        monthlyPayments,
        activeAnnouncements
      },
      'Dashboard statistics retrieved successfully',
      { requestId, event, executionTime }
    )
  } catch (error: unknown) {
    // Auth errors handled in utils/auth

    // Prisma constraint error
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2002') {
        return responses.serverError(
          'Database constraint error',
          process.env.NODE_ENV === 'development' ? prismaError.message : undefined,
          { requestId, event, code: 'DATABASE_CONSTRAINT_ERROR' }
        )
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return responses.serverError(
      'Failed to retrieve dashboard statistics',
      process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      { requestId, event, executionTime, code: 'DASHBOARD_GET_ERROR' }
    )
  }
})