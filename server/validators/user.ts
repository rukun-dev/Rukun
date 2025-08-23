// server/validators/user.ts
import { z } from "zod";

export const baseUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s.',-]+$/, "Name contains invalid characters")
    .transform((v) => v.trim()),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email is too long")
    .toLowerCase()
    .transform((v) => v.trim()),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((v) => v?.replace(/[\s-]/g, "") || null)
    .refine((phone) => !phone || /^(\+62|62|0)[0-9]{8,13}$/.test(phone), {
      message: "Invalid Indonesian phone number format",
    }),
  role: z
    .enum([
      "SUPER_ADMIN",
      "KETUA_RT",
      "SEKRETARIS",
      "BENDAHARA",
      "STAFF",
      "WARGA",
    ])
    .default("WARGA"),
  isActive: z.boolean().optional().default(true),
});

export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .refine((p) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p), {
      message: "Password must contain uppercase, lowercase, and numbers",
      path: ["password"],
    }),
});

export const updateUserSchema = baseUserSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password is too long")
      .refine((p) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p), {
        message: "Password must contain uppercase, lowercase, and numbers",
        path: ["password"],
      })
      .optional(),
  })
  .partial();

// User profile validation schemas
export const userProfileSchema = z.object({
  nik: z
    .string()
    .optional()
    .nullable()
    .refine((nik) => !nik || /^[0-9]{16}$/.test(nik), {
      message: "NIK must be 16 digits",
    }),
  birthDate: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : null))
    .refine((date) => !date || date < new Date(), {
      message: "Birth date cannot be in the future",
    })
    .refine((date) => !date || date > new Date("1900-01-01"), {
      message: "Birth date must be after 1900",
    }),
  birthPlace: z
    .string()
    .max(100, "Birth place is too long")
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  address: z
    .string()
    .max(500, "Address is too long")
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  job: z
    .string()
    .max(100, "Job title is too long")
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  education: z
    .string()
    .max(100, "Education is too long")
    .optional()
    .nullable()
    .transform((v) => v?.trim() || null),
  maritalStatus: z
    .enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"])
    .optional()
    .nullable(),
});

export const updateProfileSchema = userProfileSchema.partial();

// Query validation schemas
export const getUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "1", 10))
    .refine((v) => v > 0, "Page must be greater than 0"),
  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v || "10", 10))
    .refine((v) => v > 0 && v <= 100, "Limit must be between 1 and 100"),
  search: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined),
  role: z
    .string()
    .optional()
    .transform((v) => v?.trim() || undefined)
    .refine(
      (v) =>
        !v ||
        [
          "SUPER_ADMIN",
          "KETUA_RT",
          "SEKRETARIS",
          "BENDAHARA",
          "STAFF",
          "WARGA",
        ].includes(v),
      "Invalid role",
    )
    .transform((v) => v || undefined),
  isActive: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      return v === "true" ? true : v === "false" ? false : undefined;
    }),
  sortBy: z
    .enum(["name", "email", "role", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(72, "New password is too long")
      .refine((p) => /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p), {
        message: "New password must contain uppercase, lowercase, and numbers",
      }),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Avatar upload schema
export const avatarUploadSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "File is required")
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      "File size must be less than 5MB",
    )
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "File must be JPEG, PNG, or WebP",
    ),
});

// User ID parameter validation
export const userIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "User ID is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid user ID format"),
});

// Bulk operations schema
export const bulkDeleteUsersSchema = z.object({
  userIds: z
    .array(z.string())
    .min(1, "At least one user ID is required")
    .max(50, "Cannot delete more than 50 users at once"),
});

export const bulkUpdateUsersSchema = z.object({
  userIds: z
    .array(z.string())
    .min(1, "At least one user ID is required")
    .max(50, "Cannot update more than 50 users at once"),
  updates: z
    .object({
      isActive: z.boolean().optional(),
      role: z
        .enum([
          "SUPER_ADMIN",
          "KETUA_RT",
          "SEKRETARIS",
          "BENDAHARA",
          "STAFF",
          "WARGA",
        ])
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field to update is required",
    }),
});

// Helper function to clean query parameters
export function cleanQueryParams(query: Record<string, any>) {
  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed === "" || trimmed === "null" || trimmed === "undefined") {
        continue;
      }
      cleaned[key] = trimmed;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}

// Improved query schema with better empty string handling
export const getUsersQuerySchemaImproved = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (!v || v === "") return 1;
      return typeof v === "string" ? parseInt(v, 10) : v;
    })
    .refine((v) => v > 0, "Page must be greater than 0"),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (!v || v === "") return 10;
      return typeof v === "string" ? parseInt(v, 10) : v;
    })
    .refine((v) => v > 0 && v <= 100, "Limit must be between 1 and 100"),
  search: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      return v.trim();
    }),
  role: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return undefined;
      const trimmed = v.trim();
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
  isActive: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return undefined;
      if (typeof v === "boolean") return v;
      const str = v.toString().toLowerCase().trim();
      if (str === "" || str === "null" || str === "undefined") return undefined;
      if (str === "true" || str === "1" || str === "yes") return true;
      if (str === "false" || str === "0" || str === "no") return false;
      return undefined;
    }),
  sortBy: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return "createdAt";
      const trimmed = v.trim();
      const validSortFields = [
        "name",
        "email",
        "role",
        "createdAt",
        "updatedAt",
      ];
      return validSortFields.includes(trimmed) ? trimmed : "createdAt";
    }),
  sortOrder: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === "") return "desc";
      const trimmed = v.trim().toLowerCase();
      return trimmed === "asc" ? "asc" : "desc";
    }),
});

// Export all schemas for easy importing
export const userSchemas = {
  base: baseUserSchema,
  create: createUserSchema,
  update: updateUserSchema,
  profile: userProfileSchema,
  updateProfile: updateProfileSchema,
  getUsersQuery: getUsersQuerySchema,
  getUsersQueryImproved: getUsersQuerySchemaImproved,
  changePassword: changePasswordSchema,
  avatarUpload: avatarUploadSchema,
  userIdParam: userIdParamSchema,
  bulkDelete: bulkDeleteUsersSchema,
  bulkUpdate: bulkUpdateUsersSchema,
  cleanQueryParams,
};
