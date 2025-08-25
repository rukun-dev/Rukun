// server/api/families/[id]/members.post.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { z } from "zod";

const addMemberSchema = z.object({
  wargaId: z.string().cuid("Invalid wargaId format"),
  relation: z.string().min(2, "Relation must be at least 2 characters"),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Auth
    const currentUser = await requireAuth(event);

    // Validate route param
    const familyId = getRouterParam(event, "id");
    if (!familyId) {
      return responses.validation("Family ID is required", "id", {}, { requestId, event });
    }

    // Parse body
    const body = await readBody(event);
    const { wargaId, relation } = addMemberSchema.parse(body);

    // Check family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { id: true, noKk: true, headName: true },
    });

    if (!family) {
      return responses.notFound("Family not found", { requestId, event });
    }

    // Check warga exists
    const warga = await prisma.warga.findUnique({
      where: { id: wargaId },
      select: { id: true, nik: true, name: true },
    });

    if (!warga) {
      return responses.notFound("Warga not found", { requestId, event });
    }

    // Create family member
    const member = await prisma.familyMember.create({
      data: {
        familyId,
        wargaId,
      },
      select: {
        id: true,
        relationship: true,
        createdAt: true,
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
    });

    const responseData = {
      id: member.id,
      relation: member.relationship,
      created_at: member.createdAt.toISOString(),
      warga: {
        id: member.warga.id,
        nik: member.warga.nik,
        name: member.warga.name,
        gender: member.warga.gender,
        birth_date: member.warga.birthDate?.toISOString(),
        birth_place: member.warga.birthPlace,
      },
    };

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.created(
      { member: responseData },
      "Family member added successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/families/${familyId}/members`,
          family: `/api/families/${familyId}`,
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid input",
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

    // Prisma constraint error
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.conflict("Member already exists in this family", { requestId, event });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    return responses.serverError(
      "Failed to add family member",
      error instanceof Error ? error.message : undefined,
      { requestId, event, executionTime, code: "FAMILY_MEMBER_CREATE_ERROR" },
    );
  }
});
