// server/api/houses/index.post.ts
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { requireRole } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

const createHouseSchema = z
  .object({
    // Lokasi rumah
    rtNumber: z.string().min(1).max(10).optional(),
    rwNumber: z.string().min(1).max(10).optional(),
    kelurahan: z.string().min(1).max(100).optional(),
    kecamatan: z.string().min(1).max(100).optional(),
    kabupaten: z.string().min(1).max(100).optional(),
    provinsi: z.string().min(1).max(100).optional(),
    postalCode: z.string().max(10).optional(),

    // Cara memilih kepala rumah: langsung pakai NIK atau pilih keluarga
    headNik: z.string().min(1).max(30).optional(),
    familyId: z.string().cuid().optional(),
    noKk: z.string().min(1).max(32).optional(),

    // Statistik rumah
    familyCount: z.coerce.number().int().min(0).default(0),
    memberCount: z.coerce.number().int().min(0).default(0),
  })
  .refine(
    (val) => !!val.headNik || !!val.familyId || !!val.noKk,
    {
      message: 'Harus memilih kepala keluarga (headNik) atau memilih keluarga (familyId/noKk)',
      path: ['headNik'],
    },
  )

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event)
  const startedAt = Date.now()

  try {
    // Only SUPER_ADMIN and KETUA_RT can create houses
    await requireRole(['SUPER_ADMIN', 'KETUA_RT'])(event)

    const body = await readBody(event)
    const {
      rtNumber,
      rwNumber,
      kelurahan,
      kecamatan,
      kabupaten,
      provinsi,
      postalCode,
      headNik,
      familyId,
      noKk,
      familyCount,
      memberCount,
    } = createHouseSchema.parse(body)

    // Resolve head NIK jika memilih keluarga
    let resolvedHeadNik = headNik
    let effectiveRt = rtNumber
    let effectiveRw = rwNumber
    let effectiveKelurahan = kelurahan
    let effectiveKecamatan = kecamatan
    let effectiveKabupaten = kabupaten
    let effectiveProvinsi = provinsi
    let effectivePostalCode = postalCode

    if (!resolvedHeadNik && (familyId || noKk)) {
      // Ambil family berdasarkan id atau noKk
      const family = familyId
        ? await prisma.family.findUnique({
            where: { id: familyId },
            select: {
              id: true,
              rtNumber: true,
              rwNumber: true,
              kelurahan: true,
              kecamatan: true,
              kabupaten: true,
              provinsi: true,
              postalCode: true,
            },
          })
        : await prisma.family.findUnique({
            where: { noKk: noKk! },
            select: {
              id: true,
              rtNumber: true,
              rwNumber: true,
              kelurahan: true,
              kecamatan: true,
              kabupaten: true,
              provinsi: true,
              postalCode: true,
            },
          })

      if (!family) {
        return responses.notFound('Keluarga tidak ditemukan', { requestId, event })
      }

      const headMember = await prisma.familyMember.findFirst({
        where: {
          familyId: family.id,
          OR: [{ relationship: 'HEAD' }, { isHeadFamily: true }],
        },
        include: { warga: { select: { nik: true } } },
      })

    if (!headMember || !headMember.warga?.nik) {
      return responses.badRequest('Keluarga tidak memiliki data kepala keluarga yang valid', undefined, undefined, { requestId, event })
    }

      resolvedHeadNik = headMember.warga.nik

      // Isi lokasi dari family jika belum diisi manual
      effectiveRt = effectiveRt || family.rtNumber
      effectiveRw = effectiveRw || family.rwNumber
      effectiveKelurahan = effectiveKelurahan || family.kelurahan
      effectiveKecamatan = effectiveKecamatan || family.kecamatan
      effectiveKabupaten = effectiveKabupaten || family.kabupaten
      effectiveProvinsi = effectiveProvinsi || family.provinsi
      effectivePostalCode = effectivePostalCode || family.postalCode || undefined
    }

    // Validasi lokasi rumah wajib
    if (!effectiveRt || !effectiveRw || !effectiveKelurahan || !effectiveKecamatan || !effectiveKabupaten || !effectiveProvinsi) {
      return responses.validation(
        'Field lokasi rumah (RT/RW/kelurahan/kecamatan/kabupaten/provinsi) wajib diisi',
        (!effectiveRt && 'rtNumber') || (!effectiveRw && 'rwNumber') || (!effectiveKelurahan && 'kelurahan') || (!effectiveKecamatan && 'kecamatan') || (!effectiveKabupaten && 'kabupaten') || (!effectiveProvinsi && 'provinsi') || 'rtNumber',
        {
          suggestion: 'Lengkapi lokasi atau pilih keluarga dengan lokasi lengkap',
        },
        { requestId, event },
      )
    }

    // Ensure head exists
    const head = await prisma.warga.findUnique({ where: { nik: resolvedHeadNik! } })
    if (!head) {
      return responses.notFound('Kepala rumah tangga (NIK) tidak ditemukan', { requestId, event })
    }

    // Create house
    const created = await prisma.house.create({
      data: {
        rtNumber: effectiveRt!,
        rwNumber: effectiveRw!,
        kelurahan: effectiveKelurahan!,
        kecamatan: effectiveKecamatan!,
        kabupaten: effectiveKabupaten!,
        provinsi: effectiveProvinsi!,
        postalCode: effectivePostalCode,
        headNik: resolvedHeadNik!,
        familyCount,
        memberCount,
      },
      include: {
        head: { select: { nik: true, name: true, noKk: true, address: true } },
      },
    })

    const executionTime = `${Date.now() - startedAt}ms`
    return responses.created(created, 'House created successfully', { requestId, event, executionTime })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]
      return responses.validation(firstError?.message || 'Validation failed', firstError?.path[0]?.toString(), {
        field_errors: error.issues.reduce((acc, issue) => {
          const field = issue.path[0]?.toString()
          if (field) acc[field] = issue.message
          return acc
        }, {} as Record<string, string>),
      }, { requestId, event })
    }

    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      if (prismaError.code === 'P2002') {
        return responses.conflict('House number already exists', { requestId, event })
      }
    }

    throw error
  }
})
