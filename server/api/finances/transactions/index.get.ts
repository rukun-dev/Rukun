import { defineEventHandler, getQuery } from 'h3'
import { prisma } from '~~/server/utils/database'
import { responses, calculatePagination } from '~~/server/utils/response'
import { requireAuthMiddleware } from '~~/server/middleware/auth'

export default defineEventHandler(async (event) => {
  // Pastikan pengguna terautentikasi
  const user = requireAuthMiddleware(event)

  // Ambil query untuk optional filter/pagination
  const query = getQuery(event)
  const page = Number(query.page || 1)
  const limit = Number(query.limit || 25)
  const type = (query.type as string | undefined) || undefined
  const category = (query.category as string | undefined) || undefined
  const search = (query.search as string | undefined) || undefined
  const from = (query.from as string | undefined) || undefined
  const to = (query.to as string | undefined) || undefined

  const where: any = {}
  if (type) where.type = type
  if (category) where.category = category
  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { warga: { is: { name: { contains: search, mode: 'insensitive' } } } },
    ]
  }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = new Date(from)
    if (to) where.date.lte = new Date(to)
  }

  // Hitung total untuk pagination
  const total = await prisma.transaction.count({ where })

  const items = await prisma.transaction.findMany({
    where,
    include: {
      warga: { select: { name: true } },
      createdBy: { select: { name: true, role: true } },
    },
    orderBy: { date: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })

  // Transform ke bentuk yang diharapkan frontend
  const data = items.map((t) => ({
    id: t.id,
    type: t.type,
    category: t.category,
    amount: Number(t.amount),
    description: t.description,
    date: t.date,
    wargaName: t.warga?.name || undefined,
  }))

  const pagination = calculatePagination(page, limit, total)

  return responses.ok(
    { transactions: data },
    'Transactions fetched',
    { event, pagination, userId: user.id }
  )
})