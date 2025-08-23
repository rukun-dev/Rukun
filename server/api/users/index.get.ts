// server/api/users/index.get.ts
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { hasPermission } from "~~/server/helpers/permissions";
import {
  startRequest,
  responses,
  calculatePagination,
} from "~~/server/utils/response";
import { parseApiQuery } from "~~/server/utils/query";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();

  try {
    // Authentication & authorization
    const currentUser = await requireAuth(event);

    // Check permission
    if (!hasPermission(currentUser.role as any, "read:users")) {
      return responses.forbidden(
        `Permission denied. Required permission: read:users`,
        {
          requestId,
          event,
          code: "FORBIDDEN",
        },
      );
    }

    // Parse and validate query parameters using new utility
    const queryData = parseApiQuery(event, {
      pagination: { page: 1, limit: 10, maxLimit: 100 },
      sorting: {
        allowedFields: ["name", "email", "role", "createdAt", "updatedAt"],
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      filters: {
        role: {
          type: "enum",
          allowedValues: [
            "SUPER_ADMIN",
            "KETUA_RT",
            "SEKRETARIS",
            "BENDAHARA",
            "STAFF",
            "WARGA",
          ],
        },
        isActive: { type: "boolean" },
      },
      search: { fields: ["search", "q"] },
      clean: { removeEmpty: true, trimStrings: true, parseBooleans: true },
    });

    const { page, limit } = queryData.pagination;
    const { sortBy, sortOrder } = queryData.sorting;
    const { search } = queryData.search;
    const { role, isActive } = queryData.filters;

    // Build where clause
    const where: any = {
      AND: [],
    };

    // Search filter
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      });
    }

    // Role filter
    if (role) {
      where.AND.push({ role });
    }

    // Active status filter
    if (isActive !== undefined) {
      where.AND.push({ isActive });
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
    const orderBy: any = {};
    if (sortBy === "name" || sortBy === "email" || sortBy === "role") {
      orderBy[sortBy] = sortOrder;
    } else if (sortBy === "createdAt" || sortBy === "updatedAt") {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    // Execute queries in parallel
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
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
              job: true,
              education: true,
            },
          },
          // Count related records for additional info
          _count: {
            select: {
              sessions: true,
              activityLogs: true,
              createdWargas: true,
            },
          },
        },
      }),
    ]);

    // Calculate pagination
    const pagination = calculatePagination(page, limit, total);

    // Build response with enhanced metadata
    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        users: users.map((user) => ({
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
                job: user.profile.job,
                education: user.profile.education,
              }
            : null,
          stats: {
            active_sessions: user._count.sessions,
            activity_logs: user._count.activityLogs,
            created_wargas: user._count.createdWargas,
          },
        })),
        filters: {
          search: search || null,
          role: role || null,
          is_active: isActive !== undefined ? isActive : null,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
        available_roles:
          currentUser.role === "SUPER_ADMIN"
            ? [
                "SUPER_ADMIN",
                "KETUA_RT",
                "SEKRETARIS",
                "BENDAHARA",
                "STAFF",
                "WARGA",
              ]
            : {
                KETUA_RT: [
                  "KETUA_RT",
                  "SEKRETARIS",
                  "BENDAHARA",
                  "STAFF",
                  "WARGA",
                ],
                SEKRETARIS: ["SEKRETARIS", "STAFF", "WARGA"],
                BENDAHARA: ["BENDAHARA", "STAFF", "WARGA"],
                STAFF: ["STAFF", "WARGA"],
                WARGA: ["WARGA"],
              }[currentUser.role] || ["WARGA"],
      },
      "Users retrieved successfully",
      {
        requestId,
        event,
        executionTime,
        pagination,
        links: {
          self: `/api/users?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}${role ? `&role=${role}` : ""}${isActive !== undefined ? `&isActive=${isActive}` : ""}`,
          related: {
            create_user: "/api/users",
            bulk_operations: "/api/users/bulk",
            export_users: "/api/users/export",
          },
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

    // Handle database errors
    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      if (prismaError.code === "P2002") {
        return responses.conflict("Database constraint violation", {
          requestId,
          event,
        });
      }
    }

    const executionTime = `${Date.now() - startedAt}ms`;
    const debug = error instanceof Error ? error.message : "Internal error";
    return responses.serverError(
      "Failed to retrieve users",
      process.env.NODE_ENV === "development" ? debug : undefined,
      { requestId, event, executionTime, code: "USERS_LIST_ERROR" },
    );
  }
});
