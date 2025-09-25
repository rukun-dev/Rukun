export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side rendering for public routes
  if (process.server) {
    return
  }

  const { isAuthenticated, fetchUser, isLoading } = useAuth()
  
  // Try to fetch user data if not already authenticated
  if (!isAuthenticated.value && !isLoading.value) {
    try {
      await fetchUser()
    } catch (error) {
      // Silently handle fetch errors - user will be treated as unauthenticated
      console.debug('Auth middleware: Failed to fetch user', error)
    }
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/unauthorized']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/reset-password')
  
  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/login')
  }
  
  // Redirect to dashboard if authenticated and trying to access auth pages
  if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})