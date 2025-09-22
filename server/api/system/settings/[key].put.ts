// server/api/system/settings/[key].put.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";
import { hasPermission } from "~~/server/helpers/permissions";
import { logSystemSettingUpdate } from "~~/server/utils/activity-log";
import {
  updateSystemSettingSchema,
  settingKeyParamSchema,
} from "~~/server/validators/rt-profile";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization - only SUPER_ADMIN and KETUA_RT can update settings
    const currentUser = await requireAuth(event);

    if (!["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to update system settings",
        { requestId, event },
      );
    }

    // Validate route parameter
    const { key } = settingKeyParamSchema.parse({
      key: getRouterParam(event, "key"),
    });

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = updateSystemSettingSchema.parse(body);

    // Check if setting exists
    const existingSetting = await prisma.systemSetting.findUnique({
      where: { key },
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

    if (!existingSetting) {
      return responses.notFound(`System setting '${key}' not found`, {
        requestId,
        event,
        available_actions: {
          create: "/api/system/settings",
          view_all: "/api/system/settings",
        },
      });
    }

    // Check if user can edit this setting
    const canEdit =
      !existingSetting.isSystem || currentUser.role === "SUPER_ADMIN";
    if (!canEdit) {
      return responses.forbidden(
        `You don't have permission to update system setting '${key}'`,
        {
          requestId,
          event,
          reason: "System settings can only be modified by SUPER_ADMIN",
          setting_type: "system",
        },
      );
    }

    // Validate value based on setting type
    let validatedValue = validatedData.value;
    try {
      switch (existingSetting.type) {
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
        `Invalid value for ${existingSetting.type} type: ${parseError instanceof Error ? parseError.message : "Invalid format"}`,
        "value",
        {
          expected_type: existingSetting.type,
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

    // Track changes for activity log
    const changes: string[] = [];
    if (validatedValue !== existingSetting.value) {
      changes.push(`Value: ${existingSetting.value} → ${validatedValue}`);
    }
    if (
      validatedData.description !== undefined &&
      validatedData.description !== existingSetting.description
    ) {
      changes.push(
        `Description: ${existingSetting.description || "null"} → ${validatedData.description || "null"}`,
      );
    }

    // Update setting in transaction
    const updatedSetting = await prisma.$transaction(async (tx) => {
      // Update setting
      const setting = await tx.systemSetting.update({
        where: { key },
        data: {
          value: validatedValue,
          ...(validatedData.description !== undefined && {
            description: validatedData.description,
          }),
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

      // Log system setting update activity
      await logSystemSettingUpdate({
        userId: currentUser.id,
        settingKey: key,
        changes,
        event,
        transaction: tx,
      });

      return setting;
    });

    const executionTime = `${Date.now() - startedAt}ms`;

    // Parse value for display based on type
    let displayValue: any = updatedSetting.value;
    try {
      switch (updatedSetting.type) {
        case "NUMBER":
          displayValue = parseFloat(updatedSetting.value);
          break;
        case "BOOLEAN":
          displayValue = updatedSetting.value === "true";
          break;
        case "JSON":
          displayValue = JSON.parse(updatedSetting.value);
          break;
        default:
          displayValue = updatedSetting.value;
      }
    } catch {
      // Keep original value if parsing fails
      displayValue = updatedSetting.value;
    }

    return responses.ok(
      {
        setting: {
          id: updatedSetting.id,
          key: updatedSetting.key,
          value: updatedSetting.value,
          display_value: displayValue,
          type: updatedSetting.type,
          description: updatedSetting.description,
          is_system: updatedSetting.isSystem,
          created_at: updatedSetting.createdAt.toISOString(),
          updated_at: updatedSetting.updatedAt.toISOString(),
        },
        changes_made: changes,
        updated_by: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        validation_info: {
          type: updatedSetting.type,
          parsed_successfully: displayValue !== updatedSetting.value,
        },
      },
      "System setting updated successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: `/api/system/settings/${key}`,
          all_settings: "/api/system/settings",
          rt_profile: "/api/rt-profile",
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
      if (prismaError.code === "P2025") {
        return responses.notFound(`System setting not found`, {
          requestId,
          event,
        });
      }
      if (prismaError.code === "P2002") {
        return responses.conflict("Setting key already exists", {
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
      "System setting update failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "SYSTEM_SETTING_UPDATE_ERROR" },
    );
  }
});
