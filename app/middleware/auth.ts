export default defineNuxtRouteMiddleware((to, from) => {
  // Implement actual authentication check
  
  // Check if user is authenticated by looking for auth token in localStorage
  // This assumes that after successful login, a token is stored in localStorage
  const isAuthenticated = process.client ? !!localStorage.getItem('auth_token') : false
  
  if (!isAuthenticated && to.path !== '/' && to.path !== '/login' && to.path !== '/register' && 
      to.path !== '/forgot-password' && !to.path.startsWith('/reset-password')) {
    // Redirect to login page if not authenticated and trying to access protected routes
    return navigateTo('/login')
  }
  
  // If user is authenticated and trying to access login/register pages, redirect to dashboard
  if (isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    return navigateTo('/dashboard')
  }
})