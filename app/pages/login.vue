<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Masuk ke Akun Anda</h2>
        <p class="mt-2 text-sm text-gray-600">Sistem Manajemen RT Digital</p>
      </div>

      <!-- Login Form -->
      <Card class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <Label for="email" class="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="mt-1"
                :class="{ 'border-red-500': errors.email }"
                placeholder="Masukkan email Anda"
                :disabled="loading"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <Label for="password" class="text-sm font-medium text-gray-700">Password</Label>
              <div class="relative mt-1">
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  :class="{ 'border-red-500': errors.password }"
                  placeholder="Masukkan password Anda"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                  :disabled="loading"
                >
                  <svg v-if="!showPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                </button>
              </div>
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="form.rememberMe"
                  name="remember-me"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  :disabled="loading"
                />
                <Label for="remember-me" class="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </Label>
              </div>

              <div class="text-sm">
                <NuxtLink to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
                  Lupa password?
                </NuxtLink>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                :disabled="loading"
                class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Memproses...' : 'Masuk' }}
              </Button>
            </div>

            <!-- Error Messages -->
            <div v-if="errors.general" class="text-center">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{{ errors.general }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="text-center">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-green-800">{{ successMessage }}</p>
                    <p class="text-xs text-green-600 mt-1">Mengarahkan ke dashboard...</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>



      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Belum punya akun?
          <NuxtLink to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Daftar di sini
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Types
interface UserSession {
  expires_at: string
}

interface UserProfile {
  id: string
  nik: string | null
  address: string | null
}

interface UserInfo {
  id: string
  name: string
  email: string
  phone: string
  role: string
  avatar: string | null
  avatarPublicId: string | null
  profile: UserProfile
  session: UserSession
  links?: {
    related?: {
      profile?: string
      dashboard?: string
      logout?: string
    }
  }
}

interface LoginResponse {
  success: boolean
  status_code: number
  message: string
  data: {
    user: UserInfo
  } | null
  error: any
  meta: {
    timestamp: string
    request_id: string
    version: string
    execution_time: string
    ip_address: string
  }
  pagination: null
  next_step: {
    action: string
    endpoint: string
    method: string
    required: string[]
  }
  links: {
    self: string
    related: {
      profile: string
      dashboard: string
      logout: string
    }
  }
}

// Meta
definePageMeta({
  layout: false,
  middleware: 'auth'
})

useSeoMeta({
  title: 'Login - RT Management System',
  description: 'Masuk ke sistem manajemen RT digital'
})

// Reactive data
const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive<{
  email: string
  password: string
  general: string
}>({
  email: '',
  password: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)
const successMessage = ref('')

// Validation
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Email validation
  if (!form.email) {
    errors.email = 'Email wajib diisi'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password wajib diisi'
    isValid = false
  }

  return isValid
}



// Use auth composable
const { login } = useAuth()

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true
  successMessage.value = ''

  try {
    console.log('Attempting login with:', { email: form.email })

    // Use the login function from useAuth composable
    const result = await login(form.email, form.password)
    
    if (result.success) {
      successMessage.value = 'Login berhasil!'
      
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 1500)
    } else {
      errors.general = result.message || 'Login gagal'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    errors.general = 'Terjadi kesalahan saat login. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
