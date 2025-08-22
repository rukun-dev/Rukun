// server/api/auth/reset-password.post.ts
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { getClientIP } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

// Zod schema
const resetSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    email: z.string()
        .email('Invalid email format')
        .max(255, 'Email is too long')
        .toLowerCase()
        .transform(v => v.trim()),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password is too long')
        .refine(
            (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd),
            { message: 'Password must contain uppercase, lowercase, and numbers', path: ['password'] }
        )
})

export default defineEventHandler(async (event) => {
    const requestId = startRequest(event)
    const startedAt = Date.now()

    try {
        // Parse & validate body
        const body = await readBody(event)
        const { token, email, password } = resetSchema.parse(body)

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, password: true, isActive: true }
        })

        if (!user || !user.isActive) {
            return responses.unauthorized(
                'Invalid reset request',
                { code: 'INVALID_RESET_TOKEN', requestId, event }
            )
        }

        // Fetch token setting
        const setting = await prisma.systemSetting.findUnique({
            where: { key: `reset_token_${user.id}` },
            select: { value: true }
        })

        if (!setting) {
            return responses.unauthorized(
                'Invalid or expired reset token',
                { code: 'TOKEN_NOT_FOUND', requestId, event }
            )
        }

        // Parse token payload
        let tokenData: { token: string; expiresAt: string; attempts?: number }
        try {
            tokenData = JSON.parse(setting.value)
        } catch {
            return responses.unauthorized(
                'Invalid reset token format',
                { code: 'MALFORMED_TOKEN', requestId, event }
            )
        }

        // Validate token match
        if (tokenData.token !== token) {
            const attempts = (tokenData.attempts || 0) + 1

            if (attempts >= 5) {
                await prisma.systemSetting.delete({ where: { key: `reset_token_${user.id}` } })
                return responses.unauthorized(
                    'Too many invalid attempts. Please request a new password reset.',
                    { code: 'MAX_ATTEMPTS_EXCEEDED', requestId, event }
                )
            }

            await prisma.systemSetting.update({
                where: { key: `reset_token_${user.id}` },
                data: { value: JSON.stringify({ ...tokenData, attempts }) }
            })

            return responses.unauthorized(
                'Invalid reset token',
                { code: 'INVALID_TOKEN', requestId, event }
            )
        }

        // Validate token expiry
        if (new Date(tokenData.expiresAt) < new Date()) {
            await prisma.systemSetting.delete({ where: { key: `reset_token_${user.id}` } })
            return responses.unauthorized(
                'Reset token has expired. Please request a new password reset.',
                { code: 'TOKEN_EXPIRED', requestId, event }
            )
        }

        // Ensure new password differs from current
        const same = await bcrypt.compare(password, user.password)
        if (same) {
            return responses.validation(
                'New password must be different from your current password',
                'password',
                {},
                { requestId, event }
            )
        }

        const clientIP = getClientIP(event)
        const userAgent = getHeader(event, 'user-agent')
        const hashed = await bcrypt.hash(password, 12)

        // Atomically: update password, delete token, invalidate sessions, log activity
        const deletedSessions = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: user.id },
                data: { password: hashed }
            })

            await tx.systemSetting.delete({
                where: { key: `reset_token_${user.id}` }
            })

            const del = await tx.session.deleteMany({
                where: { userId: user.id }
            })

            await tx.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'PASSWORD_RESET',
                    description: 'Password reset completed successfully',
                    ipAddress: clientIP,
                    userAgent
                }
            })

            return del.count
        })

        const executionTime = `${Date.now() - startedAt}ms`
        return responses.ok(
            {
                password_reset: true,
                user_id: user.id,
                security_actions: {
                    sessions_invalidated: deletedSessions,
                    token_deleted: true
                }
            },
            'Password has been reset successfully',
            {
                requestId,
                event,
                executionTime,
                nextStep: {
                    action: 'login_with_new_password',
                    endpoint: '/api/auth/login',
                    method: 'POST',
                    required: ['email', 'password']
                },
                links: {
                    self: '/api/auth/reset-password',
                    related: {
                        login: '/api/auth/login',
                        forgot_password: '/api/auth/forgot-password'
                    }
                }
            }
        )

    } catch (error: unknown) {
        // Zod validation error
        if (error instanceof z.ZodError) {
            const first = error.issues[0]
            return responses.validation(
                first?.message || 'Validation failed',
                first?.path[0]?.toString(),
                {
                    field_errors: error.issues.reduce((acc, issue) => {
                        const field = issue.path[0]?.toString()
                        if (field) acc[field] = issue.message
                        return acc
                    }, {} as Record<string, string>),
                    error_count: error.issues.length
                },
                { requestId, event }
            )
        }

        const executionTime = `${Date.now() - startedAt}ms`
        const debug = error instanceof Error ? error.message : 'Internal error'
        return responses.serverError(
            'Password reset failed due to server error',
            process.env.NODE_ENV === 'development' ? debug : undefined,
            { requestId, event, executionTime, code: 'PASSWORD_RESET_ERROR' }
        )
    }
})
