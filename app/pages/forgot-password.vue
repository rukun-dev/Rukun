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
        <h2 class="mt-6 text-3xl font-bold text-gray-900">Lupa Password?</h2>
        <p class="mt-2 text-sm text-gray-600">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password
        </p>
      </div>

      <!-- Success State -->
      <div v-if="emailSent" class="text-center">
        <Card>
          <CardContent class="p-6">
            <div class="flex justify-center mb-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Email Terkirim!</h3>
            <p class="text-sm text-gray-600 mb-4">
              Kami telah mengirimkan link reset password ke <strong>{{ form.email }}</strong>.
              Silakan cek email Anda dan ikuti instruksi yang diberikan.
            </p>
            <p class="text-xs text-gray-500 mb-4">
              Tidak menerima email? Cek folder spam atau tunggu beberapa menit.
            </p>
            <div class="space-y-3">
              <Button 
                @click="resendEmail" 
                :disabled="resendLoading || resendCooldown > 0"
                variant="outline" 
                class="w-full"
              >
                <svg v-if="resendLoading" class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ resendLoading ? 'Mengirim...' : resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang Email' }}
              </Button>
              <Button @click="goBack" variant="ghost" class="w-full">
                Kembali ke Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Form State -->
      <Card v-else class="mt-8">
        <CardContent class="p-6">
          <form @submit.prevent="handleForgotPassword" class="space-y-6">
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
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
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
                {{ loading ? 'Mengirim...' : 'Kirim Link Reset Password' }}
              </Button>
            </div>

            <div v-if="errors.general" class="text-center">
              <p class="text-sm text-red-600">{{ errors.general }}</p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div v-if="!emailSent" class="text-center">
        <p class="text-sm text-gray-600">
          Ingat password Anda?
          <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Kembali ke login
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Meta
definePageMeta({
  layout: false,
  auth: false
})

useSeoMeta({
  title: 'Lupa Password - RT Management System',
  description: 'Reset password untuk sistem manajemen RT digital'
})

// Reactive data
const form = reactive({
  email: ''
})

const errors = reactive({
  email: '',
  general: ''
})

const loading = ref(false)
const emailSent = ref(false)
const resendLoading = ref(false)
const resendCooldown = ref(0)
let cooldownInterval: NodeJS.Timeout | null = null

// Validation
const validateForm = () => {
  // Reset errors
  errors.email = ''
  errors.general = ''

  let isValid = true

  // Email validation
  if (!form.email) {
    errors.email = 'Email wajib diisi'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  return isValid
}

// Start cooldown timer
const startCooldown = () => {
  resendCooldown.value = 60 // 60 seconds cooldown
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval!)
      cooldownInterval = null
    }
  }, 1000)
}

// Handle forgot password
const handleForgotPassword = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Implement actual forgot password logic with fetch API
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: form.email }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      emailSent.value = true
      startCooldown()
    } else {
      errors.general = data.message || 'Terjadi kesalahan. Silakan coba lagi.'
    }
  } catch (error) {
    console.error('Error sending forgot password request:', error)
    errors.general = 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

// Resend email
const resendEmail = async () => {
  if (resendCooldown.value > 0) return

  resendLoading.value = true

  try {
    // Implement actual resend email logic with fetch API
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: form.email,
        resend: true 
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      startCooldown()
    } else {
      errors.general = data.message || 'Gagal mengirim ulang email. Silakan coba lagi.'
    }
  } catch (error) {
    console.error('Error resending email:', error)
    errors.general = 'Gagal mengirim ulang email. Silakan coba lagi.'
  } finally {
    resendLoading.value = false
  }
}

// Go back to login
const goBack = () => {
  navigateTo('/login')
}

// Cleanup on unmount
onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>