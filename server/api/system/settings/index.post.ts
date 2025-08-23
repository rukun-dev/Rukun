// server/api/system/settings/index.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { hasPermission } from "~~/server/helpers/permissions";
import { logSystemSettingUpdate } from "~~/server/utils/activity-log";
import { systemSettingSchema } from "~~/server/validators/rt-profile";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only SUPER_ADMIN can create system settings
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to create system settings",
        {
          requestId,
          event,
          required_roles: ["SUPER_ADMIN", "KETUA_RT"],
          current_role: currentUser.role,
        },
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = systemSettingSchema.parse(body);

    // Check if setting key already exists
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key: validatedData.key },
      select: { id: true, key: true },
    });

    if (existingSetting) {
      return responses.conflict(
        `System setting '${validatedData.key}' already exists`,
        {
          requestId,
          event,
          existing_setting_id: existingSetting.id,
          suggested_action: "Use PUT method to update existing setting",
          update_url: `/api/system/settings/${validatedData.key}`,
        },
      );
    }

    // Validate value based on setting type
    let validatedValue = validatedData.value;
    try {
      switch (validatedData.type) {
        case "NUMBER":
          const numValue = parseFloat(validatedData.value);
          if (isNaN(numValue)) {
            throw new Error("Value must be a valid number");
          }
          validatedValue = numValue.toString();
          break;
        case "BOOLEAN":
          if (!["true", "false"].includes(validatedData.value.toLowerCase())) {
            throw new Error("Value must be 'true' or 'false'");
          }
          validatedValue = validatedData.value.toLowerCase();
          break;
        case "JSON":
          JSON.parse(validatedData.value); // Validate JSON format
          break;
        case "STRING":
        default:
          // No additional validation needed for strings
          break;
      }
    } catch (parseError) {
      return responses.validation(
        `Invalid value for ${validatedData.type} type: ${parseError instanceof Error ? parseError.message : "Invalid format"}`,
        "value",
        {
          expected_type: validatedData.type,
          provided_value: validatedData.value,
          format_examples: {
            STRING: "Any text value",
            NUMBER: "123 or 123.45",
            BOOLEAN: "true or false",
            JSON: '{"key": "value"}',
          },
        },
        { requestId, event },
      );
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Create setting in transaction
    const newSetting = await prisma.$transaction(async (tx) => {
      // Create setting
      const setting = await tx.systemSetting.create({
        data: {
          key: validatedData.key,
          value: validatedValue,
          type: validatedData.type,
          description: validatedData.description,
          isSystem: validatedData.isSystem || false,
        },
        select: {
          id: true,
          key: true,
          value: true,
          type: true,
          description: true,
          isSystem: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Log system setting creation activity
      await tx.activityLog.create({
        data: {
          userId: currentUser.id,
          action: "CREATE_SYSTEM_SETTING",
          description: `Created system setting '${validatedData.key}' with type ${validatedData.type}`,
          ipAddress: clientIP,
          userAgent,
        },
      });

      return setting;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Parse value for display based on type
    let displayValue: any = newSetting.value;
    try {
      switch (newSetting.type) {
        case "NUMBER":
          displayValue = parseFloat(newSetting.value);
          break;
        case "BOOLEAN":
          displayValue = newSetting.value === "true";
          break;
        case "JSON":
          displayValue = JSON.parse(newSetting.value);
          break;
        default:
          displayValue = newSetting.value;
      }
    } catch {
      // Keep original value if parsing fails
      displayValue = newSetting.value;
    }

    return responses.created(
      {
        setting: {
          id: newSetting.id,
          key: newSetting.key,
          value: newSetting.value,
          display_value: displayValue,
          type: newSetting.type,
          description: newSetting.description,
          is_system: newSetting.isSystem,
          created_at: newSetting.createdAt.toISOString(),
          updated_at: newSetting.updatedAt.toISOString(),
        },
        created_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        validation_info: {
          type: newSetting.type,
          parsed_successfully: displayValue !== newSetting.value,
        },
      },
      "System setting created successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/system/settings/${newSetting.key}`,
          update: `/api/system/settings/${newSetting.key}`,
          all_settings: "/api/system/settings",
        },
      },
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
            {} as Record<string, string>,
          ),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
          expected_fields: [
            "key",
            "value",
            "type",
            "description (optional)",
            "isSystem (optional)",
          ],
        },
        { requestId, event },
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
        return responses.conflict(
          "System setting with this key already exists",
          {
            requestId,
            event,
            constraint_field: "key",
          },
        );
      }
      if (prismaError.code === "P2003") {
        return responses.badRequest(
          "Foreign key constraint failed",
          undefined,
          {
            suggestion: "Check that all referenced records exist",
          },
          { requestId, event },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "System setting creation failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "SYSTEM_SETTING_CREATE_ERROR" },
    );
  }
});
