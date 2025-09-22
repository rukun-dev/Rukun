// server/api/system/settings/index.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Query parameters validation
const settingsQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().max(255).optional(),
  type: z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"]).optional(),
  system: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1, "Page must be at least 1")
    .default(() => 1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a number")
    .transform((val) => parseInt(val))
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100")
    .default(() => 50),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication - only authenticated users can view system settings
    const currentUser = await requireAuth(event);

    // Only SUPER_ADMIN and KETUA_RT can view system settings
    if (!["SUPER_ADMIN", "KETUA_RT"].includes(currentUser.role)) {
      return responses.forbidden(
        "You don't have permission to view system settings",
        { requestId, event },
      );
    }

    // Parse and validate query parameters
    const query = getQuery(event);
    const validatedQuery = settingsQuerySchema.parse(query);

    const { category, search, type, system, page, limit } = validatedQuery;

    // Build where clause for filtering
    const whereClause: any = {};

    if (category) {
      whereClause.key = { contains: category.toUpperCase() };
    }

    if (search) {
      whereClause.OR = [
        { key: { contains: search.toUpperCase() } },
        { value: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (typeof system === "boolean") {
      whereClause.isSystem = system;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get settings with pagination
    const [settings, totalCount] = await Promise.all([
      prisma.systemSetting.findMany({
        where: whereClause,
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
        orderBy: [
          { isSystem: "desc" }, // System settings first
          { key: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.systemSetting.count({ where: whereClause }),
    ]);

    // Group settings by category (based on key prefix)
    const groupedSettings = settings.reduce(
      (acc, setting) => {
        const keyParts = setting.key.split("_");
        const category = keyParts[0] || "GENERAL";

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
          is_system: setting.isSystem,
          created_at: setting.createdAt.toISOString(),
          updated_at: setting.updatedAt.toISOString(),
          can_edit: !setting.isSystem || currentUser.role === "SUPER_ADMIN",
        });

        return acc;
      },
      {} as Record<string, any[]>,
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        settings: settings.map((setting) => ({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          type: setting.type,
          description: setting.description,
          is_system: setting.isSystem,
          created_at: setting.createdAt.toISOString(),
          updated_at: setting.updatedAt.toISOString(),
          can_edit: !setting.isSystem || currentUser.role === "SUPER_ADMIN",
        })),
        grouped_settings: groupedSettings,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_count: totalCount,
          per_page: limit,
          has_next: hasNext,
          has_previous: hasPrevious,
          next_page: hasNext ? page + 1 : null,
          previous_page: hasPrevious ? page - 1 : null,
        },
        filters_applied: {
          category: category || null,
          search: search || null,
          type: type || null,
          system: typeof system === "boolean" ? system : null,
        },
        available_categories: Object.keys(groupedSettings).sort(),
        available_types: ["STRING", "NUMBER", "BOOLEAN", "JSON"],
        permissions: {
          can_create: currentUser.role === "SUPER_ADMIN",
          can_edit_system: currentUser.role === "SUPER_ADMIN",
          can_edit_non_system: ["SUPER_ADMIN", "KETUA_RT"].includes(
            currentUser.role,
          ),
        },
      },
      "System settings retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        links: {
          self: "/api/system/settings",
          create: "/api/system/settings",
          rt_profile: "/api/rt-profile",
          ...(hasNext
            ? { next: `/api/system/settings?page=${page + 1}&limit=${limit}` }
            : {}),
          ...(hasPrevious
            ? {
                previous: `/api/system/settings?page=${page - 1}&limit=${limit}`,
              }
            : {}),
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid query parameters",
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
        return responses.serverError(
          "Database constraint error",
          process.env.NODE_ENV === "development"
            ? prismaError.message
            : undefined,
          { requestId, event, code: "DATABASE_CONSTRAINT_ERROR" },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "Failed to retrieve system settings",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "SYSTEM_SETTINGS_GET_ERROR" },
    );
  }
});
