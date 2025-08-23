// server/utils/activity-logger.ts
import type { H3Event } from "h3";
import { prisma } from "./database";

export interface ActivityLogData {
  userId: string;
  action: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface ActivityLogOptions {
  skipLogging?: boolean;
  batchSize?: number;
  flushInterval?: number; // in milliseconds
}

class ActivityLogger {
  private logQueue: ActivityLogData[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private readonly batchSize: number;
  private readonly flushInterval: number;

  constructor(options: ActivityLogOptions = {}) {
    this.batchSize = options.batchSize || 50;
    this.flushInterval = options.flushInterval || 5000; // 5 seconds
  }

  /**
   * Log an activity - adds to queue for batch processing
   */
  async log(data: ActivityLogData): Promise<void> {
    try {
      // Add IP and user agent if not provided
      const logEntry: ActivityLogData = {
        ...data,
        ipAddress: data.ipAddress || "unknown",
        userAgent: data.userAgent || "unknown",
      };

      this.logQueue.push(logEntry);

      // Flush immediately if batch size reached
      if (this.logQueue.length >= this.batchSize) {
        await this.flush();
      } else {
        // Schedule flush if not already scheduled
        this.scheduleFlush();
      }
    } catch (error) {
      console.error("Failed to queue activity log:", error);
    }
  }

  /**
   * Log an activity immediately (bypassing queue)
   */
  async logImmediate(data: ActivityLogData): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          description: data.description,
          ipAddress: data.ipAddress || "unknown",
          userAgent: data.userAgent || "unknown",
        },
      });
    } catch (error) {
      console.error("Failed to log activity immediately:", error);
      throw error;
    }
  }

  /**
   * Log activity from H3Event context
   */
  async logFromEvent(
    event: H3Event,
    userId: string,
    action: string,
    description?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const ip = getClientIP(event) || "unknown";
    const userAgent = getHeader(event, "user-agent") || "unknown";

    await this.log({
      userId,
      action,
      description,
      ipAddress: ip,
      userAgent,
      metadata,
    });
  }

  /**
   * Batch log multiple activities
   */
  async logBatch(activities: ActivityLogData[]): Promise<void> {
    if (activities.length === 0) return;

    try {
      await prisma.activityLog.createMany({
        data: activities.map((activity) => ({
          userId: activity.userId,
          action: activity.action,
          description: activity.description,
          ipAddress: activity.ipAddress || "unknown",
          userAgent: activity.userAgent || "unknown",
        })),
        skipDuplicates: true,
      });
    } catch (error) {
      console.error("Failed to log activity batch:", error);
      throw error;
    }
  }

  /**
   * Flush pending logs to database
   */
  async flush(): Promise<void> {
    if (this.logQueue.length === 0) return;

    const logsToFlush = [...this.logQueue];
    this.logQueue = []; // Clear queue

    // Cancel scheduled flush
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      await this.logBatch(logsToFlush);
    } catch (error) {
      // If flush fails, add logs back to queue for retry
      console.error("Failed to flush activity logs, re-queuing:", error);
      this.logQueue.unshift(...logsToFlush);

      // Schedule retry
      setTimeout(() => this.flush(), 10000); // Retry in 10 seconds
    }
  }

  /**
   * Schedule automatic flush
   */
  private scheduleFlush(): void {
    if (this.flushTimer) return; // Already scheduled

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      queueSize: this.logQueue.length,
      batchSize: this.batchSize,
      flushInterval: this.flushInterval,
      hasScheduledFlush: !!this.flushTimer,
    };
  }

  /**
   * Force flush and clear all pending logs
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

// Global activity logger instance
export const activityLogger = new ActivityLogger();

// Helper functions for common logging scenarios
export const logActivity = {
  // Authentication activities
  login: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "LOGIN",
      `User logged in: ${userInfo.name} (${userInfo.email})`,
    ),

  logout: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "LOGOUT",
      `User logged out: ${userInfo.name} (${userInfo.email})`,
    ),

  register: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string; role: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "REGISTER",
      `New user registered: ${userInfo.name} (${userInfo.email}) as ${userInfo.role}`,
    ),

  passwordChange: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "PASSWORD_CHANGE",
      `Password changed for: ${userInfo.name} (${userInfo.email})`,
    ),

  passwordReset: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "PASSWORD_RESET",
      `Password reset for: ${userInfo.name} (${userInfo.email})`,
    ),

  // User management activities
  userCreate: (
    event: H3Event,
    creatorId: string,
    targetUser: { id: string; name: string; email: string; role: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      creatorId,
      "CREATE_USER",
      `Created user: ${targetUser.name} (${targetUser.email}) as ${targetUser.role}`,
    ),

  userUpdate: (
    event: H3Event,
    updaterId: string,
    targetUser: { id: string; name: string; email: string },
    changes: string[],
  ) =>
    activityLogger.logFromEvent(
      event,
      updaterId,
      "UPDATE_USER",
      `Updated user: ${targetUser.name} (${targetUser.email})${changes.length > 0 ? ` - Changes: ${changes.join(", ")}` : ""}`,
    ),

  userDelete: (
    event: H3Event,
    deleterId: string,
    targetUser: { id: string; name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      deleterId,
      "DELETE_USER",
      `Deleted user: ${targetUser.name} (${targetUser.email})`,
    ),

  // Profile activities
  profileUpdate: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
    changes: string[],
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "UPDATE_PROFILE",
      `Updated profile: ${userInfo.name} (${userInfo.email})${changes.length > 0 ? ` - Changes: ${changes.join(", ")}` : ""}`,
    ),

  avatarUpload: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "UPLOAD_AVATAR",
      `Uploaded avatar: ${userInfo.name} (${userInfo.email})`,
    ),

  avatarDelete: (
    event: H3Event,
    userId: string,
    userInfo: { name: string; email: string },
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "DELETE_AVATAR",
      `Deleted avatar: ${userInfo.name} (${userInfo.email})`,
    ),

  // System activities
  settingsUpdate: (
    event: H3Event,
    userId: string,
    settingKey: string,
    oldValue: string,
    newValue: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "UPDATE_SYSTEM_SETTING",
      `Updated system setting '${settingKey}': ${oldValue} → ${newValue}`,
    ),

  rtProfileUpdate: (event: H3Event, userId: string, changes: string[]) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "UPDATE_RT_PROFILE",
      `Updated RT profile${changes.length > 0 ? ` - Changes: ${changes.join(", ")}` : ""}`,
    ),

  rtLogoUpload: (event: H3Event, userId: string, rtInfo: string) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "UPLOAD_RT_LOGO",
      `Uploaded RT logo for ${rtInfo}`,
    ),

  // Data activities
  dataExport: (
    event: H3Event,
    userId: string,
    dataType: string,
    recordCount: number,
    format: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "EXPORT_DATA",
      `Exported ${recordCount} ${dataType} records in ${format.toUpperCase()} format`,
    ),

  dataImport: (
    event: H3Event,
    userId: string,
    dataType: string,
    recordCount: number,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "IMPORT_DATA",
      `Imported ${recordCount} ${dataType} records`,
    ),

  // File activities
  fileUpload: (
    event: H3Event,
    userId: string,
    fileName: string,
    fileSize: number,
    fileType: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "FILE_UPLOAD",
      `Uploaded file: ${fileName} (${Math.round(fileSize / 1024)}KB, ${fileType})`,
    ),

  fileDelete: (
    event: H3Event,
    userId: string,
    fileName: string,
    fileType: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId,
      "FILE_DELETE",
      `Deleted file: ${fileName} (${fileType})`,
    ),

  // Security activities
  accessDenied: (
    event: H3Event,
    userId: string | null,
    resource: string,
    reason: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId || "anonymous",
      "ACCESS_DENIED",
      `Access denied to ${resource}: ${reason}`,
    ),

  securityViolation: (
    event: H3Event,
    userId: string | null,
    violation: string,
    details: string,
  ) =>
    activityLogger.logFromEvent(
      event,
      userId || "anonymous",
      "SECURITY_VIOLATION",
      `Security violation (${violation}): ${details}`,
    ),

  // Custom activity
  custom: (
    event: H3Event,
    userId: string,
    action: string,
    description: string,
  ) => activityLogger.logFromEvent(event, userId, action, description),
};

// Activity logging middleware
export function createActivityLogMiddleware(options: ActivityLogOptions = {}) {
  return async (event: H3Event) => {
    // Skip if logging is disabled
    if (options.skipLogging) return;

    // Skip for certain routes (health checks, static files, etc.)
    const url = getRequestURL(event);
    if (
      url.pathname.startsWith("/api/health") ||
      url.pathname.startsWith("/_nuxt") ||
      url.pathname.startsWith("/assets")
    ) {
      return;
    }

    // Add activity logger to event context
    event.context.activityLogger = activityLogger;
    event.context.logActivity = logActivity;
  };
}

// Cleanup function for graceful shutdown
export async function shutdownActivityLogger() {
  await activityLogger.shutdown();
}

// Helper to get client IP
function getClientIP(event: H3Event): string | null {
  return (
    getHeader(event, "cf-connecting-ip") ||
    getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getHeader(event, "x-real-ip") ||
    getHeader(event, "x-client-ip") ||
    getClientIP(event) ||
    null
  );
}
