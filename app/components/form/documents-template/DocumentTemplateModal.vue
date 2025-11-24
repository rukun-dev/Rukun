<template>
  <div v-if="visible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ isEdit ? 'Edit Template Dokumen' : 'Tambah Template Dokumen' }}
          </h3>
          <button @click="handleClose" class="text-gray-400 hover:text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="px-6 py-6">
        <DocumentTemplateForm
          :initial-data="initialData"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @cancel="handleClose"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import DocumentTemplateForm from './DocumentTemplateForm.vue';

// Props
const props = defineProps<{
  visible: boolean;
  initialData?: {
    title?: string;
    parameters?: string;
  };
  isSubmitting: boolean;
  isEdit?: boolean;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  submit: [formData: FormData];
}>();

// Methods
const handleClose = () => {
  emit('close');
};

const handleSubmit = (formData: FormData) => {
  emit('submit', formData);
};
</script>