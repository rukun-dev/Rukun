// server/api/auth/me.get.ts
import jwt from 'jsonwebtoken'
import { prisma } from '~~/server/utils/database'
import { startRequest, responses } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
    const requestId = startRequest(event)
    const startedAt = Date.now()

    try {
        const token = getCookie(event, 'auth-token')
        if (!token) {
            return responses.unauthorized(
                'No authentication token provided',
                { code: 'NO_TOKEN', requestId, event }
            )
        }

        const secret = process.env.JWT_SECRET
        if (!secret) {
            return responses.serverError(
                'Authentication misconfiguration',
                process.env.NODE_ENV === 'development' ? 'JWT_SECRET is not set' : undefined,
                { requestId, event }
            )
        }

        // Verify JWT
        let decoded: any
        try {
            decoded = jwt.verify(token, secret)
        } catch (jwtError: any) {
            const name = jwtError?.name
            const map = {
                TokenExpiredError: { code: 'TOKEN_EXPIRED', message: 'Authentication token has expired' },
                JsonWebTokenError: { code: 'MALFORMED_TOKEN', message: 'Malformed authentication token' }
            } as const
            const { code, message } = (name && map[name as keyof typeof map]) || {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            }
            return responses.unauthorized(message, { code, requestId, event })
        }

        // Validate session
        const now = new Date()
        const session = await prisma.session.findFirst({
            where: { token, userId: decoded.userId, expiresAt: { gt: now } },
            select: { expiresAt: true }
        })

        if (!session) {
            return responses.unauthorized(
                'Session expired or invalid',
                { code: 'SESSION_EXPIRED', requestId, event }
            )
        }

        // Fetch user & profile
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        id: true,
                        nik: true,
                        address: true
                    }
                }
            }
        })

        if (!user) {
            return responses.unauthorized(
                'User not found',
                { code: 'USER_NOT_FOUND', requestId, event }
            )
        }

        if (!user.isActive) {
            return responses.unauthorized(
                'User account is deactivated',
                { code: 'ACCOUNT_DEACTIVATED', requestId, event }
            )
        }

        // Count active sessions safely
        const activeSessions = await prisma.session.count({
            where: { userId: user.id, expiresAt: { gt: now } }
        })

        const executionTime = `${Date.now() - startedAt}ms`

        return responses.ok(
            {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    avatar: user.avatar,
                    is_active: user.isActive,
                    created_at: user.createdAt.toISOString(),
                    updated_at: user.updatedAt.toISOString(),
                    profile: user.profile,
                    session_info: {
                        expires_at: session.expiresAt.toISOString(),
                        active_sessions: activeSessions
                    }
                }
            },
            'User information retrieved successfully',
            {
                requestId,
                event,
                executionTime,
                links: {
                    self: '/api/auth/me',
                    related: {
                        profile: '/api/user/profile',
                        update_profile: '/api/user/profile',
                        change_password: '/api/auth/change-password',
                        logout: '/api/auth/logout',
                        dashboard: '/api/dashboard'
                    }
                }
            }
        )

    } catch (error: unknown) {
        const executionTime = `${Date.now() - startedAt}ms`
        const debug = error instanceof Error ? error.message : 'Internal error'
        return responses.serverError(
            'Failed to retrieve user information',
            process.env.NODE_ENV === 'development' ? debug : undefined,
            { requestId, event, executionTime, code: 'USER_INFO_ERROR' }
        )
    }
})
