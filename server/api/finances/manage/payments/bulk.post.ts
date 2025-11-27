import { defineEventHandler, readBody } from 'h3'
import { prisma } from '~~/server/utils/database'
import { responses } from '~~/server/utils/response'
import { requireAuthMiddleware, requireRoleMiddleware } from '~~/server/middleware/auth'

type BulkPayload = {
  type: 'IURAN_BULANAN' | 'IURAN_KEBERSIHAN' | 'SUMBANGAN' | 'DENDA' | 'OTHER'
  amount: number
  description: string
  dueDate: string | Date
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
}

export default defineEventHandler(async (event) => {
  const user = requireAuthMiddleware(event)
  requireRoleMiddleware(event, ['SUPER_ADMIN', 'KETUA_RT', 'BENDAHARA'])

  const body = await readBody(event)
  const payload = body as BulkPayload

  if (!payload || !payload.type || !payload.amount || !payload.description || !payload.dueDate) {
    return responses.badRequest('Invalid payload', undefined, { received: body }, { event })
  }

  const dueDate = new Date(payload.dueDate)
  const status = payload.status || 'PENDING'

  // Exclude SUPER_ADMIN users from being targeted for dues if they have a warga record
  const superAdmins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN', isActive: true },
    select: { email: true },
  })
  const excludedEmails = superAdmins.map(u => u.email).filter(Boolean) as string[]

  const wargaList = await prisma.warga.findMany({
    where: {
      isActive: true,
      ...(excludedEmails.length > 0 ? { NOT: { email: { in: excludedEmails } } } : {})
    },
    select: { id: true },
  })

  if (wargaList.length === 0) {
    return responses.ok({ createdCount: 0 }, 'No active warga found', { event, userId: user.id })
  }

  const data = wargaList.map((w) => ({
    type: payload.type,
    amount: payload.amount,
    description: payload.description,
    dueDate,
    paidDate: null,
    status,
    wargaId: w.id,
    createdById: user.id,
  }))

  const result = await prisma.payment.createMany({ data })

  return responses.created(
    { createdCount: result.count },
    'Bulk payments created (excluding SUPER_ADMIN)',
    { event, userId: user.id }
  )
})