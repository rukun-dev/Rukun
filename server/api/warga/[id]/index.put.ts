// server/api/warga/[id].put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Param schema
const wargaIdParamSchema = z.object({
  id: z.string().cuid("Invalid Warga ID format"),
});

// Body schema untuk update warga
const updateWargaSchema = z.object({
  nik: z.string().min(16).max(16).optional(),
  noKk: z.string().min(16).max(16).optional(),
  name: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().datetime().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional(),
  job: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  address: z.string().optional(),
  rtNumber: z.string().optional(),
  rwNumber: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  postalCode: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    const currentUser = await requireAuth(event);

    // Validasi param
    const { id } = wargaIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Parse & validasi body
    body = await readBody(event);
    const validatedData = updateWargaSchema.parse(body);

    // Cari target warga
    const targetWarga = await prisma.warga.findUnique({
      where: { id },
      select: { id: true, createdById: true, email: true, phone: true, nik: true },
    });

    if (!targetWarga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Rule izin: creator atau admin tertentu
    const canUpdate =
      currentUser.id === targetWarga.createdById ||
      ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role);

    if (!canUpdate) {
      return responses.forbidden("You don't have permission to update this warga", {
        requestId,
        event,
      });
    }

    // Cek email unik
    if (
      validatedData.email &&
      validatedData.email !== targetWarga.email
    ) {
      const existing = await prisma.warga.findUnique({
        where: { email: validatedData.email },
        select: { id: true },
      });
      if (existing) {
        return responses.conflict("Email already registered", { requestId, event });
      }
    }

    // Cek phone unik
    if (
      validatedData.phone &&
      validatedData.phone !== targetWarga.phone
    ) {
      const existingPhone = await prisma.warga.findFirst({
        where: { phone: validatedData.phone, NOT: { id } },
        select: { id: true },
      });
      if (existingPhone) {
        return responses.conflict("Phone already registered", { requestId, event });
      }
    }

    // Cek nik unik
    if (
      validatedData.nik &&
      validatedData.nik !== targetWarga.nik
    ) {
      const existingNik = await prisma.warga.findUnique({
        where: { nik: validatedData.nik },
        select: { id: true },
      });
      if (existingNik) {
        return responses.conflict("NIK already registered", { requestId, event });
      }
    }

    // Konversi birthDate string → Date
    const updateData: any = { ...validatedData };
    if (validatedData.birthDate) {
      updateData.birthDate = new Date(validatedData.birthDate);
    }

    // Update warga
    const updatedWarga = await prisma.warga.update({
      where: { id },
      data: updateData,
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
      },
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        warga: {
          ...updatedWarga,
          birthDate: updatedWarga.birthDate?.toISOString() || null,
          createdAt: updatedWarga.createdAt.toISOString(),
          updatedAt: updatedWarga.updatedAt.toISOString(),
        },
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        },
      },
      "Warga updated successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/warga/${id}`,
          related: {
            warga_detail: `/api/warga/${id}`,
            all_warga: "/api/warga",
          },
        },
      },
    );
  } catch (error: unknown) {
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

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Warga not found", { requestId, event });
      }
      if (prismaError.code === "P2002") {
        return responses.conflict("Unique constraint violation", {
          requestId,
          event,
        });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    return responses.serverError(
      "Failed to update warga",
      process.env.NODE_ENV === "development" ? errMsg : undefined,
      { requestId, event, executionTime, code: "WARGA_UPDATE_ERROR" },
    );
  }
});
