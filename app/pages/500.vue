<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="max-w-2xl w-full text-center">
      <!-- Server Error Illustration -->
      <div class="mb-8">
        <div class="mx-auto w-80 h-80 relative">
          <svg viewBox="0 0 400 400" class="w-full h-full">
            <!-- Background circle -->
            <circle cx="200" cy="200" r="180" fill="#fef2f2" opacity="0.8"/>
            
            <!-- Server rack -->
            <rect x="150" y="120" width="100" height="160" rx="8" fill="#374151" stroke="#6b7280" stroke-width="2"/>
            
            <!-- Server units -->
            <rect x="160" y="135" width="80" height="20" rx="2" fill="#ef4444"/>
            <rect x="160" y="165" width="80" height="20" rx="2" fill="#f59e0b"/>
            <rect x="160" y="195" width="80" height="20" rx="2" fill="#ef4444"/>
            <rect x="160" y="225" width="80" height="20" rx="2" fill="#6b7280"/>
            <rect x="160" y="255" width="80" height="20" rx="2" fill="#ef4444"/>
            
            <!-- Server lights -->
            <circle cx="170" cy="145" r="3" fill="#dc2626" class="animate-pulse"/>
            <circle cx="180" cy="145" r="3" fill="#dc2626" class="animate-pulse"/>
            <circle cx="170" cy="175" r="3" fill="#f59e0b"/>
            <circle cx="180" cy="175" r="3" fill="#10b981"/>
            <circle cx="170" cy="205" r="3" fill="#dc2626" class="animate-pulse"/>
            <circle cx="180" cy="205" r="3" fill="#dc2626" class="animate-pulse"/>
            <circle cx="170" cy="265" r="3" fill="#dc2626" class="animate-pulse"/>
            <circle cx="180" cy="265" r="3" fill="#dc2626" class="animate-pulse"/>
            
            <!-- Error sparks/lightning -->
            <path d="M120 100 L140 120 L130 130 L150 150" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round" class="animate-pulse"/>
            <path d="M280 110 L260 130 L270 140 L250 160" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round" class="animate-pulse"/>
            
            <!-- Warning signs -->
            <polygon points="100,80 110,100 90,100" fill="#f59e0b"/>
            <text x="100" y="96" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <polygon points="320,90 330,110 310,110" fill="#f59e0b"/>
            <text x="320" y="106" text-anchor="middle" class="fill-white text-xs font-bold">!</text>
            
            <!-- Smoke/steam -->
            <ellipse cx="200" cy="100" rx="15" ry="8" fill="#9ca3af" opacity="0.6" class="animate-pulse"/>
            <ellipse cx="190" cy="85" rx="10" ry="6" fill="#9ca3af" opacity="0.4" class="animate-pulse"/>
            <ellipse cx="210" cy="85" rx="8" ry="5" fill="#9ca3af" opacity="0.3" class="animate-pulse"/>
            
            <!-- 500 Text -->
            <text x="200" y="350" text-anchor="middle" class="fill-red-600 text-5xl font-bold" font-family="Arial, sans-serif">500</text>
          </svg>
        </div>
      </div>

      <!-- Error Content -->
      <div class="space-y-8">
        <!-- Main Error Message -->
        <div>
          <h1 class="text-4xl font-bold text-gray-900 mb-4">
            Oops! Terjadi Kesalahan Server
          </h1>
          <p class="text-xl text-gray-600 mb-6">
            Server kami sedang mengalami masalah teknis. Tim teknis kami telah diberitahu dan sedang menangani masalah ini.
          </p>
        </div>

        <!-- Error Details -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-left max-w-lg mx-auto">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-red-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-red-800 mb-2">Apa yang terjadi?</h3>
              <ul class="text-sm text-red-700 space-y-1">
                <li>• Server mengalami overload atau crash</li>
                <li>• Database tidak dapat diakses</li>
                <li>• Terjadi error pada aplikasi</li>
                <li>• Masalah konfigurasi server</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- What to do -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-left max-w-lg mx-auto">
          <div class="flex items-start">
            <svg class="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-lg font-semibold text-blue-800 mb-2">Apa yang bisa Anda lakukan?</h3>
              <ul class="text-sm text-blue-700 space-y-1">
                <li>• Tunggu beberapa menit dan coba lagi</li>
                <li>• Refresh halaman ini</li>
                <li>• Periksa koneksi internet Anda</li>
                <li>• Hubungi tim support jika masalah berlanjut</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Status Information -->
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Status Server</h3>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-sm font-medium text-red-600">Bermasalah</span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-red-500 font-semibold">API Server</div>
              <div class="text-red-600">Offline</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-yellow-500 font-semibold">Database</div>
              <div class="text-yellow-600">Lambat</div>
            </div>
            <div class="text-center p-3 bg-white rounded-lg border">
              <div class="text-green-500 font-semibold">CDN</div>
              <div class="text-green-600">Normal</div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="refreshPage"
            class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Coba Lagi
          </button>
          
          <button
            @click="goHome"
            class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Beranda
          </button>
          
          <button
            @click="reportError"
            class="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Hubungi Support
          </button>
        </div>

        <!-- Additional Help -->
        <div class="pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">Masih butuh bantuan?</p>
          <div class="flex flex-wrap justify-center gap-6 text-sm">
            <a 
              href="mailto:support@rukun.com" 
              class="text-red-600 hover:text-red-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Support
            </a>
            <a 
              href="tel:+6281234567890" 
              class="text-red-600 hover:text-red-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Telepon
            </a>
            <NuxtLink 
              to="/status" 
              class="text-red-600 hover:text-red-800 hover:underline transition-colors flex items-center"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
              Status Page
            </NuxtLink>
          </div>
        </div>

        <!-- Error ID for support -->
        <div class="text-xs text-gray-400 font-mono">
          Error ID: {{ errorId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Generate unique error ID for tracking
const errorId = ref('')

// Methods
const refreshPage = () => {
  window.location.reload()
}

const goHome = () => {
  navigateTo('/')
}

const reportError = () => {
  // TODO: Implement error reporting to support system
  const errorData = {
    errorId: errorId.value,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    type: 'server_error_500'
  }
  
  console.log('Server error reported:', errorData)
  
  // You could send this to an error tracking service
  alert('Laporan error telah dikirim ke tim support. Kami akan segera menangani masalah ini.')
}

const generateErrorId = () => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `ERR-${timestamp}-${random}`.toUpperCase()
}

// Generate error ID on mount
onMounted(() => {
  errorId.value = generateErrorId()
})

// Set page meta
useHead({
  title: 'Server Error 500 - Rukun',
  meta: [
    {
      name: 'description',
      content: 'Terjadi kesalahan server. Tim teknis sedang menangani masalah ini.'
    }
  ]
})
</script>

<style scoped>
/* Animation for pulsing elements */
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .text-4xl {
    font-size: 2rem;
  }
  
  .text-5xl {
    font-size: 2.5rem;
  }
}
</style>