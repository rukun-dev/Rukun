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
              Upload Avatar
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

          <!-- Upload Area -->
          <div class="space-y-6">
            <!-- Current Avatar Preview -->
            <div class="flex justify-center">
              <div class="relative">
                <img 
                  :src="previewUrl || currentAvatar || '/default-avatar.svg'" 
                  alt="Avatar preview"
                  class="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
                <div v-if="uploading" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              </div>
            </div>

            <!-- Upload Options -->
            <div class="space-y-4">
              <!-- File Upload -->
              <div 
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors"
                :class="{ 'border-blue-400 bg-blue-50': isDragging }"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*"
                  @change="handleFileSelect"
                  class="hidden"
                />
                
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                
                <div class="mt-4">
                  <button
                    type="button"
                    @click="fileInputRef?.click()"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Pilih File
                  </button>
                  <p class="mt-2 text-sm text-gray-500">atau drag & drop file di sini</p>
                </div>
                
                <p class="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF hingga 5MB
                </p>
              </div>

              <!-- Camera Capture (if supported) -->
              <div v-if="supportsCameraCapture" class="text-center">
                <button
                  type="button"
                  @click="captureFromCamera"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ambil dari Kamera
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div class="flex">
                <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <div class="ml-3">
                  <p class="text-sm text-red-800">{{ error }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </button>
              <button
                type="button"
                @click="uploadAvatar"
                :disabled="!selectedFile || uploading"
                class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="uploading">Mengupload...</span>
                <span v-else>Upload</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'

// Props & Emits
interface Props {
  currentAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentAvatar: ''
})

const emit = defineEmits<{
  close: []
  upload: [url: string]
}>()

// Template refs
const fileInputRef = ref<HTMLInputElement>()

// Composables
const { user } = useAuth()

// Reactive state
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const uploading = ref(false)
const error = ref<string>('')
const isDragging = ref(false)

// Computed
const supportsCameraCapture = computed(() => {
  return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices
})

// Methods
const closeModal = () => {
  emit('close')
}

const validateFile = (file: File): boolean => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    error.value = 'File harus berupa gambar'
    return false
  }

  // Check file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Ukuran file maksimal 5MB'
    return false
  }

  return true
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file && validateFile(file)) {
    selectedFile.value = file
    createPreview(file)
    error.value = ''
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  const file = files?.[0]
  
  if (file && validateFile(file)) {
    selectedFile.value = file
    createPreview(file)
    error.value = ''
  }
}

const createPreview = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const captureFromCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: 640, height: 640 } 
    })
    
    // Create video element for camera preview
    const video = document.createElement('video')
    video.srcObject = stream
    video.play()
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      // Capture frame after 3 seconds
      setTimeout(() => {
        ctx?.drawImage(video, 0, 0)
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            selectedFile.value = file
            createPreview(file)
          }
        }, 'image/jpeg', 0.8)
        
        // Stop camera
        stream.getTracks().forEach(track => track.stop())
      }, 3000)
    })
    
  } catch (err) {
    error.value = 'Tidak dapat mengakses kamera'
  }
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return
  
  uploading.value = true
  error.value = ''
  
  try {
    // Check if user is authenticated
    if (!user.value?.id) {
      throw new Error('User tidak ditemukan')
    }
    
    // Create FormData for file upload
    const formData = new FormData()
    formData.append('avatar', selectedFile.value)
    
    // Use the correct API endpoint
    const response = await fetch(`/api/users/avatar/${user.value.id}`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Upload gagal')
    }
    
    const data = await response.json()
    
    // Emit the uploaded avatar URL
    emit('upload', data.data.avatar)
    
  } catch (err: any) {
    error.value = err.message || 'Upload gagal. Silakan coba lagi.'
  } finally {
    uploading.value = false
  }
}

// Drag and drop handlers
const handleDragEnter = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
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
</style>