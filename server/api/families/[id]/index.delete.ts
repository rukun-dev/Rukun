// server/api/families/[id].delete.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

const familyIdParamSchema = z.object({
  id: z.string().cuid("Invalid family ID format"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    if (!hasPermission(currentUser.role as any, "manage:families")) {
      return responses.forbidden(
        "Permission denied. Required permission: manage:families",
        { requestId, event, code: "FORBIDDEN" },
      );
    }

    // Validate route parameter
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
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!family) {
      return responses.notFound("Family not found", { requestId, event });
    }

    // Jika ada anggota keluarga, jangan langsung hapus
    if (family._count.members > 0) {
      return responses.badRequest(
        "Cannot delete family with existing members. Remove or reassign members first.",
        undefined,
        {
          related_data: `${family._count.members} members`,
          suggestion: "Consider deactivating the family or moving members.",
        },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Delete family dalam transaction
    await prisma.$transaction(async (tx) => {
      // Catat activity log
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "DELETE_FAMILY",
          description: `Deleted family: ${family.name} (No.KK: ${family.noKk}, Head: ${family.headName})`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      // Delete family
      await tx.family.delete({
        where: { id },
      });
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        deleted: true,
        family_id: id,
        deleted_family: {
          noKk: family.noKk,
          name: family.name,
          headName: family.headName,
        },
        deleted_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
      },
      "Family deleted successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          related: {
            all_families: "/api/families",
            create_new_family: "/api/families",
            activity_logs: "/api/activity-logs",
          },
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return responses.validation(
        error.issues[0]?.message || "Invalid family ID format",
        error.issues[0]?.path[0]?.toString(),
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
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Cannot delete family due to foreign key constraints. Please remove related records first.",
          undefined,
          { error_code: "FOREIGN_KEY_CONSTRAINT" },
          { requestId, event },
        );
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.serverError(
      "Family deletion failed due to server error",
      error instanceof Error ? error.message : undefined,
      { requestId, event, executionTime, code: "FAMILY_DELETE_ERROR" },
    );
  }
});
