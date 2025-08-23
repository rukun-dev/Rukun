// server/utils/auth.ts - Fixed for String ID and proper Role enum
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authErrorResponse, forbiddenResponse } from "~~/server/utils/response";
import { getHeader, getCookie, createError } from "h3";
import {
  hasPermission,
  canManageUser,
  getRoleLevel,
  type UserRole,
  type Permission,
  ROLE_PERMISSIONS,
} from "~~/server/helpers/permissions";

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string; // FIXED: String instead of number
  role: UserRole;
  email: string;
  iat?: number;
  exp?: number;
}

// Helper function to get client IP address
export function getClientIP(event: any): string {
  // Check various headers for IP address
  const headers = [
    "x-forwarded-for",
    "x-real-ip",
    "x-client-ip",
    "cf-connecting-ip", // Cloudflare
    "x-forwarded",
    "forwarded-for",
    "forwarded",
  ];

  for (const header of headers) {
    const value = getHeader(event, header);
    // Handle case where getHeader returns undefined or array
    if (value) {
      // Handle both string and string array from getHeader
      const headerValue = Array.isArray(value) ? value[0] : value;
      if (
        headerValue &&
        typeof headerValue === "string" &&
        headerValue.length > 0
      ) {
        // x-forwarded-for can contain multiple IPs, get the first one
        const ip = headerValue.split(",")[0]?.trim();
        if (ip && ip !== "unknown") {
          return ip;
        }
      }
    }
  }

  // Fallback to connection remote address
  return (
    event?.node?.req?.connection?.remoteAddress ||
    event?.node?.req?.socket?.remoteAddress ||
    "unknown"
  );
}

export async function requireAuth(event: any) {
  const token = getCookie(event, "auth-token");

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication token required",
    });
  }

  try {
    // FIXED: Proper typing for JWT payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key",
    ) as JwtPayload;

    const session = await prisma.session.findFirst({
      where: {
        token,
        userId: decoded.userId, // String ID
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: { profile: true },
        },
      },
    });

    if (!session || !session.user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid or expired session",
      });
    }

    return session.user;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }

    let errorCode = "INVALID_TOKEN";
    let message = "Invalid authentication token";

    if (error.name === "TokenExpiredError") {
      errorCode = "TOKEN_EXPIRED";
      message = "Authentication token has expired";
    } else if (error.name === "JsonWebTokenError") {
      errorCode = "MALFORMED_TOKEN";
      message = "Malformed authentication token";
    }

    throw createError({
      statusCode: 401,
      statusMessage: message,
    });
  }
}

// FIXED: Using proper role enum values
export function requireRole(allowedRoles: UserRole[]) {
  return async (event: any) => {
    const user = await requireAuth(event);

    if (!allowedRoles.includes(user.role as UserRole)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Access denied. Required roles: ${allowedRoles.join(", ")}`,
      });
    }

    return user;
  };
}

// Enhanced role checking with hierarchical permissions
export function requirePermission(permission: Permission) {
  return async (event: any) => {
    const user = await requireAuth(event);

    if (!hasPermission(user.role as UserRole, permission)) {
      throw createError({
        statusCode: 403,
        statusMessage: `Permission denied. Required permission: ${permission}`,
      });
    }

    return user;
  };
}

// Helper function to check if user has specific permission
// This is now a re-export from the permissions helper for consistency
export { hasPermission } from "~~/server/helpers/permissions";

// Role hierarchy helper - re-export from permissions helper
export { getRoleLevel, canManageUser } from "~~/server/helpers/permissions";
