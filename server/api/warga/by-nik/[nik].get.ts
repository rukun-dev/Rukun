// server/api/warga/by-nik/[nik].get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

const wargaNikParamSchema = z.object({
  nik: z
    .string()
    // .min(16, "NIK must be at least 16 digits")
    // .max(16, "NIK must be exactly 16 digits")
    // .regex(/^\d+$/, "NIK must be numeric"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Validate param
    const { nik } = wargaNikParamSchema.parse({
      nik: getRouterParam(event, "nik"),
    });

    // Cari warga by NIK
    const warga = await prisma.warga.findUnique({
      where: { nik },
      select: {
        id: true,
        nik: true,
        noKk: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        birthPlace: true,
        gender: true,
        maritalStatus: true,
        job: true,
        education: true,
        religion: true,
        address: true,
        rtNumber: true,
        rwNumber: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        postalCode: true,
        fatherName: true,
        motherName: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: {
            familyMembers: true,
            documents: true,
            transactions: true,
            payments: true,
          },
        },
      },
    });

    if (!warga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Build response
    const responseData = {
      id: warga.id,
      nik: warga.nik,
      no_kk: warga.noKk,
      name: warga.name,
      email: warga.email,
      phone: warga.phone,
      birth_date: warga.birthDate?.toISOString(),
      birth_place: warga.birthPlace,
      gender: warga.gender,
      marital_status: warga.maritalStatus,
      job: warga.job,
      education: warga.education,
      religion: warga.religion,
      address: warga.address,
      rt_number: warga.rtNumber,
      rw_number: warga.rwNumber,
      kelurahan: warga.kelurahan,
      kecamatan: warga.kecamatan,
      kabupaten: warga.kabupaten,
      provinsi: warga.provinsi,
      postal_code: warga.postalCode,
      father_name: warga.fatherName,
      mother_name: warga.motherName,
      is_active: warga.isActive,
      created_at: warga.createdAt.toISOString(),
      updated_at: warga.updatedAt.toISOString(),
      created_by: warga.createdBy,
      statistics: {
        family_members: warga._count.familyMembers,
        documents: warga._count.documents,
        transactions: warga._count.transactions,
        payments: warga._count.payments,
      },
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      { warga: responseData },
      "Warga details retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/warga/by-nik/${nik}`,
          related: {
            delete_warga: `/api/warga/${warga.id}`,
            all_warga: `/api/warga`,
          },
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid NIK format",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
        },
        { requestId, event },
      );
    }

    // Prisma not found
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Warga not found", { requestId, event });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";

    return responses.serverError(
      "Failed to retrieve warga details",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "WARGA_DETAIL_ERROR" },
    );
  }
});
