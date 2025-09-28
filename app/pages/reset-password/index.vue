<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Reset Password</h2>
        <p class="mt-2 text-sm text-gray-600">Masukkan password baru untuk akun Anda</p>
      </div>

      <!-- Invalid Token State -->
      <div v-if="tokenStatus === 'invalid'" class="text-center">
        <Card>
          <CardContent class="p-6">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Link Tidak Valid</h3>
            <p class="text-sm text-gray-600 mb-4">
              Link reset password tidak valid atau sudah kedaluwarsa. Silakan minta link reset password yang baru.
            </p>
            <Button 
              @click="goToForgotPassword" 
              class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Minta Link Baru
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Success State -->
      <div v-else-if="resetSuccess" class="text-center">
        <Card>
          <CardContent class="p-6">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Password Berhasil Direset!</h3>
            <p class="text-sm text-gray-600 mb-4">
              Password Anda telah berhasil diubah. Sekarang Anda dapat login dengan password baru.
            </p>
            <Button 
              @click="goToLogin" 
              class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              Login Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Reset Password Form -->
      <Card v-else class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleResetPassword" class="space-y-6">
              <!-- Password Field -->
              <div class="space-y-2">
                <Label for="password" class="text-sm font-medium text-gray-700">Password Baru</Label>
                <div class="relative">
                  <Input
                    id="password"
                    :type="showPassword ? 'text' : 'password'"
                    v-model="form.password"
                    placeholder="Masukkan password baru"
                    :class="{ 'border-red-500': errors.password }"
                    required
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg v-if="showPassword" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <svg v-else class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <p v-if="errors.password" class="text-sm text-red-600">{{ errors.password }}</p>
                
                <!-- Password Strength Indicator -->
                <div v-if="form.password" class="space-y-2">
                  <div class="flex space-x-1">
                    <div v-for="i in 4" :key="i" class="flex-1 h-2 rounded-full" :class="getPasswordStrengthColor(i)"></div>
                  </div>
                  <p class="text-xs" :class="getPasswordStrengthTextColor()">
                    Kekuatan Password: {{ getPasswordStrengthText() }}
                  </p>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div class="space-y-2">
                <Label for="confirmPassword" class="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    v-model="form.confirmPassword"
                    placeholder="Konfirmasi password baru"
                    :class="{ 'border-red-500': errors.confirmPassword }"
                    required
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg v-if="showConfirmPassword" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                    <svg v-else class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <p v-if="errors.confirmPassword" class="text-sm text-red-600">{{ errors.confirmPassword }}</p>
              </div>

              <!-- Password Requirements -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <p class="text-xs font-medium text-gray-700 mb-2">Password harus memenuhi:</p>
                <ul class="text-xs text-gray-600 space-y-1">
                  <li class="flex items-center">
                    <svg class="w-3 h-3 mr-2" :class="form.password.length >= 8 ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Minimal 8 karakter
                  </li>
                  <li class="flex items-center">
                    <svg class="w-3 h-3 mr-2" :class="/[A-Z]/.test(form.password) ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Huruf besar (A-Z)
                  </li>
                  <li class="flex items-center">
                    <svg class="w-3 h-3 mr-2" :class="/[a-z]/.test(form.password) ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Huruf kecil (a-z)
                  </li>
                  <li class="flex items-center">
                    <svg class="w-3 h-3 mr-2" :class="/\d/.test(form.password) ? 'text-green-500' : 'text-gray-400'" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    Angka (0-9)
                  </li>
                </ul>
              </div>

              <!-- General Error -->
              <p v-if="errors.general" class="text-sm text-red-600 text-center">{{ errors.general }}</p>

              <!-- Submit Button -->
              <Button 
                type="submit" 
                :disabled="loading" 
                class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Memproses...' : 'Reset Password' }}
              </Button>
            </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center">
        <button @click="goToLogin" class="text-sm text-blue-600 hover:text-blue-500 font-medium">
          Kembali ke Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Global loading
const { showLoading, hideLoading } = useGlobalLoading()

// Meta
definePageMeta({
  layout: false,
  auth: false
})

useSeoMeta({
  title: 'Reset Password - RT Management System',
  description: 'Reset password untuk sistem manajemen RT digital'
})

// Route params dari query string
const route = useRoute()
const token = route.query.token as string
const email = route.query.email as string

// Reactive data
const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const tokenStatus = ref<'loading' | 'valid' | 'invalid'>(token && email ? 'valid' : 'invalid')
const resetSuccess = ref(false)

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  
  return strength
})

const getPasswordStrengthColor = (index: number) => {
  if (passwordStrength.value >= index) {
    if (passwordStrength.value <= 1) return 'bg-red-500'
    if (passwordStrength.value <= 2) return 'bg-yellow-500'
    if (passwordStrength.value <= 3) return 'bg-orange-500'
    return 'bg-green-500'
  }
  return 'bg-gray-200'
}

const getPasswordStrengthText = () => {
  if (passwordStrength.value <= 1) return 'Lemah'
  if (passwordStrength.value <= 2) return 'Sedang'
  if (passwordStrength.value <= 3) return 'Kuat'
  return 'Sangat Kuat'
}

const getPasswordStrengthTextColor = () => {
  if (passwordStrength.value <= 1) return 'text-red-600'
  if (passwordStrength.value <= 2) return 'text-yellow-600'
  if (passwordStrength.value <= 3) return 'text-orange-600'
  return 'text-green-600'
}

// Validation
const validateForm = () => {
  // Reset errors
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''

  let isValid = true

  // Password validation
  if (!form.password) {
    errors.password = 'Password wajib diisi'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password minimal 8 karakter'
    isValid = false
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = 'Password harus mengandung huruf besar'
    isValid = false
  } else if (!/[a-z]/.test(form.password)) {
    errors.password = 'Password harus mengandung huruf kecil'
    isValid = false
  } else if (!/\d/.test(form.password)) {
    errors.password = 'Password harus mengandung angka'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok'
    isValid = false
  }

  return isValid
}

// Handle reset password
const handleResetPassword = async () => {
  if (!validateForm()) return

  loading.value = true
  showLoading('Mereset password...', 'Mohon tunggu sebentar')

  try {
    const response = await fetch(`/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        email,
        password: form.password
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      resetSuccess.value = true
    } else {
      // Check if it's a token-related error
      if (response.status === 401 && (data.error?.code === 'TOKEN_NOT_FOUND' || data.error?.code === 'TOKEN_EXPIRED' || data.error?.code === 'INVALID_TOKEN' || data.error?.code === 'MALFORMED_TOKEN')) {
        tokenStatus.value = 'invalid'
      } else {
        errors.general = data.message || 'Terjadi kesalahan saat reset password. Silakan coba lagi.'
      }
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    errors.general = 'Terjadi kesalahan saat reset password. Silakan coba lagi.'
  } finally {
    loading.value = false
    hideLoading()
  }
}

// Navigation functions
const goToLogin = () => {
  navigateTo('/login')
}

const goToForgotPassword = () => {
  navigateTo('/forgot-password')
}
</script>