// server/api/warga/[id].get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Validator param id (cuid)
const wargaIdParamSchema = z.object({
  id: z.string().cuid("Invalid Warga ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Validate path param
    const { id } = wargaIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Check if warga exists
    const targetWarga = await prisma.warga.findUnique({
      where: { id },
      select: { id: true, createdById: true, isActive: true },
    });

    if (!targetWarga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Simple permission rule:
    // - creator bisa lihat
    // - admin roles bisa lihat (contoh: SUPER_ADMIN, KETUA_RT, dll)
    const canView =
      currentUser.id === targetWarga.createdById ||
      ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS", "BENDAHARA"].includes(
        currentUser.role,
      );

    if (!canView) {
      return responses.forbidden(
        "You don't have permission to view this warga's details",
        { requestId, event },
      );
    }

    // Fetch comprehensive warga data
    const warga = await prisma.warga.findUnique({
      where: { id },
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
          select: { id: true, name: true, email: true },
        },
        familyMembers: {
          select: { id: true, familyId: true},
        },
        documents: {
          select: { id: true, type: true},
        },
        transactions: {
          select: { id: true, amount: true, createdAt: true },
          take: 3,
          orderBy: { createdAt: "desc" },
        },
        payments: {
          select: { id: true, amount: true, createdAt: true },
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!warga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Build response data
    const responseData = {
      ...warga,
      birthDate: warga.birthDate?.toISOString() || null,
      createdAt: warga.createdAt.toISOString(),
      updatedAt: warga.updatedAt.toISOString(),
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
          self: `/api/warga/${id}`,
          related: {
            update_warga: `/api/warga/${id}`,
            warga_documents: `/api/warga/${id}/documents`,
            warga_transactions: `/api/warga/${id}/transactions`,
            warga_payments: `/api/warga/${id}/payments`,
            all_warga: "/api/warga",
          },
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid Warga ID format",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce(
            (acc, issue) => {
              const field = issue.path[0]?.toString();
              if (field) acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          ),
          error_count: error.issues.length,
        },
        { requestId, event },
      );
    }

    // Auth errors
    if (error && typeof error === "object" && "statusCode" in error) {
      const authError = error as any;
      if (authError.statusCode === 401) {
        return responses.unauthorized(authError.statusMessage, {
          requestId,
          event,
          code: "UNAUTHORIZED",
        });
      }
      if (authError.statusCode === 403) {
        return responses.forbidden(authError.statusMessage, {
          requestId,
          event,
          code: "FORBIDDEN",
        });
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
