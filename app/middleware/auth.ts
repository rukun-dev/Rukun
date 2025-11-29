export default defineNuxtRouteMiddleware(async (to, from) => {
  // Handle server-side rendering
  if (process.server) {
    // Server-side: lakukan verifikasi awal agar tidak terjadi hydration mismatch
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/unauthorized']
    const isPublicRoute = publicRoutes.includes(to.path) || to.path.startsWith('/reset-password')

    // Public route: lewati pengecekan
    if (isPublicRoute) {
      return
    }

    try {
      // Cek sesi lewat API agar SSR bisa redirect lebih awal jika tidak login
      const headers = useRequestHeaders(['cookie', 'user-agent'])
      const resp: any = await $fetch('/api/auth/me', {
        method: 'GET',
        headers
      })

      const user = resp?.data?.user
      if (!resp?.success || !user) {
        return navigateTo('/login')
      }

      // Cek role berbasis meta.roles bila ada
      const requiredRoles = (to.meta as any)?.roles as string[] | undefined
      if (requiredRoles && requiredRoles.length > 0) {
        const isAllowed = requiredRoles.includes(user.role)
        if (!isAllowed) {
          return navigateTo('/unauthorized')
        }
      }

      // Auth OK pada SSR, lanjut render
      return
    } catch (error) {
      // Gagal memverifikasi di SSR: redirect ke login
      return navigateTo('/login')
    }
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
  
  // Final authentication check: redirect to login if still not authenticated
  if (!isAuthenticated.value) {
    console.log('🔐 Auth Middleware - Final auth check failed, redirecting to login')
    hideLoading()
    return navigateTo('/login')
  }

  /* ----------------------------------------------------
     Role-based Authorization (meta.roles)
     If the target route defines meta.roles as an array of allowed roles,
     verify the current user's role. If unauthorized, redirect to /unauthorized.
  -----------------------------------------------------*/
  const requiredRoles = (to.meta as any)?.roles as string[] | undefined
  if (requiredRoles && requiredRoles.length > 0) {
    const { canAccess } = useAuth()
    const isAllowed = canAccess(requiredRoles)
    console.log('🔐 Auth Middleware - Role check', { requiredRoles, isAllowed })

    if (!isAllowed) {
      console.log('🔐 Auth Middleware - User role not authorized, redirecting to /unauthorized')
      return navigateTo('/unauthorized')
    }
  }
  
  // Hide loading when access is granted (auth + role)
  hideLoading()
  console.log('🔐 Auth Middleware - Access granted to protected route')
})