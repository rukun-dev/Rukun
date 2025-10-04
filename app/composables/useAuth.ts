// composables/useAuth.ts
import { ref, computed, readonly, type Ref } from 'vue'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'SUPER_ADMIN' | 'KETUA_RT' | 'SEKRETARIS' | 'BENDAHARA' | 'STAFF' | 'WARGA'
  avatar?: string
  is_active: boolean
  created_at: string
  updated_at: string
  profile?: {
    id: string
    nik?: string
    address?: string
  }
  session_info?: {
    expires_at: string
    active_sessions: number
  }
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Global state
const authState: Ref<AuthState> = ref({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
})

export const useAuth = () => {
  // Computed properties
  const user = computed(() => authState.value.user)
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const isLoading = computed(() => authState.value.isLoading)
  const error = computed(() => authState.value.error)
  const userRole = computed(() => authState.value.user?.role || null)

  // Role-based access control computed properties
  const canAccessUserManagement = computed(() => {
    return userRole.value && ['SUPER_ADMIN', 'KETUA_RT'].includes(userRole.value)
  })

  const canAccessFinance = computed(() => {
    return userRole.value && ['SUPER_ADMIN', 'BENDAHARA'].includes(userRole.value)
  })

  const canAccessReports = computed(() => {
    return userRole.value && ['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS'].includes(userRole.value)
  })

  const isSuperAdmin = computed(() => userRole.value === 'SUPER_ADMIN')
  const isKetuaRT = computed(() => userRole.value === 'KETUA_RT')
  const isStaff = computed(() => {
    return userRole.value && ['SEKRETARIS', 'BENDAHARA', 'STAFF'].includes(userRole.value)
  })
  const isWarga = computed(() => userRole.value === 'WARGA')

  // Methods
  const fetchUser = async (): Promise<void> => {
    console.log('🔑 useAuth - fetchUser called')
    try {
      authState.value.isLoading = true
      authState.value.error = null
      console.log('🔑 useAuth - Starting API call to /api/auth/me')

      const response = await $fetch<{
        success: boolean
        data: { user: User }
        message: string
      }>('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      console.log('🔑 useAuth - API response received:', { 
        success: response.success, 
        hasUser: !!response.data?.user,
        message: response.message 
      })

      if (response.success && response.data?.user) {
        authState.value.user = response.data.user
        authState.value.isAuthenticated = true
        console.log('🔑 useAuth - User authenticated successfully:', response.data.user.email)
      } else {
        console.log('🔑 useAuth - Authentication failed:', response.message)
        throw new Error(response.message || 'Failed to fetch user data')
      }
    } catch (err: any) {
      console.error('🔑 useAuth - Failed to fetch user:', err)
      console.log('🔑 useAuth - Error details:', {
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
        data: err.data
      })
      authState.value.user = null
      authState.value.isAuthenticated = false
      
      // Handle different error types
      if (err.status === 401) {
        authState.value.error = 'Session expired. Please login again.'
        console.log('🔑 useAuth - 401 Unauthorized - Session expired')
      } else {
        authState.value.error = err.data?.message || err.message || 'Failed to fetch user data'
        console.log('🔑 useAuth - Other error:', authState.value.error)
      }
    } finally {
      authState.value.isLoading = false
      console.log('🔑 useAuth - fetchUser completed, final state:', {
        isAuthenticated: authState.value.isAuthenticated,
        isLoading: authState.value.isLoading,
        hasUser: !!authState.value.user,
        error: authState.value.error
      })
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      authState.value.isLoading = true
      authState.value.error = null

      const response = await $fetch<{
        success: boolean
        data: { user: User }
        message: string
      }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        credentials: 'include'
      })

      if (response.success && response.data?.user) {
        authState.value.user = response.data.user
        authState.value.isAuthenticated = true
        return { success: true }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err: any) {
      console.error('Login failed:', err)
      authState.value.error = err.data?.message || err.message || 'Login failed'
      return { success: false, message: authState.value.error || 'Login failed' }
    } finally {
      authState.value.isLoading = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      // Clear state regardless of API call result
      authState.value.user = null
      authState.value.isAuthenticated = false
      authState.value.error = null
      
      // Redirect to login page
      await navigateTo('/login')
    }
  }

  const clearError = (): void => {
    authState.value.error = null
  }

  const refreshUser = async (): Promise<void> => {
    if (authState.value.isAuthenticated) {
      await fetchUser()
    }
  }

  // Initialize auth state on first use
  const initAuth = async (): Promise<void> => {
    if (!authState.value.isAuthenticated && !authState.value.isLoading) {
      await fetchUser()
    }
  }

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    error: readonly(error),
    userRole: readonly(userRole),
    
    // Role-based access
    canAccessUserManagement: readonly(canAccessUserManagement),
    canAccessFinance: readonly(canAccessFinance),
    canAccessReports: readonly(canAccessReports),
    isSuperAdmin: readonly(isSuperAdmin),
    isKetuaRT: readonly(isKetuaRT),
    isStaff: readonly(isStaff),
    isWarga: readonly(isWarga),
    
    // Methods
    fetchUser,
    login,
    logout,
    clearError,
    refreshUser,
    initAuth
  }
}

// Note: Auth initialization is now handled by middleware to prevent race conditions