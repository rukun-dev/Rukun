import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~~/server/utils/database'
import { responses } from '~~/server/utils/response'
import { requireAuthMiddleware, requireRoleMiddleware } from '~~/server/middleware/auth'

type BulkDeletePayload = {
  month?: number // 1-12
  year?: number // full year
  date?: string // ISO date string (YYYY-MM-DD)
  type?: 'IURAN_BULANAN' | 'IURAN_KEBERSIHAN' | 'SUMBANGAN' | 'DENDA' | 'OTHER'
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
}

export default defineEventHandler(async (event) => {
  const user = requireAuthMiddleware(event)
  requireRoleMiddleware(event, ['SUPER_ADMIN', 'KETUA_RT', 'BENDAHARA'])

  const body = await readBody(event)
  const payload = body as BulkDeletePayload

  if (!payload) {
    return responses.badRequest('Invalid payload', undefined, { received: body }, { event })
  }

  const where: any = {}

  // Build date range filter by month or specific date
  if (payload.month && payload.year) {
    const m = Number(payload.month)
    const y = Number(payload.year)
    if (!Number.isInteger(m) || !Number.isInteger(y) || m < 1 || m > 12) {
      return responses.badRequest('Invalid month/year', undefined, { received: body }, { event })
    }
    const start = new Date(y, m - 1, 1)
    const end = new Date(y, m, 1)
    where.dueDate = { gte: start, lt: end }
  } else if (payload.date) {
    const d = new Date(payload.date)
    if (isNaN(d.getTime())) {
      return responses.badRequest('Invalid date', undefined, { received: body }, { event })
    }
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
    where.dueDate = { gte: start, lt: end }
  } else {
    return responses.badRequest('Provide month/year or date', undefined, { received: body }, { event })
  }

  if (payload.type) where.type = payload.type
  if (payload.status) where.status = payload.status

  // Kecualikan pembayaran milik Warga dengan email SUPER_ADMIN
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN', isActive: true },
    select: { email: true },
  })
  const excludedEmails = superAdmins.map(u => u.email).filter(Boolean) as string[]
  if (excludedEmails.length > 0) {
    where.NOT = {
      warga: {
        is: {
          email: { in: excludedEmails },
        },
      },
    }
  }

  const result = await prisma.payment.deleteMany({ where })

  return responses.ok(
    { deletedCount: result.count },
    'Bulk payments deleted',
    { event, userId: user.id }
  )
})