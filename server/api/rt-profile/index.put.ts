// server/api/rt-profile/index.put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { updateRtProfileSchema } from "~~/server/validators/rt-profile";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only SUPER_ADMIN, KETUA_RT, SEKRETARIS can update
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT", "SEKRETARIS"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to update RT profile",
        { requestId, event }
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = updateRtProfileSchema.parse(body);

    // Check if any data was provided for update
    if (Object.keys(validatedData).length === 0) {
      return responses.badRequest(
        "No data provided for update",
        undefined,
        {
          available_fields: [
            "rtNumber",
            "rwNumber",
            "kelurahan",
            "kecamatan",
            "kabupaten",
            "provinsi",
            "postalCode",
            "description"
          ]
        },
        { requestId, event }
      );
    }

    // Get current RT profile
    const existingProfile = await prisma.rtProfile.findFirst({
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
        updatedAt: true } });

    // Check for unique RT number constraint if updating rtNumber or rwNumber
    if (validatedData.rtNumber || validatedData.rwNumber) {
      const newRtNumber = validatedData.rtNumber || existingProfile?.rtNumber;
      const newRwNumber = validatedData.rwNumber || existingProfile?.rwNumber;

      if (newRtNumber && newRwNumber) {
        const duplicateCheck = await prisma.rtProfile.findFirst({
          where: {
            rtNumber: newRtNumber,
            ...(existingProfile ? { NOT: { id: existingProfile.id } } : {}) } });

        if (duplicateCheck) {
          return responses.conflict(
            `RT ${newRtNumber} already exists in the system`,
            { requestId, event }
          );
        }
      }
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Track changes for activity log
    const changes: string[] = [];
    if (existingProfile) {
      if (validatedData.rtNumber && validatedData.rtNumber !== existingProfile.rtNumber)
        changes.push(`RT Number: ${existingProfile.rtNumber} → ${validatedData.rtNumber}`);
      if (validatedData.rwNumber && validatedData.rwNumber !== existingProfile.rwNumber)
        changes.push(`RW Number: ${existingProfile.rwNumber} → ${validatedData.rwNumber}`);
      if (validatedData.kelurahan && validatedData.kelurahan !== existingProfile.kelurahan)
        changes.push(`Kelurahan: ${existingProfile.kelurahan} → ${validatedData.kelurahan}`);
      if (validatedData.kecamatan && validatedData.kecamatan !== existingProfile.kecamatan)
        changes.push(`Kecamatan: ${existingProfile.kecamatan} → ${validatedData.kecamatan}`);
      if (validatedData.kabupaten && validatedData.kabupaten !== existingProfile.kabupaten)
        changes.push(`Kabupaten: ${existingProfile.kabupaten} → ${validatedData.kabupaten}`);
      if (validatedData.provinsi && validatedData.provinsi !== existingProfile.provinsi)
        changes.push(`Provinsi: ${existingProfile.provinsi} → ${validatedData.provinsi}`);
      if (validatedData.postalCode !== undefined && validatedData.postalCode !== existingProfile.postalCode)
        changes.push(`Postal Code: ${existingProfile.postalCode || "null"} → ${validatedData.postalCode || "null"}`);
      if (validatedData.description !== undefined && validatedData.description !== existingProfile.description)
        changes.push(`Description: ${existingProfile.description ? "updated" : "added"}`);
    }

    // Update or create RT profile in transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      let profile;

      if (existingProfile) {
        // Update existing profile
        profile = await tx.rtProfile.update({
          where: { id: existingProfile.id },
          data: validatedData,
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
            updatedAt: true } });
      } else {
        // Create new profile - ensure all required fields are provided
        const requiredFields = ["rtNumber", "rwNumber", "kelurahan", "kecamatan", "kabupaten", "provinsi"];
        const missingFields = requiredFields.filter(field => !validatedData[field as keyof typeof validatedData]);

        if (missingFields.length > 0) {
          throw new Error(`Missing required fields for new RT profile: ${missingFields.join(", ")}`);
        }

        profile = await tx.rtProfile.create({
          data: validatedData as Required<typeof validatedData>,
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
            updatedAt: true } });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: existingProfile ? "UPDATE_RT_PROFILE" : "CREATE_RT_PROFILE",
          description: existingProfile
            ? `Updated RT profile${changes.length > 0 ? ` - Changes: ${changes.join(", ")}` : ""}`
            : `Created RT profile for RT ${profile.rtNumber}/RW ${profile.rwNumber}`,
          ipAddress: clientIP,
          userAgent } });

      return profile;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Build full address for response
    const fullAddress = `RT ${updatedProfile.rtNumber}/RW ${updatedProfile.rwNumber}, ${updatedProfile.kelurahan}, ${updatedProfile.kecamatan}, ${updatedProfile.kabupaten}, ${updatedProfile.provinsi}${updatedProfile.postalCode ? ` ${updatedProfile.postalCode}` : ''}`;

    return responses.ok(
      {
        profile: {
          id: updatedProfile.id,
          rt_number: updatedProfile.rtNumber,
          rw_number: updatedProfile.rwNumber,
          kelurahan: updatedProfile.kelurahan,
          kecamatan: updatedProfile.kecamatan,
          kabupaten: updatedProfile.kabupaten,
          provinsi: updatedProfile.provinsi,
          postal_code: updatedProfile.postalCode,
          description: updatedProfile.description,
          logo: updatedProfile.logo,
          logo_public_id: updatedProfile.logoPublicId,
          created_at: updatedProfile.createdAt.toISOString(),
          updated_at: updatedProfile.updatedAt.toISOString() },
        full_address: fullAddress,
        changes_made: changes,
        is_new_profile: !existingProfile,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email } },
      existingProfile ? "RT profile updated successfully" : "RT profile created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/rt-profile",
          view: "/api/rt-profile",
          upload_logo: "/api/rt-profile/logo",
          settings: "/api/system/settings" } }
    );
  } catch (error: unknown) {
    // Handle Zod validation errors
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
            {} as Record<string, string>
          ),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [] },
        { requestId, event }
      );
    }

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
        const target = prismaError.meta?.target?.[0];
        const field = target === "rtNumber" ? "RT Number" : "field";
        return responses.conflict(
          `${field} already exists`,
          { requestId, event }
        );
      }
      if (prismaError.code === "P2025") {
        return responses.notFound("RT profile not found", { requestId, event });
      }
    }

    // Handle missing required fields error
    if (error instanceof Error && error.message.includes("Missing required fields")) {
      return responses.badRequest(
        error.message,
        undefined,
        {
          required_fields: ["rtNumber", "rwNumber", "kelurahan", "kecamatan", "kabupaten", "provinsi"],
          optional_fields: ["postalCode", "description"]
        },
        { requestId, event }
      );
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "RT profile update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "RT_PROFILE_UPDATE_ERROR" }
    );
  }
});
