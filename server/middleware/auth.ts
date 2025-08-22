// server/middleware/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '~~/server/utils/auth'
import { authErrorResponse } from '~~/server/utils/response'

// ---- Types ----
type UserRole = 'SUPER_ADMIN' | 'KETUA_RT' | 'SEKRETARIS' | 'BENDAHARA' | 'STAFF' | 'WARGA'
type Permission =
    | 'read:all'
    | 'read:residents'
    | 'write:residents'
    | 'read:announcements'
    | 'write:announcements'
    | 'read:reports'
    | 'write:reports'
    | 'read:own_profile'
    | 'write:own_profile'
    | 'read:public_info'
    | '*'

// ---- Route guards (prefix-based) ----
const protectedPrefixes = [
    '/api/protected/',
    '/api/user/',
    '/api/admin/',
    '/api/dashboard',
    '/api/reports',
    '/api/residents',
    '/api/announcements'
]

// Optional: map prefix -> minimal role
const roleRequirementByPrefix: Array<{ prefix: string; roles: UserRole[] }> = [
    { prefix: '/api/admin/', roles: ['SUPER_ADMIN'] },
    { prefix: '/api/reports', roles: ['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'BENDAHARA', 'STAFF'] },
    { prefix: '/api/residents', roles: ['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'BENDAHARA', 'STAFF'] },
    { prefix: '/api/announcements', roles: ['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'BENDAHARA', 'STAFF'] }
]

// ---- Role → permissions ----
const rolePermissions: Record<UserRole, Permission[]> = {
    SUPER_ADMIN: ['*'],
    KETUA_RT: [
        'read:all',
        'write:residents',
        'write:announcements',
        'read:reports',
        'write:reports'
    ],
    SEKRETARIS: [
        'read:all',
        'write:announcements',
        'read:reports'
    ],
    BENDAHARA: [
        'read:all',
        'read:reports',
        'write:reports'
    ],
    STAFF: [
        'read:residents',
        'write:residents',
        'read:announcements',
        'write:announcements',
        'read:reports'
    ],
    WARGA: [
        'read:announcements',
        'read:own_profile',
        'write:own_profile',
        'read:public_info'
    ]
}

// ---- Helpers: role/permission checks ----
function getRolePermissions(role: UserRole): Permission[] {
    return rolePermissions[role] || []
}

function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
    return allowed.includes(userRole)
}

function hasPermission(userRole: UserRole, permission: Permission): boolean {
    const perms = getRolePermissions(userRole)
    return perms.includes('*') || perms.includes(permission)
}

function requireRole(event: any, allowed: UserRole[]) {
    const role: UserRole | undefined = event.context?.userRole
    if (!role || !hasRole(role, allowed)) {
        throw createUnauthorized('Insufficient role', 'INSUFFICIENT_ROLE')
    }
}

function requirePermissions(event: any, permissions: Permission[]) {
    const role: UserRole | undefined = event.context?.userRole
    if (!role) throw createUnauthorized('Authentication required', 'AUTH_REQUIRED')
    const ok = permissions.every((p) => hasPermission(role, p))
    if (!ok) {
        throw createUnauthorized('Missing required permissions', 'INSUFFICIENT_PERMISSION')
    }
}

// ---- JWT helpers (optional fallback; prefer requireAuth from utils) ----
function verifyJWT(token: string) {
    const secret = process.env.JWT_SECRET
    if (!secret) throw createUnauthorized('Authentication misconfiguration', 'AUTH_MISCONFIG')
    try {
        return jwt.verify(token, secret) as any
    } catch (e: any) {
        const name = e?.name
        if (name === 'TokenExpiredError') throw createUnauthorized('Token expired', 'TOKEN_EXPIRED')
        if (name === 'JsonWebTokenError') throw createUnauthorized('Malformed token', 'MALFORMED_TOKEN')
        throw createUnauthorized('Invalid token', 'INVALID_TOKEN')
    }
}

// ---- Password utilities (ready to use in endpoints) ----
export async function hashPassword(plain: string, rounds = 12) {
    return bcrypt.hash(plain, rounds)
}

export async function verifyPassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed)
}

// ---- Error formatter (keeps utils/response intact) ----
function createUnauthorized(message: string, code: string) {
    const data = authErrorResponse(message, code) // gunakan util referensi apa adanya
    return createError({ statusCode: 401, data })
}

// ---- Default middleware handler ----
export default defineEventHandler(async (event) => {
    const path = event.node.req.url || ''
    const needsAuth = protectedPrefixes.some((p) => path.startsWith(p))

    if (!needsAuth) return

    try {
        // Primary: gunakan requireAuth() dari utils/auth (jangan ubah file referensi)
        const user = await requireAuth(event)

        // Inject ke context untuk dipakai di handler endpoint
        event.context.user = user
        event.context.authenticated = true
        event.context.userId = user.id
        event.context.userRole = user.role as UserRole
        event.context.userPermissions = getRolePermissions(user.role as UserRole)

        // Route-level role gate (berdasarkan prefix)
        const matched = roleRequirementByPrefix.find((r) => path.startsWith(r.prefix))
        if (matched && !hasRole(event.context.userRole, matched.roles)) {
            throw createUnauthorized('Insufficient role for this route', 'INSUFFICIENT_ROLE')
        }
    } catch (err: any) {
        // Jika requireAuth lempar error yang sudah terformat, kirim apa adanya
        let data
        try {
            // beberapa custom errors menyimpan payload JSON di statusMessage
            data = JSON.parse(err?.statusMessage)
        } catch {
            data = authErrorResponse('Authentication required', 'AUTH_REQUIRED')
        }
        throw createError({
            statusCode: err?.statusCode || 401,
            data
        })
    }
})

// ---- Named exports to use inside route handlers ----
export { requireRole, requirePermissions, hasPermission, hasRole, getRolePermissions, verifyJWT }
