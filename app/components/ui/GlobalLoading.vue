<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
    <div class="text-center">
      <!-- Loading Spinner -->
      <div class="relative">
        <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto" style="animation-delay: 0.15s;"></div>
      </div>
      
      <!-- Loading Text -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600">{{ message }}</p>
      </div>
      
      <!-- Progress Dots -->
      <div class="flex justify-center mt-4 space-x-1">
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.2s;"></div>
        <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style="animation-delay: 0.4s;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show?: boolean
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: 'Memuat...',
  message: 'Mohon tunggu sebentar'
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>