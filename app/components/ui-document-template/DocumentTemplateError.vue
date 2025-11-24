<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
    <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
    <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
    <button
      @click="$emit('retry')"
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
    >
      Coba Lagi
    </button>
  </div>
</template>

<script setup lang="ts">
// Props
const props = defineProps<{
  errorMessage: string;
}>();

// Emits
const emit = defineEmits<{
  retry: [];
}>();
</script>