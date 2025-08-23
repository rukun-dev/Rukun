// server/middleware/auth.ts
import { defineEventHandler, createError } from "h3";
import { requireAuth } from "~~/server/utils/auth";
import {
  getUserFromContext,
  hasRole,
  type UserRole,
} from "~~/server/helpers/permissions";
import { responses } from "~~/server/utils/response";

// ---- Route Configuration ----

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/api/protected/",
  "/api/user/",
  "/api/users/",
  "/api/admin/",
  "/api/dashboard/",
  "/api/reports/",
  "/api/residents/",
  "/api/announcements/",
  "/api/finances/",
  "/api/documents/",
  "/api/activities/",
  "/api/statistics/",
];

// Routes that are completely public (no auth needed)
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/verify-email",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/refresh",
  "/api/health",
  "/api/ping",
];

// Route-level role requirements (prefix -> allowed roles)
const ROUTE_ROLE_REQUIREMENTS: Array<{
  prefix: string;
  roles: UserRole[];
  description?: string;
}> = [
  {
    prefix: "/api/admin/",
    roles: ["SUPER_ADMIN"],
    description: "Super Admin only routes",
  },
  {
    prefix: "/api/users/manage/",
    roles: ["SUPER_ADMIN", "KETUA_RT"],
    description: "User management routes",
  },
  {
    prefix: "/api/reports/system/",
    roles: ["SUPER_ADMIN", "KETUA_RT"],
    description: "System reports",
  },
  {
    prefix: "/api/finances/manage/",
    roles: ["SUPER_ADMIN", "KETUA_RT", "BENDAHARA"],
    description: "Financial management",
  },
];

// ---- Helper Functions ----

/**
 * Check if route is public (no authentication needed)
 */
function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(route),
  );
}

/**
 * Check if route needs authentication
 */
function needsAuthentication(path: string): boolean {
  // Skip if it's a public route
  if (isPublicRoute(path)) {
    return false;
  }

  // Check if path matches any protected prefix
  return PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/**
 * Get role requirements for a specific route
 */
function getRouteRoleRequirements(path: string): UserRole[] | null {
  const requirement = ROUTE_ROLE_REQUIREMENTS.find((req) =>
    path.startsWith(req.prefix),
  );
  return requirement?.roles || null;
}

/**
 * Create standardized auth error with proper JSON response
 */
function createAuthError(
  event: any,
  message: string,
  code: string,
  statusCode = 401,
) {
  if (statusCode === 401) {
    return responses.unauthorized(message, { code, event });
  } else if (statusCode === 403) {
    return responses.forbidden(message, { code, event });
  }
  return responses.serverError(message, undefined, { code, event });
}

/**
 * Validate route access based on user role
 */
function validateRouteAccess(event: any, path: string): void {
  const requiredRoles = getRouteRoleRequirements(path);

  if (requiredRoles) {
    const userRole = event.context?.userRole as UserRole;

    if (!userRole) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required for this route",
      });
    }

    if (!hasRole(userRole, requiredRoles)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access denied. Required roles: ${requiredRoles.join(", ")}`,
      });
    }
  }
}

/**
 * Enhance user context with additional information
 */
function enhanceUserContext(event: any, user: any): void {
  const userRole = user.role as UserRole;

  // Set context properties
  event.context.user = user;
  event.context.authenticated = true;
  event.context.userId = user.id;
  event.context.userRole = userRole;
  event.context.userEmail = user.email;
  event.context.userName = user.name;

  // Add convenience flags
  event.context.isSuperAdmin = userRole === "SUPER_ADMIN";
  event.context.isKetuaRT = userRole === "KETUA_RT";
  event.context.isStaff = ["SEKRETARIS", "BENDAHARA", "STAFF"].includes(
    userRole,
  );
  event.context.isWarga = userRole === "WARGA";

  // Add role level for hierarchy checks
  const roleLevels: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    KETUA_RT: 80,
    SEKRETARIS: 60,
    BENDAHARA: 60,
    STAFF: 40,
    WARGA: 20,
  };
  event.context.userRoleLevel = roleLevels[userRole] || 0;
}

/**
 * Log authentication events in development
 */
function logAuthEvent(event: any, action: string, details?: any): void {
  if (process.env.NODE_ENV === "development") {
    const path = event.node.req.url || "unknown";
    const method = event.node.req.method || "unknown";
    const userRole = event.context?.userRole || "unauthenticated";

    console.log(
      `[AUTH] ${action} - ${method} ${path} (${userRole})`,
      details || "",
    );
  }
}

// ---- Main Middleware Handler ----

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || "";
  const method = event.node.req.method || "";

  // Skip authentication for public routes
  if (!needsAuthentication(path)) {
    logAuthEvent(event, "SKIP_AUTH", "public route");
    return;
  }

  try {
    logAuthEvent(event, "AUTH_CHECK");

    // Authenticate user using existing auth utility
    const user = await requireAuth(event);

    if (!user) {
      logAuthEvent(event, "AUTH_ERROR", "No user returned");
      return responses.unauthorized("Authentication failed", {
        code: "AUTH_FAILED",
        event,
      });
    }

    // Enhance user context with additional information
    enhanceUserContext(event, user);

    // Validate route-level role access
    validateRouteAccess(event, path);

    logAuthEvent(event, "AUTH_SUCCESS", {
      userId: user.id,
      role: user.role,
      email: user.email,
    });
  } catch (error: any) {
    logAuthEvent(event, "AUTH_ERROR", error.message);

    // Handle authentication errors from requireAuth
    if (error.statusCode === 401) {
      return responses.unauthorized(
        error.statusMessage || "Authentication required",
        { code: "UNAUTHORIZED", event },
      );
    }

    if (error.statusCode === 403) {
      return responses.forbidden(error.statusMessage || "Access forbidden", {
        code: "FORBIDDEN",
        event,
      });
    }

    // Handle JWT/token specific errors
    if (error.name === "TokenExpiredError") {
      return responses.unauthorized("Token expired", {
        code: "TOKEN_EXPIRED",
        event,
      });
    }

    if (error.name === "JsonWebTokenError") {
      return responses.unauthorized("Invalid token format", {
        code: "MALFORMED_TOKEN",
        event,
      });
    }

    // Generic server error
    return responses.serverError(
      "Authentication service error",
      process.env.NODE_ENV === "development" ? error.message : undefined,
      { code: "AUTH_SERVICE_ERROR", event },
    );
  }
});

// ---- Exported Utilities ----

/**
 * Middleware helper to require authentication in route handlers
 * Usage: const user = requireAuthMiddleware(event);
 */
export function requireAuthMiddleware(event: any) {
  const user = getUserFromContext(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication required",
    });
  }

  return user;
}

/**
 * Middleware helper to require specific role
 * Usage: requireRoleMiddleware(event, ["SUPER_ADMIN", "KETUA_RT"]);
 */
export function requireRoleMiddleware(event: any, allowedRoles: UserRole[]) {
  const user = requireAuthMiddleware(event);

  if (!hasRole(user.role, allowedRoles)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
    });
  }

  return user;
}

/**
 * Check if current user can manage another user
 * Usage: canManageUser(event, targetUserId, targetUserRole);
 */
export function canManageUser(event: any, targetUserRole: UserRole): boolean {
  const currentUser = requireAuthMiddleware(event);
  const currentRoleLevel = event.context?.userRoleLevel || 0;

  const targetRoleLevels: Record<UserRole, number> = {
    SUPER_ADMIN: 100,
    KETUA_RT: 80,
    SEKRETARIS: 60,
    BENDAHARA: 60,
    STAFF: 40,
    WARGA: 20,
  };

  const targetRoleLevel = targetRoleLevels[targetUserRole] || 0;

  // Super admin can manage everyone
  if (currentUser.role === "SUPER_ADMIN") {
    return true;
  }

  // Users can only manage users with lower role levels
  return currentRoleLevel > targetRoleLevel;
}

/**
 * Get current user's role level for hierarchy comparisons
 */
export function getUserRoleLevel(event: any): number {
  return event.context?.userRoleLevel || 0;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(event: any): boolean {
  return !!event.context?.authenticated;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(event: any) {
  return event.context?.user || null;
}
