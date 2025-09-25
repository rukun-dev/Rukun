<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 via-white to-red-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full text-center">
      <!-- Access Denied Illustration -->
      <div class="mb-8">
        <div class="mx-auto w-80 h-80 relative">
          <svg viewBox="0 0 400 400" class="w-full h-full">
            <!-- Background circle -->
            <circle cx="200" cy="200" r="180" fill="#fef3c7" opacity="0.8"/>
            
            <!-- Shield with lock -->
            <path d="M200 80 L160 100 L160 180 Q160 220 200 240 Q240 220 240 180 L240 100 Z" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
            
            <!-- Lock body -->
            <rect x="180" y="160" width="40" height="50" rx="5" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
            
            <!-- Lock shackle -->
            <path d="M185 160 Q185 140 200 140 Q215 140 215 160" fill="none" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
            
            <!-- Keyhole -->
            <circle cx="200" cy="180" r="4" fill="#92400e"/>
            <rect x="198" y="180" width="4" height="12" fill="#92400e"/>
            
            <!-- Warning signs around shield -->
            <polygon points="120,120 130,140 110,140" fill="#f59e0b"/>
            <text x="120" y="136" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <polygon points="300,130 310,150 290,150" fill="#f59e0b"/>
            <text x="300" y="146" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <polygon points="100,250 110,270 90,270" fill="#f59e0b"/>
            <text x="100" y="266" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <polygon points="320,260 330,280 310,280" fill="#f59e0b"/>
            <text x="320" y="276" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <!-- Prohibition sign overlay -->
            <circle cx="200" cy="200" r="90" fill="none" stroke="#dc2626" stroke-width="8" opacity="0.8"/>
            <line x1="150" y1="150" x2="250" y2="250" stroke="#dc2626" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
            
            <!-- Access denied text -->
            <text x="200" y="340" text-anchor="middle" class="fill-red-600 text-3xl font-bold" font-family="Arial, sans-serif">ACCESS DENIED</text>
          </svg>
        </div>
      </div>

      <!-- Error Content -->
      <div class="space-y-8">
        <!-- Main Error Message -->
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            Maaf, Anda tidak memiliki izin untuk mengakses halaman atau resource ini.
          </p>
        </div>

        <!-- Reason Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <!-- Authentication Required -->
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-left">
            <div class="flex items-start">
              <svg class="w-8 h-8 text-amber-500 mt-1 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-amber-800 mb-2">Login Diperlukan</h3>
                <p class="text-sm text-amber-700 mb-3">
                  Halaman ini memerlukan autentikasi. Silakan login terlebih dahulu untuk mengakses konten ini.
                </p>
                <button
                  @click="goToLogin"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login Sekarang
                </button>
              </div>
            </div>
          </div>

          <!-- Insufficient Permissions -->
          <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-left">
            <div class="flex items-start">
              <svg class="w-8 h-8 text-red-500 mt-1 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18 21l-2.636-2.636M6 6l12 12" />
              </svg>
              <div>
                <h3 class="text-lg font-semibold text-red-800 mb-2">Izin Tidak Mencukupi</h3>
                <p class="text-sm text-red-700 mb-3">
                  Akun Anda tidak memiliki level akses yang diperlukan untuk melihat halaman ini.
                </p>
                <button
                  @click="requestAccess"
                  class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-800 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Minta Akses
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- User Status (if logged in) -->
        <div v-if="user" class="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <div class="text-left">
              <h3 class="text-lg font-semibold text-blue-800 mb-2">Status Akun Anda</h3>
              <div class="text-sm text-blue-700 space-y-1">
                <p><strong>Email:</strong> {{ user?.email }}</p>
                <p><strong>Role:</strong> {{ user?.role || 'User' }}</p>
                <p><strong>Status:</strong> 
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        :class="user?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ user?.isActive ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Common Reasons -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6 text-left max-w-2xl mx-auto">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 text-center">Kemungkinan Penyebab</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div class="space-y-2">
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Belum login ke sistem</span>
              </div>
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Sesi login telah berakhir</span>
              </div>
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Akun tidak memiliki role yang sesuai</span>
              </div>
            </div>
            <div class="space-y-2">
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Akun sedang dinonaktifkan</span>
              </div>
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>Mencoba mengakses fitur premium</span>
              </div>
              <div class="flex items-start">
                <span class="text-red-500 mr-2">•</span>
                <span>URL yang diakses salah</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            v-if="!user"
            @click="goToLogin"
            class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login
          </button>
          
          <button
            @click="goHome"
            class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </button>
          
          <button
            @click="goBack"
            class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
        </div>

        <!-- Help Section -->
        <div class="pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">Butuh bantuan?</p>
          <div class="flex flex-wrap justify-center gap-6 text-sm">
            <NuxtLink 
              to="/help/permissions" 
              class="text-amber-600 hover:text-amber-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Panduan Izin Akses
            </NuxtLink>
            <a 
              href="mailto:support@rukun.com" 
              class="text-amber-600 hover:text-amber-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Hubungi Admin
            </a>
            <NuxtLink 
              to="/contact" 
              class="text-amber-600 hover:text-amber-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
              </svg>
              Live Chat
            </NuxtLink>
          </div>
        </div>

        <!-- Request ID for tracking -->
        <div class="text-xs text-gray-400 font-mono">
          Request ID: {{ requestId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Types
interface User {
  email: string
  role: string
  isActive: boolean
}

// Mock user data - replace with actual auth state
const user = ref<User | null>(null)
const requestId = ref('')

// Methods
const goToLogin = () => {
  // Store current URL for redirect after login
  const currentUrl = window.location.pathname + window.location.search
  navigateTo(`/login?redirect=${encodeURIComponent(currentUrl)}`)
}

const goHome = () => {
  navigateTo('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

const requestAccess = () => {
  // TODO: Implement access request functionality
  const accessRequest = {
    requestId: requestId.value,
    url: window.location.href,
    userEmail: user.value?.email || 'anonymous',
    timestamp: new Date().toISOString(),
    reason: 'User requested access to restricted resource'
  }
  
  console.log('Access request submitted:', accessRequest)
  
  // You could send this to an admin notification system
  alert('Permintaan akses telah dikirim ke administrator. Anda akan dihubungi melalui email.')
}

const generateRequestId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `REQ-${timestamp}-${random}`.toUpperCase()
}

// Check user authentication status
const checkAuthStatus = async () => {
  try {
    // TODO: Replace with actual auth check
    // const response = await $fetch('/api/auth/me')
    // user.value = response.user
    
    // Mock user for demonstration
    const isLoggedIn = false // Replace with actual auth check
    if (isLoggedIn) {
      user.value = {
        email: 'user@example.com',
        role: 'User',
        isActive: true
      }
    }
  } catch (error) {
    console.log('User not authenticated')
    user.value = null
  }
}

// Generate request ID and check auth on mount
onMounted(async () => {
  requestId.value = generateRequestId()
  await checkAuthStatus()
})

// Set page meta
useHead({
  title: 'Akses Ditolak - Rukun',
  meta: [
    {
      name: 'description',
      content: 'Anda tidak memiliki izin untuk mengakses halaman ini.'
    }
  ]
})
</script>

<style scoped>
/* Responsive adjustments */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2rem;
  }
  
  .text-3xl {
    font-size: 1.5rem;
  }
}
</style>