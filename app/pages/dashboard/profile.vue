<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Profil Pengguna</h1>
      <p class="mt-2 text-sm text-gray-600">
        Kelola informasi profil dan pengaturan akun Anda
      </p>
    </div>

    <!-- Profile Content -->
    <div class="space-y-6">
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
                :src="user.avatar || '/default-avatar.png'" 
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
              <div class="mt-3 flex space-x-3">
                <button 
                  @click="showEditForm = true"
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profil
                </button>
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
              <label class="text-sm font-medium text-gray-500">Tanggal Lahir</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(user.birthDate) || '-' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Alamat</label>
              <p class="mt-1 text-sm text-gray-900">{{ user.address || '-' }}</p>
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
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(user.createdAt) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Login Terakhir</label>
              <p class="mt-1 text-sm text-gray-900">{{ formatDate(user.lastLogin) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Total Login</label>
              <p class="mt-1 text-sm text-gray-900">{{ user.loginCount || 0 }} kali</p>
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
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(activity, index) in recentActivities" :key="activity.id">
                <div class="relative pb-8" :class="{ 'pb-0': index === recentActivities.length - 1 }">
                  <span 
                    v-if="index !== recentActivities.length - 1"
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
                        <p class="text-sm text-gray-500">{{ activity.description }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ formatDate(activity.createdAt) }}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AvatarUpload 
      v-if="showAvatarUpload"
      :current-avatar="user.avatar"
      @close="closeAvatarUpload"
      @upload="handleAvatarUpload"
    />

    <ProfileEditForm 
      v-if="showEditForm"
      :user="user"
      @close="showEditForm = false"
      @save="handleProfileUpdate"
      @open-avatar-upload="openAvatarFromEdit"
    />

    <PasswordChangeForm 
      v-if="showPasswordForm"
      @close="showPasswordForm = false"
      @save="handlePasswordChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Layout
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// State
const showAvatarUpload = ref(false)
const showEditForm = ref(false)
const showPasswordForm = ref(false)

// Mock user data (replace with actual API call)
const user = reactive({
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+62 812-3456-7890',
  birthDate: '1990-01-15',
  address: 'Jl. Contoh No. 123, RT 001/RW 002',
  avatar: null,
  role: 'ADMIN',
  createdAt: '2023-01-01',
  lastLogin: '2024-01-15T10:30:00Z',
  loginCount: 45
})

// Mock recent activities
const recentActivities = ref([
  {
    id: 1,
    description: 'Login ke sistem',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    description: 'Mengupdate profil',
    createdAt: '2024-01-14T15:20:00Z'
  },
  {
    id: 3,
    description: 'Mengubah password',
    createdAt: '2024-01-13T09:15:00Z'
  }
])

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleAvatarUpload = (avatarData: any) => {
  user.avatar = avatarData.url
  showAvatarUpload.value = false
  console.log('Avatar uploaded:', avatarData)
}

const closeAvatarUpload = () => {
  showAvatarUpload.value = false
}

const handleProfileUpdate = (profileData: any) => {
  Object.assign(user, profileData)
  showEditForm.value = false
  console.log('Profile updated:', profileData)
}

const openAvatarFromEdit = () => {
  showEditForm.value = false
  showAvatarUpload.value = true
}

const handlePasswordChange = (passwordData: any) => {
  showPasswordForm.value = false
  console.log('Password changed successfully')
}

onMounted(() => {
  // TODO: Fetch user data from API
  console.log('Profile page mounted')
})
</script>

<style scoped>
/* Custom styles if needed */
</style>