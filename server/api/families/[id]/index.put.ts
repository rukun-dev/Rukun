// server/api/families/[id].put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Schema untuk validasi param id
const familyIdParamSchema = z.object({
  id: z.string().cuid("Invalid family ID format"),
});

// Schema untuk validasi body update
const updateFamilySchema = z.object({
  noKk: z.string().optional(),
  name: z.string().optional(),
  headName: z.string().optional(),
  address: z.string().optional(),
  rtNumber: z.string().optional(),
  rwNumber: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  postalCode: z.string().nullable().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Validasi param id
    const { id } = familyIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Parse dan validasi body
    body = await readBody(event);
    const validatedData = updateFamilySchema.parse(body);

    // Cek apakah Family ada
    const existingFamily = await prisma.family.findUnique({
      where: { id },
      select: {
        id: true,
        noKk: true,
        name: true,
        headName: true,
        createdById: true,
      },
    });

    if (!existingFamily) {
      return responses.notFound("Family not found", { requestId, event });
    }

    // Authorization check: hanya creator atau admin bisa update
    const canUpdate =
      currentUser.role === "SUPER_ADMIN" ||
      currentUser.id === existingFamily.createdById;

    if (!canUpdate) {
      return responses.forbidden(
        "You don't have permission to update this family",
        { requestId, event },
      );
    }

    // Track changes
    const changes: string[] = [];
    for (const key in validatedData) {
      if (
        validatedData[key as keyof typeof validatedData] !==
        (existingFamily as any)[key]
      ) {
        changes.push(
          `${key}: ${(existingFamily as any)[key]} → ${validatedData[key as keyof typeof validatedData]}`,
        );
      }
    }

    // Update data
    const updatedFamily = await prisma.family.update({
      where: { id },
      data: validatedData,
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
          select: { id: true, name: true, email: true },
        },
      },
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        family: {
          id: updatedFamily.id,
          no_kk: updatedFamily.noKk,
          name: updatedFamily.name,
          head_name: updatedFamily.headName,
          address: updatedFamily.address,
          rt_number: updatedFamily.rtNumber,
          rw_number: updatedFamily.rwNumber,
          kelurahan: updatedFamily.kelurahan,
          kecamatan: updatedFamily.kecamatan,
          kabupaten: updatedFamily.kabupaten,
          provinsi: updatedFamily.provinsi,
          postal_code: updatedFamily.postalCode,
          created_at: updatedFamily.createdAt.toISOString(),
          updated_at: updatedFamily.updatedAt.toISOString(),
          created_by: updatedFamily.createdBy,
        },
        changes_made: changes,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Family updated successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/families/${id}`,
          related: {
            family_detail: `/api/families/${id}`,
            family_members: `/api/families/${id}/members`,
            all_families: "/api/families",
            search_families: "/api/families/search",
          },
        },
      },
    );
  } catch (error: unknown) {
    // Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    // Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Family not found", { requestId, event });
      }
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target?.[0] || "field";
        return responses.conflict(
          `${target} already exists`,
          { requestId, event },
        );
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Family update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "FAMILY_UPDATE_ERROR" },
    );
  }
});
