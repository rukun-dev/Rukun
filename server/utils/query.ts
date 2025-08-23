// server/utils/query.ts
import type { H3Event } from "h3";

export interface CleanQueryOptions {
  /**
   * Convert string numbers to actual numbers
   */
  parseNumbers?: boolean;
  /**
   * Convert string booleans to actual booleans
   */
  parseBooleans?: boolean;
  /**
   * Remove empty strings, null, undefined values
   */
  removeEmpty?: boolean;
  /**
   * Trim string values
   */
  trimStrings?: boolean;
  /**
   * Convert comma-separated values to arrays
   */
  parseArrays?: boolean;
  /**
   * Fields that should be treated as arrays
   */
  arrayFields?: string[];
  /**
   * Fields that should be treated as numbers
   */
  numberFields?: string[];
  /**
   * Fields that should be treated as booleans
   */
  booleanFields?: string[];
}

/**
 * Clean and normalize query parameters
 */
export function cleanQueryParams(
  query: Record<string, any>,
  options: CleanQueryOptions = {},
): Record<string, any> {
  const {
    parseNumbers = false,
    parseBooleans = true,
    removeEmpty = true,
    trimStrings = true,
    parseArrays = false,
    arrayFields = [],
    numberFields = [],
    booleanFields = [],
  } = options;

  const cleaned: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    let cleanValue = value;

    // Skip null/undefined values
    if (cleanValue === null || cleanValue === undefined) {
      if (!removeEmpty) {
        cleaned[key] = cleanValue;
      }
      continue;
    }

    // Handle string values
    if (typeof cleanValue === "string") {
      // Trim strings
      if (trimStrings) {
        cleanValue = cleanValue.trim();
      }

      // Remove empty strings
      if (
        removeEmpty &&
        (cleanValue === "" ||
          cleanValue === "null" ||
          cleanValue === "undefined")
      ) {
        continue;
      }

      // Parse arrays
      if (
        parseArrays &&
        (arrayFields.includes(key) || cleanValue.includes(","))
      ) {
        cleanValue = cleanValue
          .split(",")
          .map((item: string) => item.trim())
          .filter((item: string) => item !== "");
      }

      // Parse booleans
      if (parseBooleans || booleanFields.includes(key)) {
        const lowerValue = cleanValue.toLowerCase();
        if (["true", "1", "yes", "on"].includes(lowerValue)) {
          cleanValue = true;
        } else if (["false", "0", "no", "off"].includes(lowerValue)) {
          cleanValue = false;
        }
      }

      // Parse numbers
      if (parseNumbers || numberFields.includes(key)) {
        const numValue = Number(cleanValue);
        if (!isNaN(numValue) && isFinite(numValue)) {
          cleanValue = numValue;
        }
      }
    }

    cleaned[key] = cleanValue;
  }

  return cleaned;
}

/**
 * Extract pagination parameters from query
 */
export function extractPaginationParams(
  query: Record<string, any>,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {},
): { page: number; limit: number; offset: number } {
  const {
    page: defaultPage = 1,
    limit: defaultLimit = 10,
    maxLimit = 100,
  } = defaults;

  let page = parseInt(String(query.page || defaultPage), 10);
  let limit = parseInt(String(query.limit || defaultLimit), 10);

  // Validate and sanitize
  page = Math.max(1, isNaN(page) ? defaultPage : page);
  limit = Math.max(1, Math.min(maxLimit, isNaN(limit) ? defaultLimit : limit));

  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Extract sorting parameters from query
 */
export function extractSortParams(
  query: Record<string, any>,
  allowedFields: string[] = [],
  defaults: { sortBy?: string; sortOrder?: "asc" | "desc" } = {},
): { sortBy: string; sortOrder: "asc" | "desc" } {
  const {
    sortBy: defaultSortBy = "createdAt",
    sortOrder: defaultSortOrder = "desc",
  } = defaults;

  let sortBy = String(query.sortBy || query.sort || defaultSortBy);
  let sortOrder = String(
    query.sortOrder || query.order || defaultSortOrder,
  ).toLowerCase();

  // Validate sortBy
  if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    sortBy = defaultSortBy;
  }

  // Validate sortOrder
  if (!["asc", "desc"].includes(sortOrder)) {
    sortOrder = defaultSortOrder;
  }

  return { sortBy, sortOrder: sortOrder as "asc" | "desc" };
}

/**
 * Extract search parameters from query
 */
export function extractSearchParams(
  query: Record<string, any>,
  searchFields: string[] = ["search", "q", "query"],
): { search?: string } {
  for (const field of searchFields) {
    const value = query[field];
    if (value && typeof value === "string" && value.trim()) {
      return { search: value.trim() };
    }
  }
  return {};
}

/**
 * Extract filter parameters from query
 */
export function extractFilterParams(
  query: Record<string, any>,
  filterConfig: Record<
    string,
    {
      type?: "string" | "number" | "boolean" | "array" | "enum";
      allowedValues?: any[];
      defaultValue?: any;
    }
  > = {},
): Record<string, any> {
  const filters: Record<string, any> = {};

  for (const [key, config] of Object.entries(filterConfig)) {
    let value = query[key];

    // Skip if no value
    if (value === null || value === undefined || value === "") {
      if (config.defaultValue !== undefined) {
        filters[key] = config.defaultValue;
      }
      continue;
    }

    // Process based on type
    switch (config.type) {
      case "number":
        value = Number(value);
        if (!isNaN(value) && isFinite(value)) {
          filters[key] = value;
        }
        break;

      case "boolean":
        const boolValue = String(value).toLowerCase();
        if (["true", "1", "yes", "on"].includes(boolValue)) {
          filters[key] = true;
        } else if (["false", "0", "no", "off"].includes(boolValue)) {
          filters[key] = false;
        }
        break;

      case "array":
        if (typeof value === "string") {
          filters[key] = value
            .split(",")
            .map((item: string) => item.trim())
            .filter((item: string) => item !== "");
        } else if (Array.isArray(value)) {
          filters[key] = value;
        }
        break;

      case "enum":
        if (config.allowedValues && config.allowedValues.includes(value)) {
          filters[key] = value;
        }
        break;

      case "string":
      default:
        if (typeof value === "string" && value.trim()) {
          filters[key] = value.trim();
        }
        break;
    }
  }

  return filters;
}

/**
 * Build database where clause from filters
 */
export function buildWhereClause(
  filters: Record<string, any>,
  fieldMapping: Record<string, string | ((value: any) => any)> = {},
): any {
  const where: any = { AND: [] };

  for (const [key, value] of Object.entries(filters)) {
    if (value === null || value === undefined) continue;

    const dbField = fieldMapping[key] || key;

    if (typeof dbField === "function") {
      const condition = dbField(value);
      if (condition) {
        where.AND.push(condition);
      }
    } else if (typeof value === "string") {
      // String search
      where.AND.push({
        [dbField]: { contains: value, mode: "insensitive" },
      });
    } else if (Array.isArray(value)) {
      // Array filter (IN clause)
      where.AND.push({
        [dbField]: { in: value },
      });
    } else {
      // Exact match
      where.AND.push({
        [dbField]: value,
      });
    }
  }

  // Return empty object if no conditions
  return where.AND.length > 0 ? where : {};
}

/**
 * Build Prisma orderBy clause
 */
export function buildOrderByClause(
  sortBy: string,
  sortOrder: "asc" | "desc" = "desc",
  fieldMapping: Record<string, string> = {},
): any {
  const dbField = fieldMapping[sortBy] || sortBy;
  return { [dbField]: sortOrder };
}

/**
 * Comprehensive query parser for API endpoints
 */
export function parseApiQuery(
  event: H3Event,
  config: {
    pagination?: { page?: number; limit?: number; maxLimit?: number };
    sorting?: {
      allowedFields?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    };
    filters?: Record<
      string,
      {
        type?: "string" | "number" | "boolean" | "array" | "enum";
        allowedValues?: any[];
        defaultValue?: any;
      }
    >;
    search?: { fields?: string[] };
    clean?: CleanQueryOptions;
  } = {},
) {
  const rawQuery = getQuery(event);
  const cleanedQuery = cleanQueryParams(rawQuery, config.clean);

  const pagination = extractPaginationParams(cleanedQuery, config.pagination);
  const sorting = extractSortParams(
    cleanedQuery,
    config.sorting?.allowedFields,
    { sortBy: config.sorting?.sortBy, sortOrder: config.sorting?.sortOrder },
  );
  const search = extractSearchParams(cleanedQuery, config.search?.fields);
  const filters = extractFilterParams(cleanedQuery, config.filters);

  return {
    pagination,
    sorting,
    search,
    filters,
    raw: rawQuery,
    cleaned: cleanedQuery,
  };
}

/**
 * Generate API links for pagination and filtering
 */
export function generateApiLinks(
  basePath: string,
  currentParams: Record<string, any>,
  pagination?: { currentPage: number; totalPages: number },
): {
  self: string;
  first?: string;
  last?: string;
  next?: string;
  prev?: string;
} {
  const buildUrl = (params: Record<string, any>) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    }
    const queryString = query.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const links: any = {
    self: buildUrl(currentParams),
  };

  if (pagination) {
    const { currentPage, totalPages } = pagination;

    if (totalPages > 1) {
      links.first = buildUrl({ ...currentParams, page: 1 });
      links.last = buildUrl({ ...currentParams, page: totalPages });

      if (currentPage > 1) {
        links.prev = buildUrl({ ...currentParams, page: currentPage - 1 });
      }

      if (currentPage < totalPages) {
        links.next = buildUrl({ ...currentParams, page: currentPage + 1 });
      }
    }
  }

  return links;
}

/**
 * Validate query parameters against schema
 */
export function validateQuery<T>(
  query: Record<string, any>,
  schema: any,
): { success: true; data: T } | { success: false; error: any } {
  try {
    const data = schema.parse(query);
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
