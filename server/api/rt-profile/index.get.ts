// server/api/rt-profile/index.get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication - all authenticated users can view RT profile
    const currentUser = await requireAuth(event);

    // Get RT profile from database
    const rtProfile = await prisma.rtProfile.findFirst({
      select: {
        id: true,
        rtNumber: true,
        rwNumber: true,
        kelurahan: true,
        kecamatan: true,
        kabupaten: true,
        provinsi: true,
        postalCode: true,
        description: true,
        logo: true,
        logoPublicId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no RT profile exists, return default structure
    if (!rtProfile) {
      return responses.ok(
        {
          profile: null,
          is_configured: false,
          setup_required: true,
          setup_permissions: [
            "SUPER_ADMIN",
            "KETUA_RT",
            "SEKRETARIS"
          ],
        },
        "RT profile not configured yet",
        {
          requestId,
          event,
          executionTime: `${Date.now() - startedAt}ms`,
          links: {
            setup: "/api/rt-profile",
            settings: "/api/system/settings",
          },
        }
      );
    }

    const executionTime = `${Date.now() - startedAt}ms`;

    // Return RT profile data
    return responses.ok(
      {
        profile: {
          id: rtProfile.id,
          rt_number: rtProfile.rtNumber,
          rw_number: rtProfile.rwNumber,
          kelurahan: rtProfile.kelurahan,
          kecamatan: rtProfile.kecamatan,
          kabupaten: rtProfile.kabupaten,
          provinsi: rtProfile.provinsi,
          postal_code: rtProfile.postalCode,
          description: rtProfile.description,
          logo: rtProfile.logo,
          logo_public_id: rtProfile.logoPublicId,
          created_at: rtProfile.createdAt.toISOString(),
          updated_at: rtProfile.updatedAt.toISOString(),
        },
        is_configured: true,
        full_address: `RT ${rtProfile.rtNumber}/RW ${rtProfile.rwNumber}, ${rtProfile.kelurahan}, ${rtProfile.kecamatan}, ${rtProfile.kabupaten}, ${rtProfile.provinsi}${rtProfile.postalCode ? ` ${rtProfile.postalCode}` : ''}`,
        can_edit: ["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role),
      },
      "RT profile retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/rt-profile",
          update: "/api/rt-profile",
          upload_logo: "/api/rt-profile/logo",
          settings: "/api/system/settings",
        },
      }
    );
  } catch (error: unknown) {
    // Handle authentication/authorization errors
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

    // Handle Prisma errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.serverError(
          "Database constraint error",
          process.env.NODE_ENV === "development" ? prismaError.message : undefined,
          { requestId, event, code: "DATABASE_CONSTRAINT_ERROR" }
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to retrieve RT profile",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "RT_PROFILE_GET_ERROR" }
    );
  }
});
