<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
      <p class="mt-2 text-sm text-gray-600">
        Kelola informasi profil dan pengaturan akun Anda
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="animate-pulse">
          <div class="flex items-center space-x-6">
            <div class="w-20 h-20 bg-gray-300 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-6 bg-gray-300 rounded w-1/3"></div>
              <div class="h-4 bg-gray-300 rounded w-1/4"></div>
              <div class="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800">{{ error }}</p>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- Profile Overview Card -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Informasi Profil</h2>
        </div>
        <div class="p-6">
          <div class="flex items-center space-x-6">
            <!-- Avatar -->
            <div class="relative">
              <img 
                :src="user.avatar || '/default-avatar.svg'" 
                :alt="user.name"
                class="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              >
              <button 
                @click="showAvatarUpload = true"
                class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            <!-- User Info -->
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900">{{ user.name }}</h3>
              <p class="text-sm text-gray-500">{{ user.role }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ user.email }}</p>
              <div class="mt-3">
                <button 
                  @click="showPasswordForm = true"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2-2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Ubah Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Details Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Personal Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Informasi Pribadi</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Nama Lengkap</label>
              <p class="mt-1 text-sm text-gray-900">{{ user.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 text-sm text-gray-900">{{ user.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Nomor Telepon</label>
              <p class="mt-1 text-sm text-gray-900">{{ user.phone || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">NIK</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.nik || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Tanggal Lahir</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(profileData?.birth_date) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Tempat Lahir</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.birth_place || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Alamat</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.address || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Pekerjaan</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.job || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Pendidikan</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.education || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Status Pernikahan</label>
              <p class="mt-1 text-sm text-gray-900">{{ profileData?.marital_status || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Account Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Informasi Akun</h3>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Role</label>
              <p class="mt-1 text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ user.role }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Status</label>
              <p class="mt-1 text-sm text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Aktif
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Bergabung Sejak</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(user?.created_at) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Terakhir Diupdate</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(user?.updated_at) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Total Aktivitas</label>
              <p class="mt-1 text-sm text-gray-900">{{ statistics?.total_activities || 0 }} aktivitas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Log -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Aktivitas Terbaru</h3>
        </div>
        <div class="p-6">
          <div v-if="recentActivities?.preview?.length" class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in recentActivities.preview" :key="activity.id">
                <div class="relative pb-8" :class="{ 'pb-0': index === (recentActivities?.preview?.length || 1) - 1 }">
                  <span 
                    v-if="index !== (recentActivities?.preview?.length || 1) - 1"
                    class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                    aria-hidden="true"
                  ></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">{{ activity.description || activity.action }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ formatDateTime(activity.created_at) }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div v-else class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="mt-2 text-sm text-gray-500">Belum ada aktivitas terbaru</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AvatarUpload 
      v-if="showAvatarUpload"
      :current-avatar="user?.avatar"
      @close="closeAvatarUpload"
      @upload="handleAvatarUpload"
    />



    <PasswordChangeForm 
      v-if="showPasswordForm"
      @close="showPasswordForm = false"
      @save="handlePasswordChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AvatarUpload from '../../components/dashboard/AvatarUpload.vue'
import PasswordChangeForm from '../../components/dashboard/PasswordChangeForm.vue'

// Global loading
const { showLoading, hideLoading } = useGlobalLoading()

// Langsung tampilkan loading saat komponen dimuat
showLoading('Memuat data profil...', 'Mohon tunggu sebentar')

// Layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Composables
const { user: currentUser, refreshUser } = useAuth()
const { 
  profile, 
  loading, 
  error, 
  user, 
  profileData, 
  statistics, 
  recentActivities, 
  profileSuggestions,
  completionPercentage,
  fetchProfile, 
  updateProfile, 
  uploadAvatar, 
  formatDate, 
  formatDateTime 
} = useProfile()

// State
const showAvatarUpload = ref(false)
const showPasswordForm = ref(false)

// Computed

// Methods
const handleAvatarUpload = async (avatarUrl: string) => {
  showLoading('Memperbarui avatar...', 'Mohon tunggu sebentar')
  try {
    // Avatar URL is already uploaded/deleted by AvatarUpload component
    // Just close the modal and refresh profile data
    showAvatarUpload.value = false
    
    // Refresh both profile data and auth user data to sync header
    if (currentUser.value?.id) {
      // For delete operations (when avatarUrl is default), immediately update auth state
      if (avatarUrl === '/default-avatar.svg' && currentUser.value) {
        // Temporarily update the user avatar in auth state for immediate UI feedback
        const { updateUserAvatar } = useAuth()
        updateUserAvatar('/default-avatar.svg')
      }
      
      // Then refresh auth user data to ensure consistency
      await refreshUser()
      // Finally fetch profile with specific user ID
      await fetchProfile(currentUser.value.id)
    }
    
    console.log('Avatar updated successfully:', avatarUrl)
  } catch (err) {
    console.error('Failed to refresh profile after avatar update:', err)
  } finally {
    hideLoading()
  }
}

const closeAvatarUpload = () => {
  showAvatarUpload.value = false
}

const handlePasswordChange = () => {
  showPasswordForm.value = false
  console.log('Password changed successfully')
}

// Fetch profile data - handle both client and server side
const fetchProfileData = async () => {
  if (currentUser.value?.id) {
    await fetchProfile(currentUser.value.id)
  }
}

onMounted(async () => {
  try {
    await fetchProfileData()
  } catch (err) {
    console.error('Failed to load profile:', err)
  } finally {
    hideLoading()
  }
})

// Watch for user changes (handle auth state updates)
watch(currentUser, async (newUser) => {
  if (newUser?.id && !profile.value) {
    try {
      await fetchProfileData()
    } catch (err) {
      console.error('Failed to load profile on user change:', err)
    }
  }
})
</script>

<style scoped>
/* Custom styles if needed */
</style>