// server/api/warga/[id].delete.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

// Validator untuk parameter ID
const wargaIdParamSchema = z.object({
  id: z.string().cuid("Invalid warga ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication
    const currentUser = await requireAuth(event);

    // Check permission (misalnya hanya role tertentu yang bisa hapus warga)
    if (!hasPermission(currentUser.role, "manage:users")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:wargas",
        { requestId, event, code: "FORBIDDEN" },
      );
    }

    // Validate route param
    const { id } = wargaIdParamSchema.parse({
      id: getRouterParam(event, "id"),
    });

    // Check if warga exists and related data
    const targetWarga = await prisma.warga.findUnique({
      where: { id },
      select: {
        id: true,
        nik: true,
        name: true,
        isActive: true,
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

    if (!targetWarga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Cek apakah ada data terkait (foreign key)
    const hasRelatedData = Object.values(targetWarga._count).some(
      (count) => count > 0,
    );

    if (hasRelatedData) {
      const relatedDataInfo = [];
      if (targetWarga._count.familyMembers > 0)
        relatedDataInfo.push(`${targetWarga._count.familyMembers} family members`);
      if (targetWarga._count.documents > 0)
        relatedDataInfo.push(`${targetWarga._count.documents} documents`);
      if (targetWarga._count.transactions > 0)
        relatedDataInfo.push(`${targetWarga._count.transactions} transactions`);
      if (targetWarga._count.payments > 0)
        relatedDataInfo.push(`${targetWarga._count.payments} payments`);

      return responses.badRequest(
        "Cannot delete warga with related data. Please transfer or remove related records first.",
        undefined,
        {
          related_data: relatedDataInfo,
          suggestion: "Consider deactivating the warga instead of deleting",
          alternative_endpoint: `/api/warga/${id}`,
          alternative_data: { isActive: false },
        },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Perform deletion
    await prisma.$transaction(async (tx) => {
      // Log activity sebelum hapus
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_WARGA",
          description: `Deleted warga: ${targetWarga.name} (NIK: ${targetWarga.nik})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Hapus warga
      await tx.warga.delete({
        where: { id },
      });
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        deleted: true,
        warga_id: id,
        deleted_warga: {
          nik: targetWarga.nik,
          name: targetWarga.name,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Warga deleted successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          related: {
            all_wargas: "/api/warga",
            create_new_warga: "/api/warga",
            activity_logs: "/api/activity-logs",
          },
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation error
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid warga ID format",
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

    // Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2025") {
        return responses.notFound("Warga not found", { requestId, event });
      }
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Cannot delete warga due to foreign key constraints. Please remove related records first.",
          undefined,
          {
            error_code: "FOREIGN_KEY_CONSTRAINT",
            suggestion: "Check for related familyMembers, documents, transactions, or payments.",
          },
          { requestId, event },
        );
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return responses.serverError(
      "Warga deletion failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "WARGA_DELETE_ERROR" },
    );
  }
});
