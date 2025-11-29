// server/api/houses/[houseNumber]/index.put.ts
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { requireRole } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

const updateHouseSchema = z.object({
  houseNumber: z
    .string()
    .regex(/^[\dA-Za-z\-\/]{1,10}$/i, 'Nomor rumah hanya angka/huruf, max 10, boleh -/')
    .optional(),
  headNik: z.string().min(1).max(30).optional(),
  familyCount: z.coerce.number().int().min(0).optional(),
  memberCount: z.coerce.number().int().min(0).optional(),
})

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    await requireRole(['SUPER_ADMIN', 'KETUA_RT'])(event)

    const params = event.context.params as { id: string }
    const id = params?.id
    const body = await readBody(event)
    const data = updateHouseSchema.parse(body)

    if (data.headNik) {
      const head = await prisma.warga.findUnique({ where: { nik: data.headNik } })
      if (!head) {
        return responses.notFound('Kepala rumah tangga (NIK) tidak ditemukan', { requestId, event })
      }
    }

    const updated = await prisma.house.update({
      where: { id },
      data,
      include: {
        head: { select: { nik: true, name: true, noKk: true, address: true } },
      },
    })

    const executionTime = `${Date.now() - startedAt}ms`
    return responses.ok(updated, 'House updated successfully', { requestId, event, executionTime })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return responses.validation(firstError?.message || 'Validation failed', firstError?.path[0]?.toString(), undefined, { requestId, event })
    }
    throw error
  }
})
