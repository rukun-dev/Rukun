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
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Registrasi Pengguna Baru</h2>
        <p class="mt-2 text-sm text-gray-600">Sistem Manajemen RT Digital</p>
      </div>

      <!-- Register Form -->
      <Card class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleRegister" class="space-y-6">
            <div>
              <Label for="name" class="text-sm font-medium text-gray-700">Nama Lengkap</Label>
              <Input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                required
                class="mt-1"
                :class="{ 'border-red-500': errors.name }"
                placeholder="Masukkan nama lengkap"
              />
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

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
                placeholder="Masukkan email"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <div>
              <Label for="phone" class="text-sm font-medium text-gray-700">Nomor Telepon</Label>
              <Input
                id="phone"
                v-model="form.phone"
                type="tel"
                autocomplete="tel"
                class="mt-1"
                :class="{ 'border-red-500': errors.phone }"
                placeholder="Masukkan nomor telepon (opsional)"
              />
              <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
            </div>



            <div>
              <Label for="password" class="text-sm font-medium text-gray-700">Password</Label>
              <div class="relative mt-1">
                <Input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  :class="{ 'border-red-500': errors.password }"
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
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
              
              <!-- Password Strength Indicator -->
              <div v-if="form.password" class="mt-3 space-y-2">
                <div class="text-sm font-medium text-gray-700">Kekuatan Password:</div>
                <div class="space-y-1">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="passwordStrength.minLength ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <span class="text-xs" :class="passwordStrength.minLength ? 'text-green-600' : 'text-gray-500'">Minimal 6 karakter</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="passwordStrength.hasLowercase ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <span class="text-xs" :class="passwordStrength.hasLowercase ? 'text-green-600' : 'text-gray-500'">Mengandung huruf kecil</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="passwordStrength.hasUppercase ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <span class="text-xs" :class="passwordStrength.hasUppercase ? 'text-green-600' : 'text-gray-500'">Mengandung huruf besar</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <span class="text-xs" :class="passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'">Mengandung angka</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full" :class="passwordStrength.hasSpecialChar ? 'bg-green-500' : 'bg-gray-300'"></div>
                    <span class="text-xs" :class="passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-gray-500'">Mengandung karakter khusus</span>
                  </div>
                </div>
                
                <!-- Overall Strength Bar -->
                <div class="mt-2">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-medium text-gray-700">Tingkat Kekuatan:</span>
                    <span class="text-xs font-medium" :class="getStrengthColor()">{{ getStrengthText() }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300" :class="getStrengthBarColor()" :style="{ width: getStrengthPercentage() + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label for="confirmPassword" class="text-sm font-medium text-gray-700">Konfirmasi Password</Label>
              <div class="relative mt-1">
                <Input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  :class="{ 'border-red-500': errors.confirmPassword }"
                  placeholder="Konfirmasi password"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                  </svg>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>

            <div>
              <Button
                type="submit"
                :disabled="loading"
                class="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Memproses...' : 'Daftar' }}
              </Button>
            </div>

            <div v-if="errors.general" class="text-center">
              <p class="text-sm text-red-600">{{ errors.general }}</p>
            </div>

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
                    <p class="text-xs text-green-600 mt-1">Anda akan diarahkan ke halaman login dalam beberapa detik...</p>
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
          Sudah punya akun?
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Masuk di sini
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

// Meta
definePageMeta({
  layout: false,
  middleware: 'auth'
})

useSeoMeta({
  title: 'Register - RT Management System',
  description: 'Registrasi pengguna baru untuk sistem manajemen RT'
})

// Get runtime config for base URL
const config = useRuntimeConfig()
const baseUrl = config.public.baseUrl || 'http://localhost:3000'

// Reactive data
const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'WARGA' // Default role sesuai API
})

const errors = reactive<{
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  general: string
}>({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

// Password strength calculation
const passwordStrength = computed(() => {
  const password = form.password
  return {
    minLength: password.length >= 6,
    hasLowercase: /[a-z]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
})

// Get strength percentage
const getStrengthPercentage = () => {
  const criteria = passwordStrength.value
  const metCriteria = Object.values(criteria).filter(Boolean).length
  return (metCriteria / 5) * 100
}

// Get strength text
const getStrengthText = () => {
  const percentage = getStrengthPercentage()
  if (percentage === 100) return 'Sangat Kuat'
  if (percentage >= 80) return 'Kuat'
  if (percentage >= 60) return 'Sedang'
  if (percentage >= 40) return 'Lemah'
  return 'Sangat Lemah'
}

// Get strength color
const getStrengthColor = () => {
  const percentage = getStrengthPercentage()
  if (percentage === 100) return 'text-green-600'
  if (percentage >= 80) return 'text-green-500'
  if (percentage >= 60) return 'text-yellow-500'
  if (percentage >= 40) return 'text-orange-500'
  return 'text-red-500'
}

// Get strength bar color
const getStrengthBarColor = () => {
  const percentage = getStrengthPercentage()
  if (percentage === 100) return 'bg-green-600'
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  if (percentage >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

// Validation
const validateForm = () => {
  // Reset errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Nama lengkap wajib diisi'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nama minimal 2 karakter'
    isValid = false
  }

  // Email validation
  if (!form.email) {
    errors.email = 'Email wajib diisi'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  // Phone validation (optional but if provided, must be valid)
  if (form.phone && !/^[0-9+\-\s()]+$/.test(form.phone)) {
    errors.phone = 'Format nomor telepon tidak valid'
    isValid = false
  }



  // Password validation
  if (!form.password) {
    errors.password = 'Password wajib diisi'
    isValid = false
  } else {
    const strength = passwordStrength.value
    if (!strength.minLength) {
      errors.password = 'Password minimal 6 karakter'
      isValid = false
    } else if (!strength.hasLowercase) {
      errors.password = 'Password harus mengandung huruf kecil'
      isValid = false
    } else if (!strength.hasUppercase) {
      errors.password = 'Password harus mengandung huruf besar'
      isValid = false
    } else if (!strength.hasNumber) {
      errors.password = 'Password harus mengandung angka'
      isValid = false
    } else if (!strength.hasSpecialChar) {
      errors.password = 'Password harus mengandung karakter khusus'
      isValid = false
    }
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Password tidak cocok'
    isValid = false
  }

  return isValid
}

// Handle register
const handleRegister = async () => {
  if (!validateForm()) return

  loading.value = true
  successMessage.value = ''

  try {
    // Prepare request body sesuai dengan API schema dari postman collection
    const requestBody = {
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone || null, // Optional field
      role: form.role
    }

    console.log('Sending registration request:', requestBody)

    // Call API endpoint sesuai dengan collection
    const response = await $fetch(`/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    })
    
    console.log('Registration response:', response)

    // Handle successful response berdasarkan struktur response dari collection
    if (response.success) {
      successMessage.value = response.message || 'Registrasi berhasil! Anda dapat login dengan kredensial yang telah dibuat.'
      
      // Reset form
      Object.keys(form).forEach(key => {
        if (key === 'role') {
          form[key as keyof typeof form] = 'WARGA' // Reset to default
        } else {
          form[key as keyof typeof form] = ''
        }
      })

      // Redirect to login after successful registration (optional)
      setTimeout(() => {
        navigateTo('/login')
      }, 3000) // Redirect after 3 seconds
    } else {
      // Handle error case
      errors.general = response.message || 'Terjadi kesalahan saat registrasi'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    
    // Handle different types of errors
    if (error.status === 409) {
      // Conflict error - email already registered
      errors.email = 'Email sudah terdaftar'
    } else if (error.status === 400) {
      // Bad request - validation errors
      if (error.data?.message) {
        errors.general = error.data.message
      } else {
        errors.general = 'Data yang dimasukkan tidak valid'
      }
    } else if (error.status === 422) {
      // Unprocessable entity - validation errors
      if (error.data?.errors) {
        Object.entries(error.data.errors).forEach(([key, message]) => {
          if (key in errors) {
            errors[key as keyof typeof errors] = Array.isArray(message) ? message[0] : message
          }
        })
      }
    } else {
      // Generic error
      errors.general = error.data?.message || 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'
    }
  } finally {
    loading.value = false
  }
}
</script>