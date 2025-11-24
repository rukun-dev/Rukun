// server/api/warga/create.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Validator pakai zod
export const createWargaSchema = z.object({
  nik: z.string().min(16).max(16, "NIK harus 16 digit"),
  noKk: z.string().min(16).max(16, "No KK harus 16 digit"),
  name: z.string().min(3),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.coerce.date().optional().nullable(),
  birthPlace: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE"]),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .default("SINGLE"),
  job: z.string().optional().nullable(),
  education: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  address: z.string(),
  rtNumber: z.string(),
  rwNumber: z.string(),
  kelurahan: z.string(),
  kecamatan: z.string(),
  kabupaten: z.string(),
  provinsi: z.string(),
  postalCode: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Hanya role tertentu yang boleh create warga
    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "Permission denied. Required role: SUPER_ADMIN/KETUA_RT/SEKRETARIS",
        { requestId, event, code: "FORBIDDEN" },
      );
    }

    // Parse & validasi body
    body = await readBody(event);
    const validatedData = createWargaSchema.parse(body);

    // Cek duplikat NIK / Email
    const [existingNik, existingEmail] = await Promise.all([
      prisma.warga.findUnique({
        where: { nik: validatedData.nik },
        select: { id: true },
      }),
      validatedData.email
        ? prisma.warga.findUnique({
            where: { email: validatedData.email },
            select: { id: true },
          })
        : null,
    ]);

    if (existingNik) {
      return responses.conflict("NIK already registered", { requestId, event });
    }

    if (existingEmail) {
      return responses.conflict("Email already registered", {
        requestId,
        event,
      });
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Transaction create warga + log
    const newWarga = await prisma.$transaction(async (tx) => {
      const warga = await tx.warga.create({
        data: {
          ...validatedData,
          createdById: currentUser.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_WARGA",
          description: `Created warga: ${warga.name} (NIK: ${warga.nik})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return warga;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.created(
      {
        warga: {
          id: newWarga.id,
          nik: newWarga.nik,
          no_kk: newWarga.noKk,
          name: newWarga.name,
          email: newWarga.email,
          phone: newWarga.phone,
          gender: newWarga.gender,
          marital_status: newWarga.maritalStatus,
          address: newWarga.address,
          rt: newWarga.rtNumber,
          rw: newWarga.rwNumber,
          kelurahan: newWarga.kelurahan,
          kecamatan: newWarga.kecamatan,
          kabupaten: newWarga.kabupaten,
          provinsi: newWarga.provinsi,
          is_active: newWarga.isActive,
          created_at: newWarga.createdAt.toISOString(),
          updated_at: newWarga.updatedAt.toISOString(),
        },
        created_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Warga created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/warga/create",
          list: "/api/warga",
          detail: `/api/warga/${newWarga.id}`,
        },
      },
    );
  } catch (error: unknown) {
    // Zod error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
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
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    // Prisma unique constraint
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        const target = prismaError.meta?.target?.[0];
        return responses.conflict(
          `${target} already exists`,
          { requestId, event },
        );
      }
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
      throw error;
    }

    // Generic error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to create warga",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "WARGA_CREATE_ERROR" },
    );
  }
});
