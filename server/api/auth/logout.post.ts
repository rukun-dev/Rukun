// server/api/auth/logout.post.ts
import { prisma } from '~~/server/utils/database'
import { getClientIP } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
    const requestId = startRequest(event)
    const startedAt = Date.now()

    try {
        const token = getCookie(event, 'auth-token')
        let userId: string | null = null

        if (token) {
            // Cari session yang masih ada
            const session = await prisma.session.findFirst({
                where: { token },
                select: { userId: true }
            })

            if (session) {
                userId = session.userId

                // Hapus session + tulis activity log secara atomik
                const clientIP = getClientIP(event)
                const userAgent = getHeader(event, 'user-agent')

                await prisma.$transaction(async (tx) => {
                    await tx.session.deleteMany({ where: { token } })
                    await tx.activityLog.create({
                        data: {
                            userId: session.userId,
                            action: 'LOGOUT',
                            description: 'User logged out successfully',
                            ipAddress: clientIP,
                            userAgent
                        }
                    })
                })
            }
        }

        // Hapus cookie selalu
        deleteCookie(event, 'auth-token')

        const executionTime = `${Date.now() - startedAt}ms`

        return responses.ok(
            {
                logged_out: true,
                session_cleared: !!token,
                user_id: userId
            },
            'Logout successful',
            {
                requestId,
                event,
                executionTime,
                nextStep: {
                    action: 'redirect_login',
                    endpoint: '/api/auth/login',
                    method: 'POST',
                    required: ['email', 'password']
                },
                links: {
                    self: '/api/auth/logout',
                    related: {
                        login: '/api/auth/login',
                        register: '/api/auth/register',
                        forgot_password: '/api/auth/forgot-password'
                    }
                }
            }
        )

    } catch (error: unknown) {
        // Tetap hapus cookie untuk keamanan
        try { deleteCookie(event, 'auth-token') } catch {}

        const executionTime = `${Date.now() - startedAt}ms`
        const debug = error instanceof Error ? error.message : 'Internal error'

        // Tetap kembalikan 200 (niat logout tercapai lokal), tapi beri catatan warning
        return responses.ok(
            {
                logged_out: true,
                session_cleared: false,
                warning: 'Logout completed with warnings'
            },
            'Logout completed with warnings',
            {
                requestId,
                event,
                executionTime,
                code: 'LOGOUT_WARNING',
                original_error: process.env.NODE_ENV === 'development' ? debug : undefined,
                note: 'Session cleared locally despite server error',
                links: {
                    self: '/api/auth/logout',
                    related: {
                        login: '/api/auth/login',
                        register: '/api/auth/register',
                        forgot_password: '/api/auth/forgot-password'
                    }
                }
            }
        )
    }
})
