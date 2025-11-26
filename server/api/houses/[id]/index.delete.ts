// server/api/houses/[id]/index.delete.ts
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { requireRole } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

const houseIdParamSchema = z.object({
  id: z.string().cuid('Invalid house ID format'),
})

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    // Only SUPER_ADMIN and KETUA_RT can delete houses
    await requireRole(['SUPER_ADMIN', 'KETUA_RT'])(event)

    const { id } = houseIdParamSchema.parse({ id: getRouterParam(event, 'id') })

    // Find the house first for response context
    const house = await prisma.house.findUnique({
      where: { id },
      select: {
        id: true,
        headNik: true,
        rtNumber: true,
        rwNumber: true,
        head: { select: { name: true, nik: true } },
      },
    })

    if (!house) {
      return responses.notFound('House not found', { requestId, event })
    }

    // Delete house
    await prisma.house.delete({ where: { id } })

    const executionTime = `${Date.now() - startedAt}ms`
    return responses.ok(
      {
        deleted: true,
        house_id: id,
        deleted_house: {
          headNik: house.headNik,
          headName: house.head?.name || null,
          rtNumber: house.rtNumber,
          rwNumber: house.rwNumber,
        },
      },
      'House deleted successfully',
      { requestId, event, executionTime }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return responses.validation(
        firstError?.message || 'Invalid house ID format',
        firstError?.path[0]?.toString(),
        undefined,
        { requestId, event }
      )
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2025') {
        return responses.notFound('House not found', { requestId, event })
      }
      if (prismaError.code === 'P2003') {
        return responses.badRequest(
          'Cannot delete house due to foreign key constraints. Please remove related records first.',
          undefined,
          { error_code: 'FOREIGN_KEY_CONSTRAINT' },
          { requestId, event }
        )
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`
    return responses.serverError(
      'House deletion failed due to server error',
      error instanceof Error ? error.message : undefined,
      { requestId, event, executionTime, code: 'HOUSE_DELETE_ERROR' }
    )
  }
})
