// server/middleware/auth.ts
import { requireAuth } from '~~/server/utils/auth'
import { authErrorResponse } from '~~/server/utils/response'

// Define role type for better type safety
type UserRole = 'ADMIN' | 'RW' | 'RT' | 'WARGA'

export default defineEventHandler(async (event) => {
    // Define protected routes patterns
    const protectedRoutes = [
        '/api/protected/',
        '/api/user/',
        '/api/admin/',
        '/api/dashboard',
        '/api/reports',
        '/api/residents',
        '/api/announcements'
    ]

    // Check if current route needs authentication
    const currentPath = event.node.req.url || ''
    const needsAuth = protectedRoutes.some(route => currentPath.startsWith(route))

    if (needsAuth) {
        try {
            const user = await requireAuth(event)

            // Add user to event context for use in API handlers
            event.context.user = user
            event.context.authenticated = true

            // Add useful user info to context
            event.context.userId = user.id
            event.context.userRole = user.role
            event.context.userPermissions = getRolePermissions(user.role)

        } catch (error: any) {
            // Parse the error message if it's a JSON string (from our custom errors)
            let responseData
            try {
                responseData = JSON.parse(error.statusMessage)
            } catch (parseError) {
                // Fallback to generic error
                responseData = authErrorResponse('Authentication required')
            }

            // Return the formatted error response
            throw createError({
                statusCode: error.statusCode || 401,
                data: responseData
            })
        }
    }
})

// Helper function to get role permissions with proper typing
function getRolePermissions(role: string): string[] {
    const rolePermissions: Record<UserRole, string[]> = {
        'ADMIN': ['*'],
        'RW': [
            'read:all',
            'write:residents',
            'write:announcements',
            'read:reports',
            'write:reports'
        ],
        'RT': [
            'read:residents',
            'write:residents',
            'read:announcements',
            'write:announcements',
            'read:reports'
        ],
        'WARGA': [
            'read:announcements',
            'read:own_profile',
            'write:own_profile',
            'read:public_info'
        ]
    }

    // Type-safe access with fallback
    return rolePermissions[role as UserRole] || []
}