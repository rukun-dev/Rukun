// server/api/families/by-kk/[noKk].get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

const familyNoKkParamSchema = z.object({
  noKk: z.string().min(16, "No KK must be at least 16 digits"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Validate params
    const { noKk } = familyNoKkParamSchema.parse({
      noKk: getRouterParam(event, "noKk"),
    });

    // Cari family berdasarkan noKk
    const family = await prisma.family.findUnique({
      where: { noKk },
      select: {
        id: true,
        noKk: true,
        name: true,
        headName: true,
        address: true,
        rtNumber: true,
        rwNumber: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        postalCode: true,
        createdAt: true,
        updatedAt: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          select: {
            id: true,
            relationship: true,
            warga: {
              select: {
                id: true,
                nik: true,
                name: true,
                gender: true,
                birthDate: true,
                birthPlace: true,
              },
            },
          },
        },
      },
    });

    if (!family) {
      return responses.notFound("Family not found", { requestId, event });
    }

    const responseData = {
      id: family.id,
      no_kk: family.noKk,
      name: family.name,
      head_name: family.headName,
      address: family.address,
      rt_number: family.rtNumber,
      rw_number: family.rwNumber,
      kelurahan: family.kelurahan,
      kecamatan: family.kecamatan,
      kabupaten: family.kabupaten,
      provinsi: family.provinsi,
      postal_code: family.postalCode,
      created_at: family.createdAt.toISOString(),
      updated_at: family.updatedAt.toISOString(),
      created_by: {
        id: family.createdBy.id,
        name: family.createdBy.name,
        email: family.createdBy.email,
        role: family.createdBy.role,
      },
      members_count: family._count.members,
      members: family.members.map((m) => ({
        id: m.id,
        relation: m.relationship,
        warga: {
          id: m.warga.id,
          nik: m.warga.nik,
          name: m.warga.name,
          gender: m.warga.gender,
          birth_date: m.warga.birthDate?.toISOString(),
          birth_place: m.warga.birthPlace,
        },
      })),
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      { family: responseData },
      "Family details retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/families/by-kk/${noKk}`,
          related: {
            all_families: "/api/families",
            delete_family: `/api/families/${family.id}`,
          },
        },
      },
    );
  } catch (error: unknown) {
    // Zod error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid No KK format",
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
        return responses.notFound("Family not found", { requestId, event });
      }
    }

    // Generic
    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.serverError(
      "Failed to retrieve family details",
      error instanceof Error ? error.message : undefined,
      { requestId, event, executionTime, code: "FAMILY_DETAIL_ERROR" },
    );
  }
});
