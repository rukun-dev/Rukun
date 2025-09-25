import { ref, computed } from 'vue'

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  is_active: boolean
  avatar?: string
  avatar_public_id?: string
  created_at: string
  updated_at: string
}

interface ProfileData {
  id: string
  nik?: string
  birth_date?: string
  birth_place?: string
  address?: string
  job?: string
  education?: string
  marital_status?: string
  created_at: string
  updated_at: string
  completion_percentage: number
}

interface ProfileResponse {
  user: UserProfile
  profile: ProfileData
  statistics: {
    created_wargas: number
    managed_families: number
    created_documents: number
    total_transactions: number
    total_payments: number
    created_announcements: number
    total_activities: number
  }
  recent_activities: {
    preview: Array<{
      id: string
      action: string
      description: string
      created_at: string
    }>
    total_count: number
    showing: number
  }
  profile_suggestions: string[]
}

export const useProfile = () => {
  const profile = ref<ProfileResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const user = computed(() => profile.value?.user || null)
  const profileData = computed(() => profile.value?.profile || null)
  const statistics = computed(() => profile.value?.statistics || null)
  const recentActivities = computed(() => profile.value?.recent_activities || null)
  const profileSuggestions = computed(() => profile.value?.profile_suggestions || [])
  const completionPercentage = computed(() => profileData.value?.completion_percentage || 0)

  // Fetch profile data
  const fetchProfile = async (userId?: string) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: ProfileResponse }>(`/api/users/profile/${userId || 'me'}`)
      profile.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to fetch profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update profile data
  const updateProfile = async (userId: string, profileData: Partial<ProfileData>) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: ProfileResponse }>(`/api/users/profile/${userId}`, {
        method: 'PUT',
        body: profileData
      })
      profile.value = data
      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Upload avatar
  const uploadAvatar = async (userId: string, file: File) => {
    loading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const { data } = await $fetch<{ data: { avatar: string, avatar_public_id: string } }>(`/api/users/avatar/${userId}`, {
        method: 'POST',
        body: formData
      })

      // Update profile with new avatar
      if (profile.value) {
        profile.value.user.avatar = data.avatar
        profile.value.user.avatar_public_id = data.avatar_public_id
      }

      return data
    } catch (err: any) {
      error.value = err.data?.message || 'Failed to upload avatar'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format datetime helper
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Reset state
  const reset = () => {
    profile.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    profile: readonly(profile),
    loading: readonly(loading),
    error: readonly(error),

    // Computed
    user,
    profileData,
    statistics,
    recentActivities,
    profileSuggestions,
    completionPercentage,

    // Methods
    fetchProfile,
    updateProfile,
    uploadAvatar,
    formatDate,
    formatDateTime,
    reset
  }
}