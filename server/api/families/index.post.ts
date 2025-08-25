import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Validator untuk input body
const createFamilySchema = z.object({
  noKk: z.string().min(16, "Nomor KK minimal 16 digit"),
  name: z.string().min(1, "Family name is required"),
  headName: z.string().min(1, "Head of family name is required"),
  address: z.string().min(1),
  rtNumber: z.string().min(1),
  rwNumber: z.string().min(1),
  kelurahan: z.string().min(1),
  kecamatan: z.string().min(1),
  kabupaten: z.string().min(1),
  provinsi: z.string().min(1),
  postalCode: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    if (!hasPermission(currentUser.role as any, "manage:families")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:families",
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse & validate body
    body = await readBody(event);
    const validatedData = createFamilySchema.parse(body);

    // Check KK sudah ada?
    const existingFamily = await prisma.family.findUnique({
      where: { noKk: validatedData.noKk },
      select: { id: true },
    });

    if (existingFamily) {
      return responses.conflict("Nomor KK sudah terdaftar", {
        requestId,
        event,
      });
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Create Family dalam transaction
    const newFamily = await prisma.$transaction(async (tx) => {
      const family = await tx.family.create({
        data: {
          noKk: validatedData.noKk,
          name: validatedData.name,
          headName: validatedData.headName,
          address: validatedData.address,
          rtNumber: validatedData.rtNumber,
          rwNumber: validatedData.rwNumber,
          kelurahan: validatedData.kelurahan,
          kecamatan: validatedData.kecamatan,
          kabupaten: validatedData.kabupaten,
          provinsi: validatedData.provinsi,
          postalCode: validatedData.postalCode,
          createdById: currentUser.id,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      // Log ke activityLog
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_FAMILY",
          description: `Created family ${family.name} (KK: ${family.noKk})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return family;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.created(
      {
        family: {
          id: newFamily.id,
          no_kk: newFamily.noKk,
          name: newFamily.name,
          head_name: newFamily.headName,
          address: newFamily.address,
          rt_number: newFamily.rtNumber,
          rw_number: newFamily.rwNumber,
          kelurahan: newFamily.kelurahan,
          kecamatan: newFamily.kecamatan,
          kabupaten: newFamily.kabupaten,
          provinsi: newFamily.provinsi,
          postal_code: newFamily.postalCode,
          created_at: newFamily.createdAt.toISOString(),
          updated_at: newFamily.updatedAt.toISOString(),
          created_by: newFamily.createdBy,
        },
      },
      "Family created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/families",
          detail: `/api/families/${newFamily.id}`,
          members: `/api/families/${newFamily.id}/members`,
        },
      },
    );
  } catch (error: unknown) {
    // Validation error
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

    // Prisma constraint error
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.conflict("Nomor KK sudah terdaftar", {
          requestId,
          event,
        });
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Family creation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "FAMILY_CREATE_ERROR" },
    );
  }
});
