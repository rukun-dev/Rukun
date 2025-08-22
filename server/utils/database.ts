import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    })

// Prevent multiple instances during hot reloading in development
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect()
})

// Helper functions untuk common operations
export const dbHelpers = {
    // Health check
    async healthCheck() {
        try {
            await prisma.$queryRaw`SELECT 1`
            return true
        } catch {
            return false
        }
    },

    // Get database info
    async getDatabaseInfo() {
        const [userCount, wargaCount, familyCount] = await Promise.all([
            prisma.user.count(),
            prisma.warga.count(),
            prisma.family.count(),
        ])

        return {
            users: userCount,
            wargas: wargaCount,
            families: familyCount,
            connected: await this.healthCheck()
        }
    },

    // Soft delete helper (jika diperlukan)
    async softDelete(model: string, id: string) {
        // Implementasi tergantung model yang digunakan
        // Misalnya untuk User yang punya isActive field
        if (model === 'user') {
            return await prisma.user.update({
                where: { id },
                data: { isActive: false }
            })
        }
    },

    // Transaction wrapper dengan retry logic
    async transaction<T>(fn: (tx: any) => Promise<T>, maxRetries = 3): Promise<T> {
        let attempt = 0
        while (attempt < maxRetries) {
            try {
                return await prisma.$transaction(fn)
            } catch (error: any) {
                attempt++
                if (attempt >= maxRetries || !error.code?.includes('P2034')) {
                    throw error
                }
                // Wait before retry (exponential backoff)
                await new Promise(resolve =>
                    setTimeout(resolve, Math.pow(2, attempt) * 1000)
                )
            }
        }
        throw new Error('Max retries exceeded')
    }
}