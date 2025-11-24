// server/api/families/[id].get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Schema untuk validasi param id
const familyIdParamSchema = z.object({
  id: z.string().cuid("Invalid family ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Ambil param id
    const { id } = familyIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Cari Family
    const family = await prisma.family.findUnique({
      where: { id },
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
          },
        },
        members: {
          select: {
            id: true,
            wargaId: true,
            relationship: true,
            warga: {
              select: {
                id: true,
                nik: true,
                name: true,
                gender: true,
                birthDate: true,
              },
            },
          },
        },
      },
    });

    if (!family) {
      return responses.notFound("Family not found", { requestId, event });
    }

    // Build response
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
      created_by: family.createdBy,
      members: family.members.map((m) => ({
        id: m.id,
        relationship: m.relationship,
        warga: {
          id: m.warga.id,
          nik: m.warga.nik,
          name: m.warga.name,
          gender: m.warga.gender,
          birth_date: m.warga.birthDate?.toISOString(),
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
          self: `/api/families/${id}`,
          related: {
            update_family: `/api/families/${id}`,
            delete_family: `/api/families/${id}`,
            family_members: `/api/families/${id}/members`,
            all_families: "/api/families",
            search_families: "/api/families/search",
          },
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid family ID format",
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

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Family not found", { requestId, event });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve family details",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "FAMILY_DETAIL_ERROR" },
    );
  }
});
