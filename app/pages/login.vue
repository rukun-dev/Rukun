<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
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
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Checkbox id="remember" v-model="form.remember" />
                <Label for="remember" class="ml-2 text-sm text-gray-600">Ingat saya</Label>
              </div>
              <NuxtLink to="/forgot-password" class="text-sm text-orange-600 hover:text-orange-500">
                Lupa password?
              </NuxtLink>
            </div>

            <div>
              <Button
                type="submit"
                :disabled="loading"
                class="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Memproses...' : 'Masuk' }}
              </Button>
            </div>

            <div v-if="errors.general" class="text-center">
              <p class="text-sm text-red-600">{{ errors.general }}</p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Belum punya akun?
          <NuxtLink to="/register" class="font-medium text-orange-600 hover:text-orange-500">
            Registrasi
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
import { Checkbox } from '@/components/ui/checkbox'

// Meta
definePageMeta({
  layout: false,
  auth: false
})

useSeoMeta({
  title: 'Login - RT Management System',
  description: 'Masuk ke sistem manajemen RT digital'
})

// Reactive data
const form = reactive({
  email: '',
  password: '',
  remember: false
})

const errors = reactive({
  email: '',
  password: '',
  general: ''
})

const loading = ref(false)
const showPassword = ref(false)

// Validation
const validateForm = () => {
  // Reset errors
  errors.email = ''
  errors.password = ''
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

  // Password validation
  if (!form.password) {
    errors.password = 'Password wajib diisi'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password minimal 6 karakter'
    isValid = false
  }

  return isValid
}

// Handle login
const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    // Implement actual authentication logic with fetch API
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        remember: form.remember
      }),
    })
    
    const data = await response.json()
    
    if (response.ok) {
      // Handle successful login
      // In a real implementation, you might store tokens in localStorage or cookies
      // and set up authentication state
      
      // Redirect to dashboard
      await navigateTo('/dashboard')
    } else {
      // Handle login failure
      errors.general = data.message || 'Email atau password salah. Silakan coba lagi.'
    }
  } catch (error) {
    console.error('Error during login:', error)
    errors.general = 'Email atau password salah. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>