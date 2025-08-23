// server/api/users/search/export.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth, getClientIP } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import { startRequest, responses } from "~~/server/utils/response";

// Export search results schema
const exportSearchSchema = z.object({
  // Format
  format: z.enum(["json", "csv", "excel"]).default("json"),

  // Search filters (same as search endpoint)
  q: z
    .string()
    .max(255)
    .optional()
    .transform((val) => val?.trim() || undefined),
  name: z
    .string()
    .max(100)
    .optional()
    .transform((val) => val?.trim() || undefined),
  email: z
    .string()
    .max(255)
    .optional()
    .transform((val) => val?.trim() || undefined),
  phone: z
    .string()
    .max(20)
    .optional()
    .transform((val) => val?.trim() || undefined),
  nik: z
    .string()
    .max(20)
    .optional()
    .transform((val) => val?.trim() || undefined),
  address: z
    .string()
    .max(255)
    .optional()
    .transform((val) => val?.trim() || undefined),

  role: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const trimmed = val.trim();
      const validRoles = [
        "SUPER_ADMIN",
        "KETUA_RT",
        "SEKRETARIS",
        "BENDAHARA",
        "STAFF",
        "WARGA",
      ];
      return validRoles.includes(trimmed) ? trimmed : undefined;
    }),
  roles: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  isActive: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return undefined;
      if (typeof val === "boolean") return val;
      const str = val.toString().toLowerCase().trim();
      if (str === "" || str === "null" || str === "undefined") return undefined;
      if (str === "true" || str === "1" || str === "yes") return true;
      if (str === "false" || str === "0" || str === "no") return false;
      return undefined;
    }),

  hasProfile: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),
  hasAvatar: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),
  hasNik: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),
  hasPhone: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),

  createdAfter: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),
  createdBefore: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),
  updatedAfter: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),
  updatedBefore: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),

  ageMin: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const num = parseInt(val.trim(), 10);
      return isNaN(num) ? undefined : num;
    })
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 150),
      "Age must be between 0 and 150",
    ),
  ageMax: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      const num = parseInt(val.trim(), 10);
      return isNaN(num) ? undefined : num;
    })
    .refine(
      (val) => val === undefined || (val >= 0 && val <= 150),
      "Age must be between 0 and 150",
    ),

  hasRecentActivity: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),

  sortBy: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return "createdAt";
      const trimmed = val.trim();
      const validSortFields = [
        "name",
        "email",
        "role",
        "createdAt",
        "updatedAt",
        "lastLogin",
        "activityCount",
        "profileCompletion",
      ];
      return validSortFields.includes(trimmed) ? trimmed : "createdAt";
    }),
  sortOrder: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return "desc";
      const trimmed = val.trim().toLowerCase();
      return trimmed === "asc" ? "asc" : "desc";
    }),

  includeInactive: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : false)),

  // Export options
  limit: z.number().int().min(1).max(10000).default(1000),
  includeProfile: z.boolean().default(true),
  includeStats: z.boolean().default(false),
  includeContacts: z.boolean().default(true),
});

// Helper function to build export data structure
function buildExportData(
  users: any[],
  options: {
    includeProfile: boolean;
    includeStats: boolean;
    includeContacts: boolean;
  },
) {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Role",
    "Status",
    "Created At",
    "Updated At",
  ];

  if (options.includeContacts) {
    headers.push("Phone");
  }

  if (options.includeProfile) {
    headers.push(
      "NIK",
      "Birth Date",
      "Birth Place",
      "Address",
      "Job",
      "Education",
      "Marital Status",
      "Profile Completion %",
    );
  }

  if (options.includeStats) {
    headers.push(
      "Active Sessions",
      "Total Activities",
      "Created Wargas",
      "Last Activity",
    );
  }

  const rows = users.map((user) => {
    const row = [
      user.id,
      user.name,
      user.email,
      user.role,
      user.is_active ? "Active" : "Inactive",
      user.created_at,
      user.updated_at,
    ];

    if (options.includeContacts) {
      row.push(user.phone || "");
    }

    if (options.includeProfile && user.profile) {
      row.push(
        user.profile.nik || "",
        user.profile.birth_date || "",
        user.profile.birth_place || "",
        user.profile.address || "",
        user.profile.job || "",
        user.profile.education || "",
        user.profile.marital_status || "",
        user.profile.completion_percentage || 0,
      );
    } else if (options.includeProfile) {
      row.push("", "", "", "", "", "", "", 0);
    }

    if (options.includeStats && user.stats) {
      row.push(
        user.stats.active_sessions || 0,
        user.stats.total_activities || 0,
        user.stats.created_wargas || 0,
        user.stats.last_activity || "",
      );
    } else if (options.includeStats) {
      row.push(0, 0, 0, "");
    }

    return row;
  });

  return { headers, rows };
}

// Helper function to convert to CSV
function dataToCSV(headers: string[], rows: any[][]): string {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((field) =>
          typeof field === "string" &&
          (field.includes(",") || field.includes("\n") || field.includes('"'))
            ? `"${field.replace(/"/g, '""')}"`
            : field,
        )
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

// Helper function to create Excel-compatible CSV (tab-separated for better compatibility)
function dataToExcelCSV(headers: string[], rows: any[][]): string {
  const tsvContent = [
    headers.join("\t"),
    ...rows.map((row) =>
      row
        .map((field) => {
          const stringField = String(field || "");
          // For Excel compatibility, escape tabs and newlines
          return stringField
            .replace(/\t/g, " ")
            .replace(/\n/g, " ")
            .replace(/\r/g, " ");
        })
        .join("\t"),
    ),
  ].join("\n");

  return tsvContent;
}

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Check permission using helper
    if (!hasPermission(currentUser.role as any, "read:users")) {
      return responses.forbidden(
        "Permission denied. Required permission: read:users",
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse and validate request body
    body = await readBody(event);
    const validatedData = exportSearchSchema.parse(body);

    const {
      format,
      q,
      name,
      email,
      phone,
      nik,
      address,
      role,
      roles,
      isActive,
      hasProfile,
      hasAvatar,
      hasNik,
      hasPhone,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      ageMin,
      ageMax,
      hasRecentActivity,
      sortBy,
      sortOrder,
      includeInactive,
      limit,
      includeProfile,
      includeStats,
      includeContacts,
    } = validatedData;

    // Build the same where clause as search endpoint
    const where: any = { AND: [] };

    // Apply all the same filters as the search endpoint
    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { profile: { nik: { contains: q } } },
          { profile: { address: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    if (name) where.AND.push({ name: { contains: name, mode: "insensitive" } });
    if (email)
      where.AND.push({ email: { contains: email, mode: "insensitive" } });
    if (phone) where.AND.push({ phone: { contains: phone } });
    if (nik) where.AND.push({ profile: { nik: { contains: nik } } });
    if (address)
      where.AND.push({
        profile: { address: { contains: address, mode: "insensitive" } },
      });

    if (role) where.AND.push({ role });
    if (roles) {
      const roleList = roles
        .split(",")
        .filter((r) =>
          [
            "SUPER_ADMIN",
            "KETUA_RT",
            "SEKRETARIS",
            "BENDAHARA",
            "STAFF",
            "WARGA",
          ].includes(r),
        );
      if (roleList.length > 0) {
        where.AND.push({ role: { in: roleList } });
      }
    }

    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    } else if (!includeInactive) {
      where.AND.push({ isActive: true });
    }

    if (hasProfile) where.AND.push({ profile: { isNot: null } });
    if (hasAvatar) where.AND.push({ avatar: { not: null } });
    if (hasNik) where.AND.push({ profile: { nik: { not: null } } });
    if (hasPhone) where.AND.push({ phone: { not: null } });

    if (createdAfter || createdBefore) {
      const dateFilter: any = {};
      if (createdAfter) dateFilter.gte = new Date(createdAfter);
      if (createdBefore) dateFilter.lte = new Date(createdBefore);
      where.AND.push({ createdAt: dateFilter });
    }

    if (updatedAfter || updatedBefore) {
      const dateFilter: any = {};
      if (updatedAfter) dateFilter.gte = new Date(updatedAfter);
      if (updatedBefore) dateFilter.lte = new Date(updatedBefore);
      where.AND.push({ updatedAt: dateFilter });
    }

    if (ageMin !== undefined || ageMax !== undefined) {
      const now = new Date();
      const birthDateFilter: any = {};

      if (ageMax !== undefined) {
        const minBirthDate = new Date(
          now.getFullYear() - ageMax - 1,
          now.getMonth(),
          now.getDate(),
        );
        birthDateFilter.gte = minBirthDate;
      }

      if (ageMin !== undefined) {
        const maxBirthDate = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate(),
        );
        birthDateFilter.lte = maxBirthDate;
      }

      where.AND.push({ profile: { birthDate: birthDateFilter } });
    }

    if (hasRecentActivity) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      where.AND.push({
        activityLogs: { some: { createdAt: { gte: thirtyDaysAgo } } },
      });
    }

    // Role-based filtering
    if (currentUser.role !== "SUPER_ADMIN") {
      const roleHierarchy = {
        KETUA_RT: ["KETUA_RT", "SEKRETARIS", "BENDAHARA", "STAFF", "WARGA"],
        SEKRETARIS: ["SEKRETARIS", "STAFF", "WARGA"],
        BENDAHARA: ["BENDAHARA", "STAFF", "WARGA"],
        STAFF: ["STAFF", "WARGA"],
        WARGA: ["WARGA"],
      };

      const allowedRoles = roleHierarchy[
        currentUser.role as keyof typeof roleHierarchy
      ] || ["WARGA"];
      where.AND.push({ role: { in: allowedRoles } });
    }

    if (where.AND.length === 0) delete where.AND;

    // Build order by
    let orderBy: any = {};
    switch (sortBy) {
      case "name":
      case "email":
      case "role":
      case "createdAt":
      case "updatedAt":
        orderBy[sortBy] = sortOrder;
        break;
      case "lastLogin":
        orderBy = { sessions: { _count: sortOrder } };
        break;
      case "activityCount":
        orderBy = { activityLogs: { _count: sortOrder } };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get users for export
    const users = await prisma.user.findMany({
      where,
      orderBy,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: includeContacts,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        ...(includeProfile
          ? {
              profile: {
                select: {
                  nik: true,
                  birthDate: true,
                  birthPlace: true,
                  address: true,
                  job: true,
                  education: true,
                  maritalStatus: true,
                },
              },
            }
          : {}),
        ...(includeStats
          ? {
              _count: {
                select: {
                  sessions: { where: { expiresAt: { gt: new Date() } } },
                  activityLogs: true,
                  createdWargas: true,
                },
              },
              activityLogs: {
                orderBy: { createdAt: "desc" },
                select: { createdAt: true },
                take: 1,
              },
            }
          : {}),
      },
    });

    if (users.length === 0) {
      return responses.notFound("No users found matching the export criteria", {
        requestId,
        event,
        applied_filters: validatedData,
      });
    }

    const clientIP = getClientIP(event);
    const userAgent = getHeader(event, "user-agent");

    // Transform users data
    const transformedUsers = users.map((user) => {
      let profileCompletionPercentage = 0;

      if (includeProfile && user.profile) {
        const profileFields = [
          user.profile.nik,
          user.profile.birthDate,
          user.profile.birthPlace,
          user.profile.address,
          user.profile.job,
          user.profile.education,
          user.profile.maritalStatus,
          user.phone,
          user.avatar,
        ];
        const filledFields = profileFields.filter(
          (field) => field !== null && field !== undefined,
        );
        profileCompletionPercentage = Math.round(
          (filledFields.length / profileFields.length) * 100,
        );
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.isActive,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
        ...(includeProfile && user.profile
          ? {
              profile: {
                nik: user.profile.nik,
                birth_date: user.profile.birthDate?.toISOString(),
                birth_place: user.profile.birthPlace,
                address: user.profile.address,
                job: user.profile.job,
                education: user.profile.education,
                marital_status: user.profile.maritalStatus,
                completion_percentage: profileCompletionPercentage,
              },
            }
          : {}),
        ...(includeStats
          ? {
              stats: {
                active_sessions: (user as any)._count?.sessions || 0,
                total_activities: (user as any)._count?.activityLogs || 0,
                created_wargas: (user as any)._count?.createdWargas || 0,
                last_activity: (
                  user as any
                ).activityLogs?.[0]?.createdAt?.toISOString(),
              },
            }
          : {}),
      };
    });

    // Generate export content based on format
    let exportContent: string | Buffer;
    let mimeType: string;
    let fileExtension: string;
    let fileName: string;

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFileName = `user-search-export-${timestamp}`;

    // Build export data structure
    const exportData = buildExportData(transformedUsers, {
      includeProfile,
      includeStats,
      includeContacts,
    });

    switch (format) {
      case "csv":
        exportContent = dataToCSV(exportData.headers, exportData.rows);
        mimeType = "text/csv; charset=utf-8";
        fileExtension = "csv";
        fileName = `${baseFileName}.csv`;
        break;

      case "excel":
        exportContent = dataToExcelCSV(exportData.headers, exportData.rows);
        mimeType = "text/tab-separated-values; charset=utf-8";
        fileExtension = "tsv";
        fileName = `${baseFileName}.tsv`;
        break;

      case "json":
      default:
        exportContent = JSON.stringify(
          {
            exported_at: new Date().toISOString(),
            exported_by: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            },
            search_criteria: validatedData,
            export_options: {
              include_profile: includeProfile,
              include_stats: includeStats,
              include_contacts: includeContacts,
            },
            total_records: users.length,
            users: transformedUsers,
          },
          null,
          2,
        );
        mimeType = "application/json; charset=utf-8";
        fileExtension = "json";
        fileName = `${baseFileName}.json`;
        break;
    }

    const executionTime = `${Date.now() - startedAt}ms`;

    // Log the export activity
    await prisma.activityLog.create({
      data: {
        userId: currentUser.id,
        action: "EXPORT_USER_SEARCH",
        description: `Exported ${users.length} users from search results in ${format.toUpperCase()} format`,
        ipAddress: clientIP,
        userAgent,
      },
    });

    // Set response headers for file download    setHeader(event, "Content-Type", mimeType);
    setHeader(
      event,
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );
    setHeader(event, "Cache-Control", "no-cache, no-store, must-revalidate");
    setHeader(event, "Pragma", "no-cache");
    setHeader(event, "Expires", "0");
    setHeader(event, "Access-Control-Expose-Headers", "Content-Disposition");
    setHeader(event, "X-Request-ID", requestId);
    setHeader(event, "X-Execution-Time", executionTime);
    setHeader(event, "X-Total-Records", users.length.toString());
    setHeader(event, "X-Export-Format", format.toUpperCase());
    setHeader(event, "X-Export-Timestamp", new Date().toISOString());

    // Add BOM for CSV and Excel files to ensure proper encoding
    if (
      (format === "csv" || format === "excel") &&
      typeof exportContent === "string"
    ) {
      exportContent = "\ufeff" + exportContent;
    }

    // Return raw file content for download
    return exportContent;
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
          available_formats: ["json", "csv", "excel"],
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
      if (prismaError.code === "P2021") {
        return responses.serverError(
          "Database table not found",
          process.env.NODE_ENV === "development"
            ? prismaError.message
            : undefined,
          { requestId, event, code: "TABLE_NOT_FOUND" },
        );
      }
    }

    // Generic server error
    const executionTime = `${Date.now() - startedAt}ms`;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return responses.serverError(
      "User search export failed due to server error",
      process.env.NODE_ENV === "development" ? errorMessage : undefined,
      { requestId, event, executionTime, code: "USER_SEARCH_EXPORT_ERROR" },
    );
  }
});
