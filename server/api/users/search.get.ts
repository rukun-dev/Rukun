// server/api/users/search.get.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import {
  startRequest,
  responses,
  calculatePagination,
} from "~~/server/utils/response";

// Advanced search query parameters validation schema
const searchUsersSchema = z.object({
  // Pagination
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return 1;
      return typeof val === "string" ? parseInt(val, 10) : val;
    })
    .refine((val) => val >= 1, "Page must be at least 1"),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val || val === "") return 20;
      return typeof val === "string" ? parseInt(val, 10) : val;
    })
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100"),

  // Search filters
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

  // Role and status filters
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

  // Profile filters
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

  // Date filters
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

  // Age filters
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

  // Activity filters
  hasRecentActivity: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : undefined)),
  lastLoginAfter: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),
  lastLoginBefore: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val.trim();
    })
    .refine((val) => !val || !isNaN(Date.parse(val)), "Invalid ISO datetime"),

  // Sorting
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

  // Additional options
  includeInactive: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : false)),
  includeStats: z
    .string()
    .optional()
    .transform((val) => (val?.trim() === "true" ? true : false)),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Check permission
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

    // Parse and validate query parameters
    const query = getQuery(event);
    const searchParams = searchUsersSchema.parse(query);

    const {
      page,
      limit,
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
      lastLoginAfter,
      lastLoginBefore,
      sortBy,
      sortOrder,
      includeInactive,
      includeStats,
    } = searchParams;

    // Build complex where clause
    const where: any = {
      AND: [],
    };

    // General search query (searches across multiple fields)
    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { profile: { nik: { contains: q } } },
          { profile: { address: { contains: q } } },
        ],
      });
    }

    // Specific field searches
    if (name) {
      where.AND.push({ name: { contains: name } });
    }
    if (email) {
      where.AND.push({ email: { contains: email } });
    }
    if (phone) {
      where.AND.push({ phone: { contains: phone } });
    }
    if (nik) {
      where.AND.push({ profile: { nik: { contains: nik } } });
    }
    if (address) {
      where.AND.push({
        profile: { address: { contains: address } },
      });
    }

    // Role filters
    if (role) {
      where.AND.push({ role });
    }
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

    // Status filters
    if (typeof isActive === "boolean") {
      where.AND.push({ isActive });
    } else if (!includeInactive) {
      where.AND.push({ isActive: true });
    }

    // Profile existence filters
    if (hasProfile) {
      where.AND.push({ profile: { isNot: null } });
    }
    if (hasAvatar) {
      where.AND.push({ avatar: { not: null } });
    }
    if (hasNik) {
      where.AND.push({ profile: { nik: { not: null } } });
    }
    if (hasPhone) {
      where.AND.push({ phone: { not: null } });
    }

    // Date filters
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

    // Age filters
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

      where.AND.push({
        profile: {
          birthDate: birthDateFilter,
        },
      });
    }

    // Activity filters
    if (hasRecentActivity) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      where.AND.push({
        activityLogs: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      });
    }

    // Role-based filtering - users can only see users with equal or lower role levels
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

      where.AND.push({
        role: { in: allowedRoles },
      });
    }

    // Clean empty AND array
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Build order by clause
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
      case "profileCompletion":
        // This would require a complex calculation, fallback to createdAt
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          avatar: true,
          avatarPublicId: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              id: true,
              nik: true,
              address: true,
              birthDate: true,
              birthPlace: true,
              job: true,
              education: true,
              maritalStatus: true,
            },
          },
          ...(includeStats
            ? {
                _count: {
                  select: {
                    sessions: true,
                    activityLogs: true,
                    createdWargas: true,
                    families: true,
                  },
                },
              }
            : {}),
          ...(includeStats
            ? {
                sessions: {
                  where: { expiresAt: { gt: new Date() } },
                  select: { id: true },
                  take: 1,
                },
                activityLogs: {
                  orderBy: { createdAt: "desc" },
                  select: { createdAt: true },
                  take: 1,
                },
              }
            : {}),
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate additional statistics if requested
    let searchStats = undefined;
    if (includeStats) {
      searchStats = {
        total_found: totalCount,
        active_users: users.filter((u) => u.isActive).length,
        users_with_profiles: users.filter((u) => u.profile).length,
        users_with_avatars: users.filter((u) => u.avatar).length,
        role_distribution: users.reduce(
          (acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      };
    }

    // Calculate pagination
    const pagination = calculatePagination(page, limit, totalCount);

    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        users: users.map((user) => {
          // Calculate profile completion percentage
          const profileFields = [
            user.profile?.nik,
            user.profile?.address,
            user.profile?.birthDate,
            user.profile?.birthPlace,
            user.profile?.job,
            user.profile?.education,
            user.profile?.maritalStatus,
            user.phone,
            user.avatar,
          ];
          const filledFields = profileFields.filter(
            (field) => field !== null && field !== undefined,
          );
          const completionPercentage = Math.round(
            (filledFields.length / profileFields.length) * 100,
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            is_active: user.isActive,
            avatar: user.avatar,
            avatar_public_id: user.avatarPublicId,
            created_at: user.createdAt.toISOString(),
            updated_at: user.updatedAt.toISOString(),
            profile: user.profile
              ? {
                  id: user.profile.id,
                  nik: user.profile.nik,
                  address: user.profile.address,
                  birth_date: user.profile.birthDate?.toISOString(),
                  birth_place: user.profile.birthPlace,
                  job: user.profile.job,
                  education: user.profile.education,
                  marital_status: user.profile.maritalStatus,
                  completion_percentage: completionPercentage,
                }
              : null,
            ...(includeStats
              ? {
                  stats: {
                    active_sessions: (user as any)._count?.sessions || 0,
                    total_activities: (user as any)._count?.activityLogs || 0,
                    created_wargas: (user as any)._count?.createdWargas || 0,
                    managed_families: (user as any)._count?.families || 0,
                    last_activity: (
                      user as any
                    ).activityLogs?.[0]?.createdAt?.toISOString(),
                    has_active_session: (user as any).sessions?.length > 0,
                  },
                }
              : {}),
          };
        }),
        search_meta: {
          query: q,
          filters_applied: {
            name,
            email,
            phone,
            nik,
            address,
            role,
            roles,
            is_active: isActive,
            has_profile: hasProfile,
            has_avatar: hasAvatar,
            has_nik: hasNik,
            has_phone: hasPhone,
            created_after: createdAfter,
            created_before: createdBefore,
            updated_after: updatedAfter,
            updated_before: updatedBefore,
            age_min: ageMin,
            age_max: ageMax,
            has_recent_activity: hasRecentActivity,
            sort_by: sortBy,
            sort_order: sortOrder,
            include_inactive: includeInactive,
          },
          total_results: totalCount,
          search_took: executionTime,
        },
        ...(searchStats ? { statistics: searchStats } : {}),
      },
      `Found ${totalCount} users matching search criteria`,
      {
        requestId,
        event,
        executionTime,
        pagination,
        links: {
          self: `/api/users/search?${new URLSearchParams(query as Record<string, string>).toString()}`,
          related: {
            all_users: "/api/users",
            create_user: "/api/users",
            bulk_operations: "/api/users/bulk",
            export_results: `/api/users/search/export?${new URLSearchParams(query as Record<string, string>).toString()}`,
          },
        },
      },
    );
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Invalid search parameters",
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
          available_sort_fields: [
            "name",
            "email",
            "role",
            "createdAt",
            "updatedAt",
            "lastLogin",
            "activityCount",
            "profileCompletion",
          ],
          available_roles: [
            "SUPER_ADMIN",
            "KETUA_RT",
            "SEKRETARIS",
            "BENDAHARA",
            "STAFF",
            "WARGA",
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

    // Handle database errors
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

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to execute user search",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "USER_SEARCH_ERROR" },
    );
  }
});
