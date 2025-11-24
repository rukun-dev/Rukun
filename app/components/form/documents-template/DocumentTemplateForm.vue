<template>
  <div>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <!-- Title -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen *</label>
        <input
          v-model="formData.title"
          type="text"
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Masukkan judul dokumen..."
          required
        />
      </div>

      <!-- File Upload -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">File Referensi *</label>
        <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
          <div class="space-y-1 text-center">
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <div class="flex text-sm text-gray-600">
              <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>{{ fileName || 'Upload file' }}</span>
                <input
                  id="file-upload"
                  name="file"
                  type="file"
                  class="sr-only"
                  @change="handleFileChange"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  required
                />
              </label>
            </div>
            <p class="text-xs text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB</p>
          </div>
        </div>
      </div>

      <!-- Parameters -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">Parameter/Deskripsi *</label>
        <textarea
          v-model="formData.parameters"
          rows="4"
          class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Masukkan parameter yang akan digunakan, pisahkan dengan koma. Contoh: nama, nik, alamat, tanggal_lahir"
          required
        ></textarea>
        <p class="mt-1 text-sm text-gray-500">Pisahkan setiap parameter dengan koma</p>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end space-x-3">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Membuat Template...' : 'Buat Template' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

// Props
const props = defineProps<{
  initialData?: {
    title?: string;
    parameters?: string;
  };
  isSubmitting: boolean;
}>();

// Emits
const emit = defineEmits<{
  submit: [formData: FormData];
  cancel: [];
}>();

// Form data
const formData = ref({
  title: '',
  parameters: '',
  file: null as File | null
});

const fileName = ref('');

// Watch for initial data changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    formData.value = {
      title: newData.title || '',
      parameters: newData.parameters || '',
      file: null
    };
  }
}, { immediate: true });

// File change handler
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    formData.value.file = file;
    fileName.value = file.name;
  }
};

// Event handlers
const handleSubmit = () => {
  const formDataToSend = new FormData();
  formDataToSend.append('title', formData.value.title);
  formDataToSend.append('parameters', formData.value.parameters);
  
  if (formData.value.file) {
    formDataToSend.append('file', formData.value.file);
  }
  
  emit('submit', formDataToSend);
};
</script>