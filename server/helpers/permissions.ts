// server/helpers/permissions.ts
import type { H3Event } from "h3";

export type UserRole =
  | "SUPER_ADMIN"
  | "KETUA_RT"
  | "SEKRETARIS"
  | "BENDAHARA"
  | "STAFF"
  | "WARGA";

export type Permission =
  | "read:all"
  | "write:all"
  | "read:users"
  | "write:users"
  | "read:residents"
  | "write:residents"
  | "read:announcements"
  | "write:announcements"
  | "read:reports"
  | "write:reports"
  | "read:finances"
  | "write:finances"
  | "read:documents"
  | "write:documents"
  | "read:own_profile"
  | "write:own_profile"
  | "read:public_info"
  | "create:documents"
  | "manage:users"
  | "manage:finances"
  | "manage:documents"
  | "manage:announcements"
  | "manage:families"
  | "*";

// Comprehensive role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ["*"],
  KETUA_RT: [
    "read:all",
    "write:all",
    "manage:users",
    "manage:finances",
    "manage:documents",
    "manage:announcements",
  ],
  SEKRETARIS: [
    "read:all",
    "write:documents",
    "write:announcements",
    "read:users",
    "read:finances",
  ],
  BENDAHARA: [
    "read:all",
    "write:finances",
    "read:users",
    "write:reports",
  ],
  STAFF: [
    "read:users",
    "read:residents",
    "write:residents",
    "read:announcements",
    "write:documents",
    "read:finances",
    "read:reports",
  ],
  WARGA: [
    "read:announcements",
    "read:own_profile",
    "write:own_profile",
    "read:public_info",
    "create:documents",
  ],
};

// Role hierarchy levels
export const ROLE_LEVELS: Record<UserRole, number> = {
  SUPER_ADMIN: 100,
  KETUA_RT: 80,
  SEKRETARIS: 60,
  BENDAHARA: 60,
  STAFF: 40,
  WARGA: 20,
};

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get role level for hierarchy comparison
 */
export function getRoleLevel(role: UserRole): number {
  return ROLE_LEVELS[role] || 0;
}

/**
 * Check if user has specific permission with hierarchical support
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const userPermissions = getRolePermissions(userRole);

  // Check for wildcard permission (Super Admin)
  if (userPermissions.includes("*")) {
    return true;
  }

  // Check for exact permission match
  if (userPermissions.includes(permission)) {
    return true;
  }

  // Parse permission parts
  const [action, resource] = permission.split(":") as [string, string];

  // Check hierarchical permissions
  if (action && resource) {
    // If user has "read:all" or "write:all", they have access to all resources of that type
    if (userPermissions.includes(`${action}:all` as Permission)) {
      return true;
    }

    // If user has "manage:resource", they have read/write access to that resource
    if (
      userPermissions.includes(`manage:${resource}` as Permission) &&
      (action === "read" || action === "write")
    ) {
      return true;
    }

    // Special case: "write:all" implies "read:all"
    if (action === "read" && userPermissions.includes("write:all")) {
      return true;
    }

    // Special case: manage permissions imply read/write for that resource
    const managePermissions = userPermissions.filter((p) =>
      p.startsWith("manage:"),
    );
    for (const managePerm of managePermissions) {
      const managedResource = managePerm.split(":")[1];
      if (managedResource === resource && (action === "read" || action === "write")) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(userRole, permission));
}

/**
 * Check if user role is in allowed roles list
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Check if manager can manage target user based on role hierarchy
 */
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === "SUPER_ADMIN") {
    return true;
  }

  const managerLevel = getRoleLevel(managerRole);
  const targetLevel = getRoleLevel(targetRole);

  return managerLevel > targetLevel;
}

/**
 * Get permissions that a role can grant to others
 */
export function getGrantablePermissions(role: UserRole): Permission[] {
  const rolePermissions = getRolePermissions(role);

  if (rolePermissions.includes("*")) {
    return Object.values(ROLE_PERMISSIONS).flat().filter((p, i, arr) => arr.indexOf(p) === i);
  }

  // Return only permissions that the role actually has
  return rolePermissions;
}

/**
 * Check if user can access specific resource based on ownership
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resourceOwnerId: string,
  permission: Permission,
): boolean {
  // Check if user has general permission
  if (hasPermission(userRole, permission)) {
    return true;
  }

  // Check if user is accessing their own resource
  if (userId === resourceOwnerId) {
    const [action] = permission.split(":");
    return hasPermission(userRole, `${action}:own_profile` as Permission);
  }

  return false;
}

/**
 * Filter permissions based on user role
 */
export function filterPermissionsByRole(
  permissions: Permission[],
  userRole: UserRole,
): Permission[] {
  return permissions.filter((permission) => hasPermission(userRole, permission));
}

/**
 * Get user context from H3Event
 */
export function getUserFromContext(event: H3Event): {
  id: string;
  role: UserRole;
  permissions: Permission[];
} | null {
  const user = event.context?.user;
  const userRole = event.context?.userRole;
  const userPermissions = event.context?.userPermissions;

  if (!user || !userRole) {
    return null;
  }

  return {
    id: user.id,
    role: userRole,
    permissions: userPermissions || getRolePermissions(userRole),
  };
}

/**
 * Permission middleware helper
 */
export function requirePermission(permission: Permission) {
  return (event: H3Event) => {
    const user = getUserFromContext(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    if (!hasPermission(user.role, permission)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Permission denied. Required permission: ${permission}`,
      });
    }

    return user;
  };
}

/**
 * Multiple permissions middleware helper
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (event: H3Event) => {
    const user = getUserFromContext(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    if (!hasAnyPermission(user.role, permissions)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Permission denied. Required permissions: ${permissions.join(" OR ")}`,
      });
    }

    return user;
  };
}

/**
 * All permissions middleware helper
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (event: H3Event) => {
    const user = getUserFromContext(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    if (!hasAllPermissions(user.role, permissions)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Permission denied. Required permissions: ${permissions.join(" AND ")}`,
      });
    }

    return user;
  };
}

/**
 * Role middleware helper
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (event: H3Event) => {
    const user = getUserFromContext(event);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication required",
      });
    }

    if (!hasRole(user.role, allowedRoles)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    return user;
  };
}

/**
 * Debug helper to log user permissions
 */
export function debugPermissions(userRole: UserRole, permission?: Permission): void {
  if (process.env.NODE_ENV === "development") {
    const permissions = getRolePermissions(userRole);
    console.log(`[DEBUG] Role: ${userRole}`);
    console.log(`[DEBUG] Permissions:`, permissions);

    if (permission) {
      console.log(`[DEBUG] Checking permission: ${permission}`);
      console.log(`[DEBUG] Has permission: ${hasPermission(userRole, permission)}`);
    }
  }
}

// Export all functions and types
export default {
  getRolePermissions,
  getRoleLevel,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  canManageUser,
  getGrantablePermissions,
  canAccessResource,
  filterPermissionsByRole,
  getUserFromContext,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  debugPermissions,
  ROLE_PERMISSIONS,
  ROLE_LEVELS,
};
