<template>
  <div>
    <slot v-if="!error"></slot>
    <div v-else class="error-boundary">
      <div class="error-container">
        <!-- Error Icon -->
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16 text-red-500">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <!-- Error Message -->
        <h3 class="error-title">{{ errorTitle }}</h3>
        <p class="error-message">{{ errorMessage }}</p>
        
        <!-- Technical Details (for developers) -->
        <div v-if="showDetails" class="error-details">
          <button 
            @click="toggleDetails" 
            class="details-toggle"
          >
            {{ detailsExpanded ? 'Hide Technical Details' : 'Show Technical Details' }}
          </button>
          
          <div v-if="detailsExpanded" class="details-content">
            <p class="details-label">Error Type:</p>
            <pre class="details-code">{{ error.name || 'Unknown Error' }}</pre>
            
            <p class="details-label">Error Message:</p>
            <pre class="details-code">{{ error.message || 'No message available' }}</pre>
            
            <p class="details-label">Stack Trace:</p>
            <pre class="details-code">{{ error.stack || 'No stack trace available' }}</pre>
            
            <p class="details-label">Component:</p>
            <pre class="details-code">{{ componentInfo }}</pre>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="error-actions">
          <button 
            @click="retry" 
            class="action-button retry"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
              <path d="M21 2v6h-6"></path>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
              <path d="M3 22v-6h6"></path>
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
            </svg>
            Coba Lagi
          </button>
          
          <button 
            v-if="canReset" 
            @click="reset" 
            class="action-button reset"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
            Reset
          </button>
          
          <button 
            @click="goBack" 
            class="action-button back"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Kembali
          </button>
        </div>
        
        <!-- Report Error Link -->
        <div v-if="reportUrl" class="error-report">
          <a :href="reportUrl" target="_blank" class="report-link">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-1">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Laporkan Masalah
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onErrorCaptured, useSlots, getCurrentInstance } from 'vue'

interface Props {
  fallbackTitle?: string
  fallbackMessage?: string
  showDetails?: boolean
  canReset?: boolean
  reportUrl?: string
  onRetry?: () => void
  onReset?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  fallbackTitle: 'Terjadi Kesalahan',
  fallbackMessage: 'Maaf, terjadi kesalahan saat memuat komponen ini. Silakan coba lagi atau kembali ke halaman sebelumnya.',
  showDetails: process.env.NODE_ENV !== 'production',
  canReset: true,
  reportUrl: '',
  onRetry: undefined,
  onReset: undefined
})

const emit = defineEmits(['error', 'retry', 'reset'])

// State
const error = ref<Error | null>(null)
const detailsExpanded = ref(false)
const slots = useSlots()
const instance = getCurrentInstance()

// Computed properties
const errorTitle = computed(() => {
  if (!error.value) return props.fallbackTitle
  
  // Map common error types to user-friendly titles
  if (error.value.name === 'TypeError') {
    return 'Kesalahan Tipe Data'
  } else if (error.value.name === 'SyntaxError') {
    return 'Kesalahan Sintaks'
  } else if (error.value.name === 'ReferenceError') {
    return 'Kesalahan Referensi'
  } else if (error.value.name === 'NetworkError' || error.value.message.includes('network')) {
    return 'Kesalahan Jaringan'
  } else if (error.value.message.includes('timeout') || error.value.message.includes('timed out')) {
    return 'Waktu Permintaan Habis'
  }
  
  return props.fallbackTitle
})

const errorMessage = computed(() => {
  if (!error.value) return props.fallbackMessage
  
  // Provide user-friendly messages based on error type
  if (error.value.name === 'TypeError') {
    return 'Terjadi kesalahan pada tipe data. Silakan coba muat ulang halaman.'
  } else if (error.value.name === 'SyntaxError') {
    return 'Terjadi kesalahan pada kode aplikasi. Tim kami sedang menyelesaikan masalah ini.'
  } else if (error.value.name === 'ReferenceError') {
    return 'Aplikasi mencoba mengakses data yang tidak tersedia. Silakan coba lagi nanti.'
  } else if (error.value.name === 'NetworkError' || error.value.message.includes('network')) {
    return 'Terjadi masalah jaringan. Periksa koneksi internet Anda dan coba lagi.'
  } else if (error.value.message.includes('timeout') || error.value.message.includes('timed out')) {
    return 'Permintaan memakan waktu terlalu lama. Silakan coba lagi nanti.'
  }
  
  return props.fallbackMessage
})

const componentInfo = computed(() => {
  if (!instance || !instance.type) return 'Unknown component'
  
  const componentName = instance.type.__name || instance.type.name || 'Anonymous Component'
  const componentPath = (instance.vnode?.type as any)?.__file || 'Unknown path'
  
  return `${componentName} (${componentPath})`
})

// Error handling
onErrorCaptured((err, _, info) => {
  error.value = err as Error
  emit('error', { error: err, info })
  return false // Prevent error from propagating further
})

// Methods
const toggleDetails = () => {
  detailsExpanded.value = !detailsExpanded.value
}

const retry = () => {
  if (props.onRetry) {
    props.onRetry()
  }
  emit('retry')
  error.value = null
}

const reset = () => {
  if (props.onReset) {
    props.onReset()
  }
  emit('reset')
  error.value = null
}

const goBack = () => {
  window.history.back()
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.error-container {
  max-width: 500px;
  text-align: center;
}

.error-icon {
  margin: 0 auto 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.error-message {
  color: #4b5563;
  margin-bottom: 1.5rem;
}

.error-details {
  margin-bottom: 1.5rem;
  text-align: left;
}

.details-toggle {
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.details-content {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.details-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #374151;
}

.details-code {
  font-family: monospace;
  background-color: #e5e7eb;
  padding: 0.5rem;
  border-radius: 0.25rem;
  overflow-x: auto;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #1f2937;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.retry:hover {
  background-color: #4338ca;
}

.reset {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.reset:hover {
  background-color: #e5e7eb;
}

.back {
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #d1d5db;
}

.back:hover {
  background-color: #e5e7eb;
}

.error-report {
  margin-top: 1rem;
}

.report-link {
  display: inline-flex;
  align-items: center;
  color: #4f46e5;
  font-size: 0.875rem;
  text-decoration: none;
}

.report-link:hover {
  text-decoration: underline;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .error-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .action-button {
    width: 100%;
  }
}
</style>