<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-lg w-full text-center">
      <!-- Error Illustration -->
      <div class="mb-8">
        <div v-if="error.statusCode === 404" class="mx-auto w-64 h-64 relative">
          <!-- 404 SVG Illustration -->
          <svg viewBox="0 0 400 300" class="w-full h-full">
            <!-- Background elements -->
            <circle cx="200" cy="150" r="120" fill="#f3f4f6" opacity="0.5"/>
            
            <!-- 404 Text -->
            <text x="200" y="130" text-anchor="middle" class="fill-blue-600 text-6xl font-bold" font-family="Arial, sans-serif">404</text>
            
            <!-- Magnifying glass -->
            <circle cx="280" cy="100" r="25" fill="none" stroke="#6b7280" stroke-width="3"/>
            <line x1="300" y1="120" x2="320" y2="140" stroke="#6b7280" stroke-width="3" stroke-linecap="round"/>
            
            <!-- Question marks -->
            <text x="120" y="80" text-anchor="middle" class="fill-gray-400 text-2xl" font-family="Arial, sans-serif">?</text>
            <text x="320" y="200" text-anchor="middle" class="fill-gray-400 text-xl" font-family="Arial, sans-serif">?</text>
            
            <!-- Floating elements -->
            <circle cx="100" cy="120" r="3" class="fill-blue-300 animate-pulse"/>
            <circle cx="350" cy="180" r="2" class="fill-purple-300 animate-pulse"/>
            <circle cx="80" cy="200" r="2" class="fill-blue-300 animate-pulse"/>
          </svg>
        </div>
        
        <div v-else-if="error.statusCode === 500" class="mx-auto w-64 h-64 relative">
          <!-- 500 SVG Illustration -->
          <svg viewBox="0 0 400 300" class="w-full h-full">
            <!-- Background -->
            <circle cx="200" cy="150" r="120" fill="#fef2f2" opacity="0.8"/>
            
            <!-- 500 Text -->
            <text x="200" y="130" text-anchor="middle" class="fill-red-600 text-6xl font-bold" font-family="Arial, sans-serif">500</text>
            
            <!-- Server/gear icon -->
            <circle cx="200" cy="200" r="20" fill="none" stroke="#ef4444" stroke-width="2"/>
            <circle cx="200" cy="200" r="8" fill="#ef4444"/>
            
            <!-- Warning signs -->
            <polygon points="150,80 160,100 140,100" fill="#f59e0b"/>
            <text x="150" y="96" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <polygon points="280,180 290,200 270,200" fill="#f59e0b"/>
            <text x="280" y="196" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
          </svg>
        </div>
        
        <div v-else class="mx-auto w-64 h-64 relative">
          <!-- Generic Error SVG -->
          <svg viewBox="0 0 400 300" class="w-full h-full">
            <!-- Background -->
            <circle cx="200" cy="150" r="120" fill="#f9fafb" opacity="0.8"/>
            
            <!-- Error symbol -->
            <circle cx="200" cy="150" r="40" fill="none" stroke="#ef4444" stroke-width="4"/>
            <line x1="180" y1="130" x2="220" y2="170" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
            <line x1="220" y1="130" x2="180" y2="170" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <!-- Error Content -->
      <div class="space-y-6">
        <!-- Status Code -->
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            {{ getErrorTitle() }}
          </h1>
          <p class="text-lg text-gray-600">
            {{ getErrorMessage() }}
          </p>
        </div>

        <!-- Error Details (only in development) -->
        <div v-if="isDevelopment && error.message" class="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
          <h3 class="text-sm font-medium text-red-800 mb-2">Detail Error (Development Mode):</h3>
          <p class="text-sm text-red-700 font-mono">{{ error.message }}</p>
          <div v-if="error.stack" class="mt-2">
            <details class="text-xs">
              <summary class="cursor-pointer text-red-600 hover:text-red-800">Stack Trace</summary>
              <pre class="mt-2 text-red-600 whitespace-pre-wrap">{{ error.stack }}</pre>
            </details>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="goHome"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </button>
          
          <button
            @click="goBack"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          
          <button
            v-if="error.statusCode >= 500"
            @click="reportError"
            class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Laporkan Masalah
          </button>
        </div>

        <!-- Help Links -->
        <div class="pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">Butuh bantuan?</p>
          <div class="flex flex-wrap justify-center gap-4 text-sm">
            <NuxtLink 
              to="/help" 
              class="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Pusat Bantuan
            </NuxtLink>
            <NuxtLink 
              to="/contact" 
              class="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Hubungi Kami
            </NuxtLink>
            <NuxtLink 
              to="/faq" 
              class="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              FAQ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props from Nuxt error handling
interface ErrorProps {
  error: {
    statusCode: number
    statusMessage?: string
    message?: string
    stack?: string
    data?: any
  }
}

const props = defineProps<ErrorProps>()

// Environment check
const isDevelopment = process.dev

// Computed properties for error display
const getErrorTitle = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Halaman Tidak Ditemukan'
    case 403:
      return 'Akses Ditolak'
    case 500:
      return 'Terjadi Kesalahan Server'
    case 503:
      return 'Layanan Tidak Tersedia'
    default:
      return `Error ${props.error.statusCode}`
  }
}

const getErrorMessage = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Maaf, halaman yang Anda cari tidak dapat ditemukan. Mungkin halaman telah dipindahkan atau dihapus.'
    case 403:
      return 'Anda tidak memiliki izin untuk mengakses halaman ini. Silakan login dengan akun yang sesuai.'
    case 500:
      return 'Terjadi kesalahan pada server kami. Tim teknis sedang menangani masalah ini.'
    case 503:
      return 'Layanan sedang dalam pemeliharaan. Silakan coba lagi dalam beberapa saat.'
    default:
      return props.error.statusMessage || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'
  }
}

// Methods
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

const reportError = () => {
  // TODO: Implement error reporting
  const errorData = {
    statusCode: props.error.statusCode,
    message: props.error.message,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }
  
  console.log('Error reported:', errorData)
  
  // You could send this to an error tracking service like Sentry
  // or your own error reporting endpoint
  alert('Laporan error telah dikirim. Terima kasih!')
}

// Set page title based on error
useHead({
  title: computed(() => `${getErrorTitle()} - Rukun`),
  meta: [
    {
      name: 'description',
      content: computed(() => getErrorMessage())
    }
  ]
})
</script>

<style scoped>
/* Animation for floating elements */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Custom animations */
.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive text sizing */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2rem;
  }
  
  .text-6xl {
    font-size: 3rem;
  }
}
</style>