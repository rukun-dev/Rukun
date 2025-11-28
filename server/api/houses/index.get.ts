// server/api/houses/index.get.ts
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { requireAuth } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

// Query validation
const housesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  q: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    const currentUser = await requireAuth(event)

    // Only privileged roles can view house data
    if (!['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'STAFF'].includes(currentUser.role)) {
      return responses.forbidden('You do not have permission to view houses', { requestId, event })
    }

    const query = getQuery(event)
    const { page, limit, q } = housesQuerySchema.parse(query)

    const where: any = {}
    if (q && q.trim().length > 0) {
      const queryText = q.trim()
      where.OR = [
        { head: { name: { contains: queryText } } },
        { headNik: { contains: queryText } },
        { rtNumber: { contains: queryText } },
        { rwNumber: { contains: queryText } },
        { kelurahan: { contains: queryText } },
        { kecamatan: { contains: queryText } },
        { kabupaten: { contains: queryText } },
        { provinsi: { contains: queryText } },
      ]
    }

    const skip = (page - 1) * limit

    const [total, records] = await Promise.all([
      prisma.house.count({ where }),
      prisma.house.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          head: {
            select: { nik: true, name: true, noKk: true, address: true, rtNumber: true, rwNumber: true },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(total / limit)
    const executionTime = `${Date.now() - startedAt}ms`

    return responses.ok(
      {
        total,
        page,
        per_page: limit,
        total_pages: totalPages,
        records,
      },
      'Houses retrieved successfully',
      {
        requestId,
        event,
        executionTime,
        pagination: {
          current_page: page,
          per_page: limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
          first_page: 1,
          last_page: totalPages,
        },
      },
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return responses.validation(firstError?.message || 'Invalid query parameters', firstError?.path[0]?.toString(), undefined, { requestId, event })
    }
    throw error
  }
})
