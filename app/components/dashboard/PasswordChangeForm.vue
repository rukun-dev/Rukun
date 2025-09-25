<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-black/50 transition-opacity" 
        @click="closeModal"
      ></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-10">
        <div class="bg-white px-6 py-5">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Ubah Password
            </h3>
            <button 
              type="button" 
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
              @click="closeModal"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Security Notice -->
          <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex">
              <svg class="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Tips Keamanan</h4>
                <p class="text-sm text-blue-700 mt-1">
                  Gunakan password yang kuat dengan minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol.
                </p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <form @submit.prevent="changePassword" class="space-y-6">
            <!-- Current Password -->
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                Password Saat Ini *
              </label>
              <div class="mt-1 relative">
                <input
                  :type="showCurrentPassword ? 'text' : 'password'"
                  id="currentPassword"
                  v-model="formData.currentPassword"
                  required
                  class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.currentPassword }"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showCurrentPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.currentPassword" class="mt-1 text-sm text-red-600">{{ errors.currentPassword }}</p>
            </div>

            <!-- New Password -->
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                Password Baru *
              </label>
              <div class="mt-1 relative">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="newPassword"
                  v-model="formData.newPassword"
                  required
                  minlength="8"
                  class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.newPassword }"
                  placeholder="Masukkan password baru"
                  @input="validatePassword"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showNewPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.newPassword" class="mt-1 text-sm text-red-600">{{ errors.newPassword }}</p>
              
              <!-- Password Strength Indicator -->
              <div v-if="formData.newPassword" class="mt-2">
                <div class="flex items-center space-x-2">
                  <div class="flex-1">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        class="h-2 rounded-full transition-all duration-300"
                        :class="passwordStrengthColor"
                        :style="{ width: passwordStrengthWidth }"
                      ></div>
                    </div>
                  </div>
                  <span class="text-xs font-medium" :class="passwordStrengthTextColor">
                    {{ passwordStrengthText }}
                  </span>
                </div>
                
                <!-- Password Requirements -->
                <div class="mt-3 space-y-1">
                  <div class="flex items-center text-xs">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="passwordChecks.length ? 'text-green-500' : 'text-gray-400'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span :class="passwordChecks.length ? 'text-green-700' : 'text-gray-500'">
                      Minimal 8 karakter
                    </span>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="passwordChecks.uppercase ? 'text-green-500' : 'text-gray-400'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span :class="passwordChecks.uppercase ? 'text-green-700' : 'text-gray-500'">
                      Huruf besar (A-Z)
                    </span>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="passwordChecks.lowercase ? 'text-green-500' : 'text-gray-400'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span :class="passwordChecks.lowercase ? 'text-green-700' : 'text-gray-500'">
                      Huruf kecil (a-z)
                    </span>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="passwordChecks.number ? 'text-green-500' : 'text-gray-400'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span :class="passwordChecks.number ? 'text-green-700' : 'text-gray-500'">
                      Angka (0-9)
                    </span>
                  </div>
                  
                  <div class="flex items-center text-xs">
                    <svg 
                      class="w-4 h-4 mr-2" 
                      :class="passwordChecks.special ? 'text-green-500' : 'text-gray-400'"
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span :class="passwordChecks.special ? 'text-green-700' : 'text-gray-500'">
                      Karakter khusus (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Konfirmasi Password Baru *
              </label>
              <div class="mt-1 relative">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="formData.confirmPassword"
                  required
                  class="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.confirmPassword }"
                  placeholder="Konfirmasi password baru"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="showConfirmPassword" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                  <svg v-else class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
            </div>

            <!-- Two-Factor Authentication Notice -->
            <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div class="flex">
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <h4 class="text-sm font-medium text-yellow-800">Pemberitahuan Keamanan</h4>
                  <p class="text-sm text-yellow-700 mt-1">
                    Setelah mengubah password, Anda akan diminta untuk login ulang di semua perangkat.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="generalError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ generalError }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="submit"
                :disabled="saving || !isFormValid"
                class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving">Mengubah Password...</span>
                <span v-else>Ubah Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Emits
const emit = defineEmits<{
  close: []
  save: []
}>()

// Reactive state
const saving = ref(false)
const generalError = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Form data
const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Form validation errors
const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Password strength checks
const passwordChecks = computed(() => {
  const password = formData.newPassword
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
})

// Password strength calculation
const passwordStrength = computed(() => {
  const checks = passwordChecks.value
  const score = Object.values(checks).filter(Boolean).length
  
  if (score === 0) return 0
  if (score <= 2) return 1 // Weak
  if (score <= 3) return 2 // Fair
  if (score <= 4) return 3 // Good
  return 4 // Strong
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  const texts = ['', 'Lemah', 'Cukup', 'Baik', 'Kuat']
  return texts[strength]
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
  return colors[strength]
})

const passwordStrengthTextColor = computed(() => {
  const strength = passwordStrength.value
  const colors = ['', 'text-red-600', 'text-yellow-600', 'text-blue-600', 'text-green-600']
  return colors[strength]
})

const passwordStrengthWidth = computed(() => {
  const strength = passwordStrength.value
  return `${(strength / 4) * 100}%`
})

// Form validation
const isFormValid = computed(() => {
  return formData.currentPassword && 
         formData.newPassword && 
         formData.confirmPassword &&
         passwordStrength.value >= 3 &&
         formData.newPassword === formData.confirmPassword &&
         !errors.currentPassword &&
         !errors.newPassword &&
         !errors.confirmPassword
})

// Methods
const closeModal = () => {
  emit('close')
}

const validatePassword = () => {
  errors.newPassword = ''
  
  if (formData.newPassword.length > 0 && formData.newPassword.length < 8) {
    errors.newPassword = 'Password minimal 8 karakter'
  } else if (formData.newPassword === formData.currentPassword) {
    errors.newPassword = 'Password baru harus berbeda dari password saat ini'
  }
  
  // Validate confirm password if it's filled
  if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok'
  } else if (formData.confirmPassword && formData.newPassword === formData.confirmPassword) {
    errors.confirmPassword = ''
  }
}

const validateForm = (): boolean => {
  // Reset errors
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''

  let isValid = true

  // Validate current password
  if (!formData.currentPassword.trim()) {
    errors.currentPassword = 'Password saat ini wajib diisi'
    isValid = false
  }

  // Validate new password
  if (!formData.newPassword.trim()) {
    errors.newPassword = 'Password baru wajib diisi'
    isValid = false
  } else if (formData.newPassword.length < 8) {
    errors.newPassword = 'Password minimal 8 karakter'
    isValid = false
  } else if (passwordStrength.value < 3) {
    errors.newPassword = 'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol'
    isValid = false
  } else if (formData.newPassword === formData.currentPassword) {
    errors.newPassword = 'Password baru harus berbeda dari password saat ini'
    isValid = false
  }

  // Validate confirm password
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi'
    isValid = false
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password tidak cocok'
    isValid = false
  }

  return isValid
}

const changePassword = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  generalError.value = ''

  try {
    // TODO: Replace with actual API call
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Gagal mengubah password')
    }

    // Success - emit save event
    emit('save')
    
    // Reset form
    formData.currentPassword = ''
    formData.newPassword = ''
    formData.confirmPassword = ''
    
  } catch (error: any) {
    if (error.message.includes('current password')) {
      errors.currentPassword = 'Password saat ini salah'
    } else {
      generalError.value = error.message || 'Gagal mengubah password. Silakan coba lagi.'
    }
    console.error('Failed to change password:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* Custom animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Password strength indicator animation */
.transition-all {
  transition: all 0.3s ease;
}
</style>