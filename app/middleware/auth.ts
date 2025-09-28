export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side rendering
  if (process.server) {
    return
  }

  const { isAuthenticated, fetchUser, isLoading } = useAuth()
  const { showLoading, hideLoading } = useGlobalLoading()
  
  // Debug logging
  console.log('🔐 Auth Middleware - Route:', to.path)
  console.log('🔐 Auth Middleware - Initial state:', {
    isAuthenticated: isAuthenticated.value,
    isLoading: isLoading.value,
    from: from?.path
  })
  
  // Define public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/unauthorized']
  const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/reset-password')
  
  console.log('🔐 Auth Middleware - Is public route:', isPublicRoute)
  
  // For public routes, allow access without authentication check
  if (isPublicRoute) {
    console.log('🔐 Auth Middleware - Processing public route')
    
    // Redirect to dashboard if authenticated and trying to access auth pages
    if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
      console.log('🔐 Auth Middleware - Redirecting authenticated user to dashboard')
      return navigateTo('/dashboard')
    }
    
    console.log('🔐 Auth Middleware - Allowing access to public route')
    return // Allow access to public routes
  }

  // For protected routes, ensure user is authenticated
  console.log('🔐 Auth Middleware - Processing protected route')
  
  // Show loading if authentication is in progress
  if (isLoading.value) {
    showLoading('Memverifikasi akses...', 'Mohon tunggu sebentar')
  }
  
  // If not authenticated and not loading, try one more fetch (fallback)
  if (!isAuthenticated.value && !isLoading.value) {
    console.log('🔐 Auth Middleware - Fallback fetch for protected route')
    showLoading('Memverifikasi akses...', 'Memeriksa status login Anda')
    
    try {
      await fetchUser()
      console.log('🔐 Auth Middleware - Fallback fetch completed:', isAuthenticated.value)
    } catch (error) {
      console.log('🔐 Auth Middleware - Fallback fetch failed, redirecting to login')
      hideLoading()
      return navigateTo('/login')
    }
  }
  
  // Wait for loading to complete if still loading
  if (isLoading.value) {
    console.log('🔐 Auth Middleware - Waiting for loading to complete')
    // Wait a bit for loading to complete
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // If still loading after timeout, redirect to login for safety
    if (isLoading.value) {
      console.log('🔐 Auth Middleware - Still loading after timeout, redirecting to login')
      hideLoading()
      return navigateTo('/login')
    }
  }
  
  // Final check: redirect to login if still not authenticated
  if (!isAuthenticated.value) {
    console.log('🔐 Auth Middleware - Final check failed, redirecting to login')
    hideLoading()
    return navigateTo('/login')
  }
  
  // Hide loading when access is granted
  hideLoading()
  console.log('🔐 Auth Middleware - Access granted to protected route')
})