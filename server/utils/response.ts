// server/utils/response.ts
import crypto from 'crypto'
import type { H3Event } from 'h3'

export interface ApiResponse<T = any> {
    success: boolean
    status_code: number
    message: string
    data: T | null
    error: ApiError | null
    meta: ResponseMeta
    pagination?: PaginationMeta | null
    next_step?: NextStepInfo | null
    links?: ApiLinks | null
}

export interface ApiError {
    code: string
    message: string
    details?: any
    field?: string
    trace_id?: string
}

export interface ResponseMeta {
    timestamp: string
    request_id: string
    version: string
    execution_time?: string
    user_id?: string
    ip_address?: string
}

export interface PaginationMeta {
    current_page: number
    per_page: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
    first_page: number
    last_page: number
}

export interface NextStepInfo {
    action: string
    endpoint: string
    method?: string
    required?: string[]
    optional?: string[]
    description?: string
}

export interface ApiLinks {
    self?: string
    next?: string
    prev?: string
    first?: string
    last?: string
    related?: Record<string, string>
}

// Request context cache
const requestContext = new Map<string, { startTime: number, userId?: string, ip?: string }>()

// Enhanced request ID generation
function generateRequestId(): string {
    const timestamp = Date.now().toString(36)
    const random = crypto.randomBytes(4).toString('hex')
    return `req_${timestamp}_${random}`
}

// Get client IP helper
function getClientIP(event?: H3Event): string | undefined {
    if (!event) return undefined
    return getHeader(event, 'x-forwarded-for') ||
        getHeader(event, 'x-real-ip') ||
        getHeader(event, 'cf-connecting-ip') ||
        event.node.req.socket?.remoteAddress
}

// Start request tracking
export function startRequest(event?: H3Event, userId?: string): string {
    const requestId = generateRequestId()
    requestContext.set(requestId, {
        startTime: Date.now(),
        userId,
        ip: getClientIP(event)
    })
    return requestId
}

// Enhanced success response
export function successResponse<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    options: {
        requestId?: string
        pagination?: PaginationMeta
        nextStep?: NextStepInfo
        links?: ApiLinks
        userId?: string
        event?: H3Event
    } = {}
): ApiResponse<T> {
    const requestId = options.requestId || generateRequestId()
    const context = requestContext.get(requestId)

    const response: ApiResponse<T> = {
        success: true,
        status_code: statusCode,
        message,
        data,
        error: null,
        meta: {
            timestamp: new Date().toISOString(),
            request_id: requestId,
            version: process.env.API_VERSION || 'v1.0',
            execution_time: context ? `${Date.now() - context.startTime}ms` : undefined,
            user_id: options.userId || context?.userId,
            ip_address: getClientIP(options.event) || context?.ip
        },
        pagination: options.pagination || null,
        next_step: options.nextStep || null,
        links: options.links || null
    }

    // Cleanup context
    requestContext.delete(requestId)
    return response
}

// Enhanced error response
export function errorResponse(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    details?: any,
    field?: string,
    options: {
        requestId?: string
        userId?: string
        event?: H3Event
        traceId?: string
    } = {}
): ApiResponse<null> {
    const requestId = options.requestId || generateRequestId()
    const context = requestContext.get(requestId)

    const response: ApiResponse<null> = {
        success: false,
        status_code: statusCode,
        message,
        data: null,
        error: {
            code: errorCode,
            message,
            details: process.env.NODE_ENV === 'development' ? details : undefined,
            field,
            trace_id: options.traceId || requestId
        },
        meta: {
            timestamp: new Date().toISOString(),
            request_id: requestId,
            version: process.env.API_VERSION || 'v1.0',
            execution_time: context ? `${Date.now() - context.startTime}ms` : undefined,
            user_id: options.userId || context?.userId,
            ip_address: getClientIP(options.event) || context?.ip
        },
        pagination: null,
        next_step: null,
        links: null
    }

    // Cleanup context
    requestContext.delete(requestId)
    return response
}

// Helper function untuk pagination calculation
export function calculatePagination(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit)
    const currentPage = Math.max(1, Math.min(page, totalPages))

    return {
        current_page: currentPage,
        per_page: limit,
        total,
        total_pages: totalPages,
        has_next: currentPage < totalPages,
        has_prev: currentPage > 1,
        first_page: 1,
        last_page: totalPages
    }
}

// Quick response builders
export const responses = {
    // Success responses
    ok: <T>(data: T, message?: string, options?: any) =>
        successResponse(data, message || 'Success', 200, options),

    created: <T>(data: T, message?: string, options?: any) =>
        successResponse(data, message || 'Resource created', 201, options),

    accepted: <T>(data: T, message?: string, options?: any) =>
        successResponse(data, message || 'Request accepted', 202, options),

    // Error responses
    badRequest: (message?: string, field?: string, details?: any, options?: any) =>
        errorResponse(message || 'Bad request', 400, 'BAD_REQUEST', details, field, options),

    unauthorized: (message?: string, options?: any) =>
        errorResponse(message || 'Unauthorized', 401, 'UNAUTHORIZED', undefined, undefined, options),

    forbidden: (message?: string, options?: any) =>
        errorResponse(message || 'Forbidden', 403, 'FORBIDDEN', undefined, undefined, options),

    notFound: (message?: string, options?: any) =>
        errorResponse(message || 'Not found', 404, 'NOT_FOUND', undefined, undefined, options),

    conflict: (message?: string, options?: any) =>
        errorResponse(message || 'Conflict', 409, 'CONFLICT', undefined, undefined, options),

    validation: (message?: string, field?: string, details?: any, options?: any) =>
        errorResponse(message || 'Validation error', 400, 'VALIDATION_ERROR', details, field, options),

    rateLimit: (message?: string, options?: any) =>
        errorResponse(message || 'Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED', undefined, undefined, options),

    serverError: (message?: string, details?: any, options?: any) =>
        errorResponse(message || 'Internal server error', 500, 'INTERNAL_ERROR', details, undefined, options)
}

// Legacy functions for backward compatibility
export const validationErrorResponse = responses.validation
export const authErrorResponse = responses.unauthorized
export const forbiddenResponse = responses.forbidden
export const notFoundResponse = responses.notFound
export const conflictResponse = responses.conflict