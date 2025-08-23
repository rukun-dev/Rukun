// server/utils/activity-log.ts
import { prisma } from "~~/server/utils/database";
import type { H3Event } from "h3";
import { getHeader } from "h3";
import { getClientIP } from "~~/server/utils/auth";

/**
 * Maximum length for activity log descriptions to prevent database errors
 */
const MAX_DESCRIPTION_LENGTH = 950;

/**
 * Safely truncate description for activity log to prevent database column overflow
 */
export function truncateDescription(
  description: string,
  maxLength: number = MAX_DESCRIPTION_LENGTH,
): string {
  if (description.length <= maxLength) {
    return description;
  }

  // Truncate and add ellipsis, but try to end at a word boundary
  const truncated = description.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(" ");

  // If we can find a space in the last 20% of the string, break there
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Format changes array into a readable string
 */
export function formatChanges(changes: string[]): string {
  if (changes.length === 0) {
    return "";
  }

  if (changes.length === 1) {
    return ` - Changed: ${changes[0]}`;
  }

  if (changes.length <= 3) {
    return ` - Changes: ${changes.join(", ")}`;
  }

  // If there are many changes, show first few and count
  const firstChanges = changes.slice(0, 3).join(", ");
  const remainingCount = changes.length - 3;
  return ` - Changes: ${firstChanges} (and ${remainingCount} more)`;
}

/**
 * Create activity log entry with safe description handling
 */
export async function createActivityLog(options: {
  userId: string;
  action: string;
  description: string;
  event?: H3Event;
  ipAddress?: string;
  userAgent?: string;
  transaction?: any; // Prisma transaction
}) {
  const {
    userId,
    action,
    description,
    event,
    ipAddress,
    userAgent,
    transaction,
  } = options;

  // Get client info if not provided
  const clientIP = ipAddress || (event ? getClientIP(event) : undefined);
  const clientUserAgent =
    userAgent || (event ? getHeader(event, "user-agent") : undefined);

  const logData = {
    userId,
    action,
    description: truncateDescription(description),
    ipAddress: clientIP,
    userAgent: clientUserAgent,
  };

  // Use transaction if provided, otherwise use direct prisma
  if (transaction) {
    return await transaction.activityLog.create({ data: logData });
  } else {
    return await prisma.activityLog.create({ data: logData });
  }
}

/**
 * Create activity log for user updates with formatted changes
 */
export async function logUserUpdate(options: {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  changes: string[];
  event?: H3Event;
  transaction?: any;
  isSelfUpdate?: boolean;
}) {
  const {
    currentUserId,
    targetUserId,
    targetUserName,
    targetUserEmail,
    changes,
    event,
    transaction,
    isSelfUpdate = false,
  } = options;

  const changesText = formatChanges(changes);
  const baseDescription = `Updated user: ${targetUserName} (${targetUserEmail})`;
  const fullDescription = baseDescription + changesText;

  // Log for the user performing the update
  await createActivityLog({
    userId: currentUserId,
    action: isSelfUpdate ? "UPDATE_OWN_PROFILE" : "UPDATE_USER",
    description: fullDescription,
    event,
    transaction,
  });

  // If updating someone else's profile, also log for the target user
  if (!isSelfUpdate && currentUserId !== targetUserId) {
    const currentUser = await (transaction || prisma).user.findUnique({
      where: { id: currentUserId },
      select: { name: true, email: true },
    });

    if (currentUser) {
      const adminDescription = `Profile updated by ${currentUser.name} (${currentUser.email})${changesText}`;
      await createActivityLog({
        userId: targetUserId,
        action: "PROFILE_UPDATED_BY_ADMIN",
        description: adminDescription,
        event,
        transaction,
      });
    }
  }
}

/**
 * Create activity log for profile updates with formatted changes
 */
export async function logProfileUpdate(options: {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
  targetUserEmail: string;
  changes: string[];
  event?: H3Event;
  transaction?: any;
  isSelfUpdate?: boolean;
}) {
  const {
    currentUserId,
    targetUserId,
    targetUserName,
    targetUserEmail,
    changes,
    event,
    transaction,
    isSelfUpdate = false,
  } = options;

  const changesText = formatChanges(changes);
  const baseDescription = `Updated profile for: ${targetUserName} (${targetUserEmail})`;
  const fullDescription = baseDescription + changesText;

  // Log for the user performing the update
  await createActivityLog({
    userId: currentUserId,
    action: isSelfUpdate ? "UPDATE_OWN_PROFILE" : "UPDATE_PROFILE",
    description: fullDescription,
    event,
    transaction,
  });

  // If updating someone else's profile, also log for the target user
  if (!isSelfUpdate && currentUserId !== targetUserId) {
    const currentUser = await (transaction || prisma).user.findUnique({
      where: { id: currentUserId },
      select: { name: true, email: true },
    });

    if (currentUser) {
      const adminDescription = `Profile updated by ${currentUser.name} (${currentUser.email})${changesText}`;
      await createActivityLog({
        userId: targetUserId,
        action: "PROFILE_UPDATED_BY_ADMIN",
        description: adminDescription,
        event,
        transaction,
      });
    }
  }
}

/**
 * Create activity log for system setting updates
 */
export async function logSystemSettingUpdate(options: {
  userId: string;
  settingKey: string;
  changes: string[];
  event?: H3Event;
  transaction?: any;
}) {
  const { userId, settingKey, changes, event, transaction } = options;

  const changesText = formatChanges(changes);
  const description = `Updated system setting '${settingKey}'${changesText}`;

  await createActivityLog({
    userId,
    action: "UPDATE_SYSTEM_SETTING",
    description,
    event,
    transaction,
  });
}

/**
 * Common activity log actions as constants
 */
export const ACTIVITY_ACTIONS = {
  // Authentication
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  PASSWORD_RESET: "PASSWORD_RESET",

  // User Management
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  ACTIVATE_USER: "ACTIVATE_USER",
  DEACTIVATE_USER: "DEACTIVATE_USER",

  // Profile Management
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPDATE_OWN_PROFILE: "UPDATE_OWN_PROFILE",
  PROFILE_UPDATED_BY_ADMIN: "PROFILE_UPDATED_BY_ADMIN",
  UPLOAD_AVATAR: "UPLOAD_AVATAR",
  DELETE_AVATAR: "DELETE_AVATAR",

  // System Management
  UPDATE_SYSTEM_SETTING: "UPDATE_SYSTEM_SETTING",
  UPDATE_RT_PROFILE: "UPDATE_RT_PROFILE",
  UPLOAD_RT_LOGO: "UPLOAD_RT_LOGO",

  // Data Operations
  BULK_OPERATION: "BULK_OPERATION",
  DATA_EXPORT: "DATA_EXPORT",
  DATA_CLEANUP: "DATA_CLEANUP",

  // Access Control
  ACCESS_DENIED: "ACCESS_DENIED",
  PERMISSION_CHECK: "PERMISSION_CHECK",
} as const;

export type ActivityAction = keyof typeof ACTIVITY_ACTIONS;
