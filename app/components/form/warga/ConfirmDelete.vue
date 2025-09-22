<template>
  <div v-if="modelValue" class="fixed inset-0 z-[100]">
    <!-- backdrop -->
    <div class="absolute inset-0 bg-black/60" @click="onCancel"></div>

    <!-- dialog -->
    <div
      class="absolute inset-0 flex items-center justify-center p-4"
      @keydown.esc="onCancel"
    >
      <div
        class="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200"
        role="dialog"
        aria-modal="true"
      >
        <div class="p-6">
          <div class="flex items-start gap-3">
            <div class="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <!-- icon trash -->
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              <p class="mt-1 text-sm text-gray-600">{{ message }}</p>

              <div v-if="details" class="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 border border-gray-200">
                {{ details }}
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              @click="onCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              @click="onConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Hapus Data?' },
  message: { type: String, default: 'Tindakan ini tidak dapat dibatalkan.' },
  details: { type: String, default: '' },               // opsional: tampilkan nama/NIK
  confirmText: { type: String, default: 'Hapus' },
  cancelText: { type: String, default: 'Batal' },
})
const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const onCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
const onConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
