<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-black/50 transition-opacity" 
        @click="closeModal"
      ></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full relative z-10">
        <div class="bg-white px-6 py-5">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Edit Profil
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

          <!-- Form -->
          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Profile Picture Section -->
            <div class="flex items-center space-x-6">
              <div class="relative">
                <img 
                  :src="formData.avatar || '/default-avatar.svg'" 
                  alt="Profile picture"
                  class="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                />
                <button
                  type="button"
                  @click="$emit('openAvatarUpload')"
                  class="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-900">Foto Profil</h4>
                <p class="text-sm text-gray-500">Klik ikon kamera untuk mengubah foto profil</p>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- First Name -->
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">
                  Nama Depan *
                </label>
                <input
                  type="text"
                  id="firstName"
                  v-model="formData.firstName"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.firstName }"
                />
                <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">{{ errors.firstName }}</p>
              </div>

              <!-- Last Name -->
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">
                  Nama Belakang *
                </label>
                <input
                  type="text"
                  id="lastName"
                  v-model="formData.lastName"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  :class="{ 'border-red-300': errors.lastName }"
                />
                <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">{{ errors.lastName }}</p>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                required
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :class="{ 'border-red-300': errors.email }"
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Phone -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="phone"
                v-model="formData.phone"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <!-- Bio -->
            <div>
              <label for="bio" class="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                v-model="formData.bio"
                rows="4"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ceritakan sedikit tentang diri Anda..."
                maxlength="500"
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">{{ formData.bio?.length || 0 }}/500 karakter</p>
            </div>

            <!-- Location -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <!-- City -->
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">
                  Kota
                </label>
                <input
                  type="text"
                  id="city"
                  v-model="formData.city"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Jakarta"
                />
              </div>

              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700">
                  Negara
                </label>
                <select
                  id="country"
                  v-model="formData.country"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Pilih Negara</option>
                  <option value="ID">Indonesia</option>
                  <option value="MY">Malaysia</option>
                  <option value="SG">Singapura</option>
                  <option value="TH">Thailand</option>
                  <option value="PH">Filipina</option>
                  <option value="VN">Vietnam</option>
                  <option value="US">Amerika Serikat</option>
                  <option value="GB">Inggris</option>
                  <option value="AU">Australia</option>
                  <option value="JP">Jepang</option>
                  <option value="KR">Korea Selatan</option>
                </select>
              </div>
            </div>

            <!-- Birth Date -->
            <div>
              <label for="birthDate" class="block text-sm font-medium text-gray-700">
                Tanggal Lahir
              </label>
              <input
                type="date"
                id="birthDate"
                v-model="formData.birthDate"
                class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <!-- Gender -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Jenis Kelamin
              </label>
              <div class="flex space-x-6">
                <div class="flex items-center">
                  <input
                    id="gender-male"
                    type="radio"
                    value="male"
                    v-model="formData.gender"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="gender-male" class="ml-2 text-sm text-gray-700">
                    Laki-laki
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="gender-female"
                    type="radio"
                    value="female"
                    v-model="formData.gender"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="gender-female" class="ml-2 text-sm text-gray-700">
                    Perempuan
                  </label>
                </div>
                <div class="flex items-center">
                  <input
                    id="gender-other"
                    type="radio"
                    value="other"
                    v-model="formData.gender"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label for="gender-other" class="ml-2 text-sm text-gray-700">
                    Lainnya
                  </label>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-900">Media Sosial</h4>
              
              <!-- Website -->
              <div>
                <label for="website" class="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  v-model="formData.website"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>

              <!-- Social Media Links -->
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label for="twitter" class="block text-sm font-medium text-gray-700">
                    Twitter
                  </label>
                  <input
                    type="text"
                    id="twitter"
                    v-model="formData.twitter"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label for="linkedin" class="block text-sm font-medium text-gray-700">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    id="linkedin"
                    v-model="formData.linkedin"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label for="instagram" class="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    v-model="formData.instagram"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label for="github" class="block text-sm font-medium text-gray-700">
                    GitHub
                  </label>
                  <input
                    type="text"
                    id="github"
                    v-model="formData.github"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="github.com/username"
                  />
                </div>
              </div>
            </div>

            <!-- Privacy Settings -->
            <div class="space-y-4">
              <h4 class="text-sm font-medium text-gray-900">Pengaturan Privasi</h4>
              
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700">Profil Publik</label>
                    <p class="text-sm text-gray-500">Izinkan orang lain melihat profil Anda</p>
                  </div>
                  <button
                    type="button"
                    @click="formData.isPublic = !formData.isPublic"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      formData.isPublic ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        formData.isPublic ? 'translate-x-5' : 'translate-x-0'
                      ]"
                    />
                  </button>
                </div>

                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-medium text-gray-700">Tampilkan Email</label>
                    <p class="text-sm text-gray-500">Tampilkan email di profil publik</p>
                  </div>
                  <button
                    type="button"
                    @click="formData.showEmail = !formData.showEmail"
                    :class="[
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      formData.showEmail ? 'bg-blue-600' : 'bg-gray-200'
                    ]"
                  >
                    <span
                      :class="[
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        formData.showEmail ? 'translate-x-5' : 'translate-x-0'
                      ]"
                    />
                  </button>
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
                :disabled="saving"
                class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="saving">Menyimpan...</span>
                <span v-else>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

// Props & Emits
interface Props {
  user: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    bio?: string
    city?: string
    country?: string
    birthDate?: string
    gender?: string
    website?: string
    twitter?: string
    linkedin?: string
    instagram?: string
    github?: string
    avatar?: string
    isPublic?: boolean
    showEmail?: boolean
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: [user: any]
  openAvatarUpload: []
}>()

// Reactive state
const saving = ref(false)
const generalError = ref('')

// Form data
const formData = reactive({
  firstName: props.user.firstName || '',
  lastName: props.user.lastName || '',
  email: props.user.email || '',
  phone: props.user.phone || '',
  bio: props.user.bio || '',
  city: props.user.city || '',
  country: props.user.country || '',
  birthDate: props.user.birthDate || '',
  gender: props.user.gender || '',
  website: props.user.website || '',
  twitter: props.user.twitter || '',
  linkedin: props.user.linkedin || '',
  instagram: props.user.instagram || '',
  github: props.user.github || '',
  avatar: props.user.avatar || '',
  isPublic: props.user.isPublic ?? true,
  showEmail: props.user.showEmail ?? false
})

// Form validation errors
const errors = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

// Methods
const closeModal = () => {
  emit('close')
}

const validateForm = (): boolean => {
  // Reset errors
  errors.firstName = ''
  errors.lastName = ''
  errors.email = ''

  let isValid = true

  // Validate first name
  if (!formData.firstName.trim()) {
    errors.firstName = 'Nama depan wajib diisi'
    isValid = false
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = 'Nama depan minimal 2 karakter'
    isValid = false
  }

  // Validate last name
  if (!formData.lastName.trim()) {
    errors.lastName = 'Nama belakang wajib diisi'
    isValid = false
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = 'Nama belakang minimal 2 karakter'
    isValid = false
  }

  // Validate email
  if (!formData.email.trim()) {
    errors.email = 'Email wajib diisi'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Format email tidak valid'
    isValid = false
  }

  return isValid
}

const saveProfile = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true
  generalError.value = ''

  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    // Emit the updated user data
    emit('save', { ...formData })
    
  } catch (error) {
    generalError.value = 'Gagal menyimpan profil. Silakan coba lagi.'
    console.error('Failed to save profile:', error)
  } finally {
    saving.value = false
  }
}

// Watch for changes in user prop to update form data
watch(() => props.user, (newUser) => {
  Object.assign(formData, {
    firstName: newUser.firstName || '',
    lastName: newUser.lastName || '',
    email: newUser.email || '',
    phone: newUser.phone || '',
    bio: newUser.bio || '',
    city: newUser.city || '',
    country: newUser.country || '',
    birthDate: newUser.birthDate || '',
    gender: newUser.gender || '',
    website: newUser.website || '',
    twitter: newUser.twitter || '',
    linkedin: newUser.linkedin || '',
    instagram: newUser.instagram || '',
    github: newUser.github || '',
    avatar: newUser.avatar || '',
    isPublic: newUser.isPublic ?? true,
    showEmail: newUser.showEmail ?? false
  })
}, { deep: true })
</script>

<style scoped>
/* Custom animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>