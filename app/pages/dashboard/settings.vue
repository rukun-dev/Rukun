<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p class="text-gray-600">Kelola pengaturan akun dan preferensi Anda</p>
      </div>
    </div>

    <!-- Account Settings -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Akun</h2>
        <p class="text-sm text-gray-600">Kelola informasi akun dan preferensi Anda</p>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Profile Settings -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Profil</h3>
            <p class="text-sm text-gray-500">Ubah foto profil, nama, dan informasi pribadi</p>
          </div>
          <NuxtLink 
            to="/dashboard/profile"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profil
          </NuxtLink>
        </div>

        <!-- Email Settings -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Email</h3>
            <p class="text-sm text-gray-500">{{ userSettings.email }}</p>
          </div>
          <button
            @click="showEmailChange = true"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ubah Email
          </button>
        </div>

        <!-- Password Settings -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Password</h3>
            <p class="text-sm text-gray-500">Terakhir diubah {{ lastPasswordChange }}</p>
          </div>
          <button
            @click="showPasswordChange = true"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ubah Password
          </button>
        </div>
      </div>
    </div>

    <!-- Privacy & Security -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Privasi & Keamanan</h2>
        <p class="text-sm text-gray-600">Kontrol siapa yang dapat melihat informasi Anda</p>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Two Factor Authentication -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Autentikasi Dua Faktor</h3>
            <p class="text-sm text-gray-500">Tambahkan lapisan keamanan ekstra untuk akun Anda</p>
          </div>
          <div class="flex items-center">
            <span class="text-sm text-gray-500 mr-3">
              {{ userSettings.twoFactorEnabled ? 'Aktif' : 'Nonaktif' }}
            </span>
            <button
              @click="toggleTwoFactor"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                userSettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              ]"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  userSettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Profile Visibility -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Visibilitas Profil</h3>
            <p class="text-sm text-gray-500">Kontrol siapa yang dapat melihat profil Anda</p>
          </div>
          <select
            v-model="userSettings.profileVisibility"
            @change="updateProfileVisibility"
            class="block w-32 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="public">Publik</option>
            <option value="friends">Teman</option>
            <option value="private">Privat</option>
          </select>
        </div>

        <!-- Activity Status -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Status Aktivitas</h3>
            <p class="text-sm text-gray-500">Tampilkan kapan Anda terakhir online</p>
          </div>
          <button
            @click="toggleActivityStatus"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              userSettings.showActivityStatus ? 'bg-blue-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                userSettings.showActivityStatus ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Notifikasi</h2>
        <p class="text-sm text-gray-600">Pilih notifikasi yang ingin Anda terima</p>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Email Notifications -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Notifikasi Email</h3>
            <p class="text-sm text-gray-500">Terima notifikasi melalui email</p>
          </div>
          <button
            @click="toggleEmailNotifications"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              userSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                userSettings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
        </div>

        <!-- Push Notifications -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Notifikasi Push</h3>
            <p class="text-sm text-gray-500">Terima notifikasi push di browser</p>
          </div>
          <button
            @click="togglePushNotifications"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              userSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                userSettings.pushNotifications ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
        </div>

        <!-- Marketing Emails -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Email Marketing</h3>
            <p class="text-sm text-gray-500">Terima email tentang fitur baru dan penawaran</p>
          </div>
          <button
            @click="toggleMarketingEmails"
            :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              userSettings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
            ]"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                userSettings.marketingEmails ? 'translate-x-5' : 'translate-x-0'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Account Management -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Manajemen Akun</h2>
        <p class="text-sm text-gray-600">Opsi untuk mengelola atau menghapus akun Anda</p>
      </div>
      
      <div class="p-6 space-y-6">
        <!-- Deactivate Account -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Nonaktifkan Akun</h3>
            <p class="text-sm text-gray-500">Nonaktifkan akun Anda sementara</p>
          </div>
          <button
            @click="showDeactivateConfirm = true"
            class="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Nonaktifkan
          </button>
        </div>

        <!-- Delete Account -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-gray-900">Hapus Akun</h3>
            <p class="text-sm text-gray-500">Hapus akun Anda secara permanen</p>
          </div>
          <button
            @click="showDeleteConfirm = true"
            class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Hapus Akun
          </button>
        </div>
      </div>
    </div>

    <!-- Email Change Modal -->
    <div v-if="showEmailChange" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showEmailChange = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <div class="bg-white px-6 py-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Ubah Email</h3>
            <form @submit.prevent="updateEmail" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Email Baru</label>
                <input
                  v-model="newEmail"
                  type="email"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
                <input
                  v-model="passwordConfirm"
                  type="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="showEmailChange = false"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Ubah Email
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Password Change Form -->
    <PasswordChangeForm 
      v-if="showPasswordChange"
      @close="closePasswordForm"
      @save="handlePasswordChange"
    />

    <!-- Confirmation Modals -->
    <div v-if="showDeactivateConfirm" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showDeactivateConfirm = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <div class="bg-white px-6 py-5">
            <div class="flex items-center">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Nonaktifkan Akun</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Apakah Anda yakin ingin menonaktifkan akun Anda? Anda dapat mengaktifkannya kembali kapan saja.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                @click="deactivateAccount"
                class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Nonaktifkan
              </button>
              <button
                @click="showDeactivateConfirm = false"
                class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-black/50 transition-opacity" @click="showDeleteConfirm = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
          <div class="bg-white px-6 py-5">
            <div class="flex items-center">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Hapus Akun</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan dan semua data Anda akan hilang permanen.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                @click="deleteAccount"
                class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Hapus Permanen
              </button>
              <button
                @click="showDeleteConfirm = false"
                class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PasswordChangeForm from '../../components/dashboard/PasswordChangeForm.vue'

// Meta
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Pengaturan - RT Management System',
  description: 'Pengaturan akun dan preferensi sistem'
})

// Reactive state
const showEmailChange = ref(false)
const showPasswordChange = ref(false)
const showDeactivateConfirm = ref(false)
const showDeleteConfirm = ref(false)

// Form data
const newEmail = ref('')
const passwordConfirm = ref('')

// User settings (mock data)
const userSettings = ref({
  email: 'user@example.com',
  twoFactorEnabled: false,
  profileVisibility: 'public',
  showActivityStatus: true,
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false
})

// Computed
const lastPasswordChange = computed(() => {
  // Mock data - in real app, this would come from API
  return '3 bulan yang lalu'
})

// Methods
const updateEmail = async () => {
  try {
    // TODO: Implement API call
    console.log('Updating email to:', newEmail.value)
    userSettings.value.email = newEmail.value
    showEmailChange.value = false
    newEmail.value = ''
    passwordConfirm.value = ''
  } catch (error) {
    console.error('Failed to update email:', error)
  }
}

const closePasswordForm = () => {
  showPasswordChange.value = false
}

const handlePasswordChange = async (passwordData: { currentPassword: string; newPassword: string }) => {
  try {
    // TODO: Implement API call
    console.log('Updating password:', passwordData)
    showPasswordChange.value = false
  } catch (error) {
    console.error('Failed to update password:', error)
  }
}



const toggleTwoFactor = async () => {
  try {
    // TODO: Implement API call
    userSettings.value.twoFactorEnabled = !userSettings.value.twoFactorEnabled
    console.log('Two factor authentication:', userSettings.value.twoFactorEnabled ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle two factor:', error)
  }
}

const updateProfileVisibility = async () => {
  try {
    // TODO: Implement API call
    console.log('Profile visibility updated to:', userSettings.value.profileVisibility)
  } catch (error) {
    console.error('Failed to update profile visibility:', error)
  }
}

const toggleActivityStatus = async () => {
  try {
    // TODO: Implement API call
    userSettings.value.showActivityStatus = !userSettings.value.showActivityStatus
    console.log('Activity status:', userSettings.value.showActivityStatus ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle activity status:', error)
  }
}

const toggleEmailNotifications = async () => {
  try {
    // TODO: Implement API call
    userSettings.value.emailNotifications = !userSettings.value.emailNotifications
    console.log('Email notifications:', userSettings.value.emailNotifications ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle email notifications:', error)
  }
}

const togglePushNotifications = async () => {
  try {
    // TODO: Implement API call
    userSettings.value.pushNotifications = !userSettings.value.pushNotifications
    console.log('Push notifications:', userSettings.value.pushNotifications ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle push notifications:', error)
  }
}

const toggleMarketingEmails = async () => {
  try {
    // TODO: Implement API call
    userSettings.value.marketingEmails = !userSettings.value.marketingEmails
    console.log('Marketing emails:', userSettings.value.marketingEmails ? 'enabled' : 'disabled')
  } catch (error) {
    console.error('Failed to toggle marketing emails:', error)
  }
}

const deactivateAccount = async () => {
  try {
    // TODO: Implement API call
    console.log('Deactivating account')
    showDeactivateConfirm.value = false
    // Redirect to login or home page
  } catch (error) {
    console.error('Failed to deactivate account:', error)
  }
}

const deleteAccount = async () => {
  try {
    // TODO: Implement API call
    console.log('Deleting account')
    showDeleteConfirm.value = false
    // Redirect to home page
  } catch (error) {
    console.error('Failed to delete account:', error)
  }
}
</script>

<style scoped>
/* Custom toggle animations */
.toggle-transition {
  transition: all 0.2s ease-in-out;
}
</style>