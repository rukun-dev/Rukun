// server/utils/auth.ts - Fixed for String ID and proper Role enum
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import {
    authErrorResponse,
    forbiddenResponse
} from '~~/server/utils/response'

const prisma = new PrismaClient()

// Type definitions based on Prisma schema
type UserRole = 'SUPER_ADMIN' | 'KETUA_RT' | 'SEKRETARIS' | 'BENDAHARA' | 'STAFF' | 'WARGA'

interface JwtPayload {
    userId: string // FIXED: String instead of number
    role: UserRole
    email: string
    iat?: number
    exp?: number
}

// Helper function to get client IP address
export function getClientIP(event: any): string {
    // Check various headers for IP address
    const headers = [
        'x-forwarded-for',
        'x-real-ip',
        'x-client-ip',
        'cf-connecting-ip', // Cloudflare
        'x-forwarded',
        'forwarded-for',
        'forwarded'
    ]

    for (const header of headers) {
        const value = getHeader(event, header)
        if (value) {
            // x-forwarded-for can contain multiple IPs, get the first one
            const ip = value.split(',')[0].trim()
            if (ip && ip !== 'unknown') {
                return ip
            }
        }
    }

    // Fallback to connection remote address
    return event.node.req.connection?.remoteAddress ||
        event.node.req.socket?.remoteAddress ||
        'unknown'
}

export async function requireAuth(event: any) {
    const token = getCookie(event, 'auth-token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: JSON.stringify(authErrorResponse(
                'Authentication token required',
                'NO_TOKEN'
            ))
        })
    }

    try {
        // FIXED: Proper typing for JWT payload
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload

        const session = await prisma.session.findFirst({
            where: {
                token,
                userId: decoded.userId, // String ID
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    include: { profile: true }
                }
            }
        })

        if (!session || !session.user.isActive) {
            throw createError({
                statusCode: 401,
                statusMessage: JSON.stringify(authErrorResponse(
                    'Invalid or expired session',
                    'INVALID_SESSION'
                ))
            })
        }

        return session.user
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }

        let errorCode = 'INVALID_TOKEN'
        let message = 'Invalid authentication token'

        if (error.name === 'TokenExpiredError') {
            errorCode = 'TOKEN_EXPIRED'
            message = 'Authentication token has expired'
        } else if (error.name === 'JsonWebTokenError') {
            errorCode = 'MALFORMED_TOKEN'
            message = 'Malformed authentication token'
        }

        throw createError({
            statusCode: 401,
            statusMessage: JSON.stringify(authErrorResponse(message, errorCode))
        })
    }
}

// FIXED: Using proper role enum values
export function requireRole(allowedRoles: UserRole[]) {
    return async (event: any) => {
        const user = await requireAuth(event)

        if (!allowedRoles.includes(user.role as UserRole)) {
            throw createError({
                statusCode: 403,
                statusMessage: JSON.stringify(forbiddenResponse(
                    `Access denied. Required roles: ${allowedRoles.join(', ')}`
                ))
            })
        }

        return user
    }
}

// Enhanced role checking with hierarchical permissions
export function requirePermission(permission: string) {
    // FIXED: Updated permission mapping based on actual roles
    const rolePermissions: Record<UserRole, string[]> = {
        'SUPER_ADMIN': ['*'], // Super admin has all permissions
        'KETUA_RT': [
            'read:all',
            'write:all',
            'manage:users',
            'manage:finances',
            'manage:documents',
            'manage:announcements'
        ],
        'SEKRETARIS': [
            'read:all',
            'write:documents',
            'write:announcements',
            'read:users',
            'read:finances'
        ],
        'BENDAHARA': [
            'read:all',
            'write:finances',
            'write:transactions',
            'write:payments',
            'read:users'
        ],
        'STAFF': [
            'read:users',
            'read:documents',
            'read:announcements',
            'write:documents',
            'read:finances'
        ],
        'WARGA': [
            'read:announcements',
            'read:own_profile',
            'write:own_profile',
            'read:public_info',
            'create:documents'
        ]
    }

    return async (event: any) => {
        const user = await requireAuth(event)
        const userPermissions = rolePermissions[user.role as UserRole] || []

        const hasPermission = userPermissions.includes('*') ||
            userPermissions.includes(permission) ||
            userPermissions.some(p => permission.startsWith(p.replace('*', '')))

        if (!hasPermission) {
            throw createError({
                statusCode: 403,
                statusMessage: JSON.stringify(forbiddenResponse(
                    `Permission denied. Required permission: ${permission}`
                ))
            })
        }

        return user
    }
}

// Helper function to check if user has specific permission
export function hasPermission(userRole: UserRole, permission: string): boolean {
    const rolePermissions: Record<UserRole, string[]> = {
        'SUPER_ADMIN': ['*'],
        'KETUA_RT': [
            'read:all', 'write:all', 'manage:users', 'manage:finances',
            'manage:documents', 'manage:announcements'
        ],
        'SEKRETARIS': [
            'read:all', 'write:documents', 'write:announcements',
            'read:users', 'read:finances'
        ],
        'BENDAHARA': [
            'read:all', 'write:finances', 'write:transactions',
            'write:payments', 'read:users'
        ],
        'STAFF': [
            'read:users', 'read:documents', 'read:announcements',
            'write:documents', 'read:finances'
        ],
        'WARGA': [
            'read:announcements', 'read:own_profile', 'write:own_profile',
            'read:public_info', 'create:documents'
        ]
    }

    const userPermissions = rolePermissions[userRole] || []

    return userPermissions.includes('*') ||
        userPermissions.includes(permission) ||
        userPermissions.some(p => permission.startsWith(p.replace('*', '')))
}

// Role hierarchy helper
export function getRoleLevel(role: UserRole): number {
    const roleLevels: Record<UserRole, number> = {
        'SUPER_ADMIN': 100,
        'KETUA_RT': 80,
        'SEKRETARIS': 60,
        'BENDAHARA': 60,
        'STAFF': 40,
        'WARGA': 20
    }

    return roleLevels[role] || 0
}

// Check if user can manage another user based on role hierarchy
export function canManageUser(managerRole: UserRole, targetRole: UserRole): boolean {
    if (managerRole === 'SUPER_ADMIN') return true

    const managerLevel = getRoleLevel(managerRole)
    const targetLevel = getRoleLevel(targetRole)

    return managerLevel > targetLevel
}