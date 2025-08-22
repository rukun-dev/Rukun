// server/api/auth/forgot-password.post.ts
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { getClientIP } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

// Zod validation schema
const forgotSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .max(255, 'Email is too long')
        .toLowerCase()
        .transform(v => v.trim())
})

export default defineEventHandler(async (event) => {
    const requestId = startRequest(event)
    const startedAt = Date.now()

    try {
        // Parse & validate body
        const body = await readBody(event)
        const { email } = forgotSchema.parse(body)

        // Cari user (tanpa membocorkan hasil ke klien)
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true, isActive: true }
        })

        // Selalu kembalikan sukses untuk keamanan (hindari enumeration)
        // Namun jika user valid & aktif, teruskan proses pembuatan token + email
        if (!user || !user.isActive) {
            // Samakan timing agar tidak mudah ditebak
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 400) + 400))

            const executionTime = `${Date.now() - startedAt}ms`
            return responses.ok(
                {
                    email_sent: true,
                    estimated_delivery: '5-10 minutes'
                },
                'If the email address is registered, password reset instructions have been sent',
                {
                    requestId,
                    event,
                    executionTime,
                    nextStep: {
                        action: 'check_email',
                        endpoint: '/api/auth/reset-password',
                        method: 'POST',
                        required: ['token', 'email', 'password']
                    },
                    links: {
                        self: '/api/auth/forgot-password',
                        related: {
                            reset_password: '/api/auth/reset-password',
                            login: '/api/auth/login'
                        }
                    }
                }
            )
        }

        // Generate reset token (1 jam)
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

        // Simpan token (upsert ke systemSetting)
        await prisma.systemSetting.upsert({
            where: { key: `reset_token_${user.id}` },
            update: {
                value: JSON.stringify({
                    token: resetToken,
                    expiresAt: resetTokenExpiry.toISOString(),
                    attempts: 0
                })
            },
            create: {
                key: `reset_token_${user.id}`,
                value: JSON.stringify({
                    token: resetToken,
                    expiresAt: resetTokenExpiry.toISOString(),
                    attempts: 0
                }),
                description: 'Password reset token'
            }
        })

        // Validasi env email (hindari crash bila belum dikonfigurasi)
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL, FRONTEND_URL } = process.env
        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !FRONTEND_URL) {
            // Tetap “sukses” ke klien (agar tak bocor), tapi log server misconfig
            const executionTime = `${Date.now() - startedAt}ms`
            return responses.ok(
                {
                    email_sent: true,
                    recipient: email,
                    expires_in: '1 hour',
                    estimated_delivery: '5-10 minutes'
                },
                'Password reset instructions have been sent to your email',
                {
                    requestId,
                    event,
                    executionTime,
                    nextStep: {
                        action: 'check_email',
                        endpoint: '/api/auth/reset-password',
                        method: 'POST',
                        required: ['token', 'email', 'password']
                    },
                    links: {
                        self: '/api/auth/forgot-password',
                        related: {
                            reset_password: '/api/auth/reset-password',
                            login: '/api/auth/login'
                        }
                    }
                }
            )
        }

        // Kirim email reset
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT, 10),
            secure: SMTP_PORT === '465',
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        })

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

        await transporter.sendMail({
            from: FROM_EMAIL || 'noreply@rt-app.com',
            to: email,
            subject: 'Password Reset Request - RT Management System',
            html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>You requested a password reset for your RT Management System account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>If you didn't request this reset, please ignore this email</li>
            <li>Your password will not be changed until you create a new one</li>
          </ul>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #007bff; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
      `
        })

        // Activity log
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'PASSWORD_RESET_REQUEST',
                description: 'Password reset email sent successfully',
                ipAddress: getClientIP(event),
                userAgent: getHeader(event, 'user-agent')
            }
        })

        const executionTime = `${Date.now() - startedAt}ms`
        return responses.ok(
            {
                email_sent: true,
                recipient: email,
                expires_in: '1 hour',
                estimated_delivery: '5-10 minutes'
            },
            'Password reset instructions have been sent to your email',
            {
                requestId,
                event,
                executionTime,
                nextStep: {
                    action: 'check_email',
                    endpoint: '/api/auth/reset-password',
                    method: 'POST',
                    required: ['token', 'email', 'password']
                },
                links: {
                    self: '/api/auth/forgot-password',
                    related: {
                        reset_password: '/api/auth/reset-password',
                        login: '/api/auth/login'
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
                        const f = issue.path[0]?.toString()
                        if (f) acc[f] = issue.message
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
            'Unable to process password reset request at this time',
            process.env.NODE_ENV === 'development' ? debug : undefined,
            { requestId, event, executionTime, code: 'PASSWORD_RESET_ERROR', note: 'Please try again later or contact support' }
        )
    }
})
