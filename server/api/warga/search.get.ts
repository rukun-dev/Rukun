// server/api/warga/search.post.ts
import { z } from "zod";
import { prisma } from "~~/server/utils/database";
import { requireAuth } from "~~/server/utils/auth";
import { startRequest, responses } from "~~/server/utils/response";

// Search schema
const wargaSearchSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),
  nik: z.string().max(20).optional(),
  noKk: z.string().max(20).optional(),
  name: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  kabupaten: z.string().optional(),
  provinsi: z.string().optional(),
  isActive: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === undefined || val === null || val === "") return undefined;
      const str = val.toString().toLowerCase();
      if (["true", "1", "yes"].includes(str)) return true;
      if (["false", "0", "no"].includes(str)) return false;
      return undefined;
    }),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.number().int().min(1).max(100).default(20),
  page: z.number().int().min(1).default(1),
});

export default defineEventHandler(async (event) => {
  const requestId = startRequest(event);
  const startedAt = Date.now();
  let body: any;

  try {
    const currentUser = await requireAuth(event);

    body = await readBody(event);
    const {
      q,
      nik,
      noKk,
      name,
      phone,
      email,
      address,
      kelurahan,
      kecamatan,
      kabupaten,
      provinsi,
      isActive,
      sortBy,
      sortOrder,
      limit,
      page,
    } = wargaSearchSchema.parse(body);

    const where: any = { AND: [] };

    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nik: { contains: q } },
          { noKk: { contains: q } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (nik) where.AND.push({ nik: { contains: nik } });
    if (noKk) where.AND.push({ noKk: { contains: noKk } });
    if (name) where.AND.push({ name: { contains: name, mode: "insensitive" } });
    if (phone) where.AND.push({ phone: { contains: phone } });
    if (email)
      where.AND.push({ email: { contains: email, mode: "insensitive" } });
    if (address)
      where.AND.push({ address: { contains: address, mode: "insensitive" } });
    if (kelurahan) where.AND.push({ kelurahan: { contains: kelurahan } });
    if (kecamatan) where.AND.push({ kecamatan: { contains: kecamatan } });
    if (kabupaten) where.AND.push({ kabupaten: { contains: kabupaten } });
    if (provinsi) where.AND.push({ provinsi: { contains: provinsi } });
    if (typeof isActive === "boolean") where.AND.push({ isActive });

    if (where.AND.length === 0) delete where.AND;

    const skip = (page - 1) * limit;

    const [total, records] = await Promise.all([
      prisma.warga.count({ where }),
      prisma.warga.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          nik: true,
          noKk: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          birthDate: true,
          birthPlace: true,
          address: true,
          rtNumber: true,
          rwNumber: true,
          kelurahan: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
          postalCode: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const executionTime = `${Date.now() - startedAt}ms`;

    return responses.ok(
      {
        total,
        page,
        per_page: limit,
        total_pages: totalPages,
        records: records.map((w) => ({
          ...w,
          birthDate: w.birthDate?.toISOString(),
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        })),
      },
      "Warga search results",
      {
        requestId,
        event,
        executionTime,
        pagination: {
          total,
          page,
          per_page: limit,
          total_pages: totalPages,
        },
      },
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return responses.validation(
        firstError?.message || "Validation failed",
        firstError?.path[0]?.toString(),
        {
          field_errors: error.issues.reduce((acc, issue) => {
            const field = issue.path[0]?.toString();
            if (field) acc[field] = issue.message;
            return acc;
          }, {} as Record<string, string>),
          error_count: error.issues.length,
          provided_data: body ? Object.keys(body) : [],
        },
        { requestId, event },
      );
    }

    throw error;
  }
});
