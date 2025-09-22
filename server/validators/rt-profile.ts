// server/validators/rt-profile.ts
import { z } from "zod";

// RT Profile validation schemas
export const rtProfileSchema = z.object({
  rtNumber: z
    .string()
    .min(1, "RT number is required")
    .max(10, "RT number must be at most 10 characters")
    .regex(/^[0-9]+$/, "RT number must contain only numbers"),
  rwNumber: z
    .string()
    .min(1, "RW number is required")
    .max(10, "RW number must be at most 10 characters")
    .regex(/^[0-9]+$/, "RW number must contain only numbers"),
  kelurahan: z
    .string()
    .min(1, "Kelurahan is required")
    .max(100, "Kelurahan must be at most 100 characters"),
  kecamatan: z
    .string()
    .min(1, "Kecamatan is required")
    .max(100, "Kecamatan must be at most 100 characters"),
  kabupaten: z
    .string()
    .min(1, "Kabupaten is required")
    .max(100, "Kabupaten must be at most 100 characters"),
  provinsi: z
    .string()
    .min(1, "Provinsi is required")
    .max(100, "Provinsi must be at most 100 characters"),
  postalCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Postal code must be exactly 5 digits")
    .optional()
    .nullable(),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
});

export const updateRtProfileSchema = rtProfileSchema.partial();

// System Settings validation schemas
export const systemSettingSchema = z.object({
  key: z
    .string()
    .min(1, "Setting key is required")
    .max(100, "Setting key must be at most 100 characters")
    .regex(
      /^[A-Z_][A-Z0-9_]*$/,
      "Setting key must be uppercase with underscores",
    ),
  value: z.string().min(1, "Setting value is required"),
  type: z.enum(["STRING", "NUMBER", "BOOLEAN", "JSON"]).default("STRING"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
  isSystem: z.boolean().default(false),
});

export const updateSystemSettingSchema = z.object({
  value: z.string().min(1, "Setting value is required"),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .optional()
    .nullable(),
});

// Setting key parameter validation
export const settingKeyParamSchema = z.object({
  key: z
    .string()
    .min(1, "Setting key is required")
    .regex(/^[A-Z_][A-Z0-9_]*$/, "Invalid setting key format"),
});

// Activity Log validation schemas
export const activityLogSchema = z.object({
  userId: z.string().cuid("Invalid user ID format"),
  action: z
    .string()
    .min(1, "Action is required")
    .max(100, "Action must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .nullable(),
  ipAddress: z
    .string()
    .regex(
      /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
      "Invalid IP address format",
    )
    .optional()
    .nullable(),
  userAgent: z
    .string()
    .max(500, "User agent must be at most 500 characters")
    .optional()
    .nullable(),
});

// Activity Log query parameters
export const activityLogQuerySchema = z.object({
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
  action: z
    .string()
    .max(100, "Action filter must be at most 100 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
  userId: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || /^[a-z0-9]{25,}$/.test(val),
      "Invalid user ID format",
    ),
  startDate: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid start date format",
    ),
  endDate: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Invalid end date format",
    ),
  search: z
    .string()
    .max(255, "Search query must be at most 255 characters")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

// Export logs schema
export const exportLogsSchema = z.object({
  format: z.enum(["json", "csv", "excel"]).default("json"),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  action: z.string().max(100).optional(),
  userId: z.string().cuid("Invalid user ID format").optional(),
  limit: z
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(10000, "Limit must be at most 10000")
    .default(1000),
});

// Logo upload validation
export const logoUploadSchema = z.object({
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB
  allowedTypes: z
    .array(z.string())
    .default(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
  maxWidth: z.number().default(1000),
  maxHeight: z.number().default(1000),
});

// Type exports for TypeScript
export type RtProfileInput = z.infer<typeof rtProfileSchema>;
export type UpdateRtProfileInput = z.infer<typeof updateRtProfileSchema>;
export type SystemSettingInput = z.infer<typeof systemSettingSchema>;
export type UpdateSystemSettingInput = z.infer<
  typeof updateSystemSettingSchema
>;
export type ActivityLogInput = z.infer<typeof activityLogSchema>;
export type ActivityLogQuery = z.infer<typeof activityLogQuerySchema>;
export type ExportLogsInput = z.infer<typeof exportLogsSchema>;
