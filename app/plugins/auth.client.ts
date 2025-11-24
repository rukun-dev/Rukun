// plugins/auth.client.ts
export default defineNuxtPlugin(async () => {
  const { fetchUser, isAuthenticated, isLoading } = useAuth()
  const route = useRoute()
  
  console.log('🔌 Auth Plugin - Initializing auth state, current route:', route.path)
  
  // Don't auto-fetch user on landing page
  if (route.path === '/') {
    console.log('🔌 Auth Plugin - Skipping auth fetch on landing page')
    return
  }
  
  // Only fetch if not already authenticated and not loading
  if (!isAuthenticated.value && !isLoading.value) {
    try {
      console.log('🔌 Auth Plugin - Fetching user data')
      await fetchUser()
      console.log('🔌 Auth Plugin - Auth state initialized:', isAuthenticated.value)
    } catch (error) {
      console.log('🔌 Auth Plugin - Failed to initialize auth:', error)
    }
  } else {
    console.log('🔌 Auth Plugin - Auth already initialized or loading')
  }
})