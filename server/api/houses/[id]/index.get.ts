// server/api/houses/[houseNumber]/index.get.ts
import { prisma } from '~~/server/utils/database'
import { requireAuth } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    const currentUser = await requireAuth(event)

    if (!['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'STAFF'].includes(currentUser.role)) {
      return responses.forbidden('You do not have permission to view house', { requestId, event })
    }

    const params = event.context.params as { id: string }
    const id = params?.id

    const house = await prisma.house.findUnique({
      where: { id },
      include: {
        head: { select: { nik: true, name: true, noKk: true, address: true } },
      },
    })

    if (!house) {
      return responses.notFound('House not found', { requestId, event })
    }

    const executionTime = `${Date.now() - startedAt}ms`
    return responses.ok(house, 'House retrieved', { requestId, event, executionTime })
  } catch (error) {
    throw error
  }
})
