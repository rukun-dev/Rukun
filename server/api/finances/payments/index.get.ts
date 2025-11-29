import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/database'
import { responses, calculatePagination } from '~~/server/utils/response'
import { requireAuthMiddleware } from '~~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  // Pastikan pengguna terautentikasi (middleware global juga melindungi prefix ini)
  const user = requireAuthMiddleware(event)

  // Ambil query untuk optional filter/pagination
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 25)
  const status = (query.status as string | undefined) || undefined
  const type = (query.type as string | undefined) || undefined
  const search = (query.search as string | undefined) || undefined

  const where: any = {}
  if (status) where.status = status
  if (type) where.type = type
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  // Kecualikan pembayaran yang terkait Warga dengan email SUPER_ADMIN
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

  // Hitung total untuk pagination
  const total = await prisma.payment.count({ where })

  const items = await prisma.payment.findMany({
    where,
    include: {
      warga: { select: { name: true } },
    },
    orderBy: { dueDate: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  // Transform ke bentuk yang diharapkan frontend
  const data = items.map((p) => ({
    id: p.id,
    type: p.type,
    amount: Number(p.amount),
    description: p.description,
    dueDate: p.dueDate,
    paidDate: p.paidDate,
    status: p.status,
    wargaName: p.warga?.name || undefined,
  }))

  const pagination = calculatePagination(page, limit, total)

  return responses.ok(
    { payments: data },
    'Payments fetched',
    { event, pagination, userId: user.id }
  )
})