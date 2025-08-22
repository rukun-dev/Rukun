// server/api/auth/register.post.ts
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '~~/server/utils/database'
import { getClientIP } from '~~/server/utils/auth'
import { startRequest, responses } from '~~/server/utils/response'

// Zod validation schema
const registerSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be less than 100 characters')
        .regex(/^[a-zA-Z\s.',-]+$/, 'Name contains invalid characters')
        .transform(val => val.trim()),

    email: z.string()
        .email('Invalid email format')
        .max(255, 'Email is too long')
        .toLowerCase()
        .transform(val => val.trim()),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password is too long')
        .refine(
            (password) => /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
            {
                message: 'Password must contain uppercase, lowercase, and numbers',
                path: ['password']
            }
        ),

    phone: z.string()
        .optional()
        .nullable()
        .transform(val => val?.replace(/[\s-]/g, '') || null)
        .refine(
            (phone) => !phone || /^(\+62|62|0)[0-9]{8,13}$/.test(phone),
            { message: 'Invalid Indonesian phone number format' }
        ),

    role: z.enum(['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS', 'BENDAHARA', 'STAFF', 'WARGA'])
        .default('WARGA')
})

export default defineEventHandler(async (event) => {
    const requestId = startRequest(event)

    try {
        // Parse and validate request body
        const body = await readBody(event)
        const validatedData = registerSchema.parse(body)

        // Check for existing user and phone in parallel
        const [existingUser, existingPhone] = await Promise.all([
            prisma.user.findUnique({
                where: { email: validatedData.email },
                select: { id: true }
            }),
            validatedData.phone
                ? prisma.user.findFirst({
                    where: { phone: validatedData.phone },
                    select: { id: true }
                })
                : null
        ])

        // Handle conflicts
        if (existingUser) {
            setResponseStatus(event, 409)
            return responses.conflict('Email already registered', { requestId, event })
        }

        if (existingPhone) {
            setResponseStatus(event, 409)
            return responses.conflict('Phone number already registered', { requestId, event })
        }

        // Hash password and create user in transaction
        const hashedPassword = await bcrypt.hash(validatedData.password, 12)
        const clientIP = getClientIP(event)
        const userAgent = getHeader(event, 'user-agent')

        const user = await prisma.$transaction(async (tx) => {
            // Create user with profile
            const newUser = await tx.user.create({
                data: {
                    name: validatedData.name,
                    email: validatedData.email,
                    password: hashedPassword,
                    phone: validatedData.phone,
                    role: validatedData.role,
                    profile: { create: {} }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    profile: {
                        select: {
                            id: true,
                            nik: true,
                            address: true
                        }
                    }
                }
            })

            // Log registration activity
            await tx.activityLog.create({
                data: {
                    userId: newUser.id,
                    action: 'REGISTER',
                    description: `User registered with role: ${validatedData.role}`,
                    ipAddress: clientIP,
                    userAgent
                }
            })

            return newUser
        })

        // Success response with next steps
        return responses.created(
            { user },
            'Registration successful',
            {
                requestId,
                event,
                nextStep: {
                    action: 'login',
                    endpoint: '/api/auth/login',
                    method: 'POST',
                    required: ['email', 'password'],
                    description: 'Login with your credentials to get access token'
                },
                links: {
                    self: '/api/auth/register',
                    related: {
                        login: '/api/auth/login',
                        forgot_password: '/api/auth/forgot-password',
                        profile: `/api/users/${user.id}/profile`
                    }
                }
            }
        )

    } catch (error: unknown) {
        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            const zodError = error as z.ZodError<any>
            const firstError = zodError.issues[0]
            setResponseStatus(event, 400)
            return responses.validation(
                firstError?.message || 'Validation failed',
                firstError?.path[0]?.toString(),
                {
                    field_errors: zodError.issues.reduce((acc, issue) => {
                        const field = issue.path[0]?.toString()
                        if (field) acc[field] = issue.message
                        return acc
                    }, {} as Record<string, string>),
                    error_count: zodError.issues.length
                },
                { requestId, event }
            )
        }

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            const prismaError = error as any
            const target = prismaError.meta?.target?.[0]
            const field = target === 'email' ? 'email' : target === 'phone' ? 'phone' : 'field'
            setResponseStatus(event, 409)
            return responses.conflict(
                `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
                { requestId, event }
            )
        }

        // Handle bcrypt errors
        if (error instanceof Error && error.message.includes('bcrypt')) {
            setResponseStatus(event, 500)
            return responses.serverError(
                'Password hashing failed',
                undefined,
                { requestId, event }
            )
        }

        // Generic server error
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        return responses.serverError(
            'Registration failed due to server error',
            process.env.NODE_ENV === 'development' ? errorMessage : undefined,
            { requestId, event }
        )
    }
})