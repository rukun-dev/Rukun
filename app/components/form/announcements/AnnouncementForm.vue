<template>
  <Teleport to="body">
    <!-- Debug: Modal visibility -->
    <div v-if="isOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"></div>
       
        
        <!-- Modal content -->
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
          <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-xl font-bold text-gray-900">
                  {{ isEditing ? 'Edit Pengumuman' : 'Buat Pengumuman' }}
                </h3>
                <div class="mt-2">
                  <form @submit.prevent="handleSubmit" class="space-y-4">
                    <!-- Title -->
                    <div>
                      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                      <input
                        type="text"
                        id="title"
                        v-model="localForm.title"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan judul pengumuman"
                      />
                      <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
                    </div>

                    <!-- Content -->
                    <div>
                      <label for="content" class="block text-sm font-medium text-gray-700 mb-1">Isi</label>
                      <textarea
                        id="content"
                        v-model="localForm.content"
                        required
                        rows="4"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan isi pengumuman"
                      ></textarea>
                      <p v-if="errors.content" class="mt-1 text-sm text-red-600">{{ errors.content }}</p>
                    </div>

                    <!-- Type -->
                    <div>
                      <label for="type" class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                      <select
                        id="type"
                        v-model="localForm.type"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="INFO">Informasi</option>
                        <option value="WARNING">Peringatan</option>
                        <option value="DANGER">Bahaya</option>
                      </select>
                    </div>

                    <!-- Priority -->
                    <div>
                      <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                      <select
                        id="priority"
                        v-model="localForm.priority"
                        required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="LOW">Rendah</option>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Tinggi</option>
                      </select>
                    </div>

                    <!-- Publish Status -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <input
                          id="isPublished"
                          v-model="localForm.isPublished"
                          type="checkbox"
                          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label for="isPublished" class="ml-2 block text-sm text-gray-700">
                          Publikasikan pengumuman
                        </label>
                      </div>
                    </div>

                    <!-- Expiration Date -->
                    <div>
                      <label for="expiresAt" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Kadaluarsa (Opsional)</label>
                      <input
                        type="datetime-local"
                        id="expiresAt"
                        v-model="localForm.expiresAt"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Pilih tanggal kadaluarsa"
                      />
                      <p class="mt-1 text-xs text-gray-500">Biarkan kosong jika pengumuman tidak memiliki tanggal kadaluarsa</p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="handleSubmit"
              :disabled="loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isEditing ? 'Simpan' : 'Buat' }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              @click="handleClose"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watchEffect, watch, onMounted } from 'vue';
import type { AnnouncementFormData } from '../../../composables/useAnnouncements';

// Define props with proper types
interface Props {
  isOpen: boolean;
  isEditing: boolean;
  initialData?: AnnouncementFormData;
  loading: boolean;
}

// Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    title: '',
    content: '',
    type: 'INFO',
    priority: 'NORMAL',
    isPublished: false,
    expiresAt: null,
    recipients: [{ recipientType: 'ALL', recipientId: null }]
  })
});

// Define emits with explicit types
const emit = defineEmits<{
  close: [];
  submit: [data: AnnouncementFormData];
}>();

// Methods
const handleClose = () => {
  emit('close');
};


// Local form state with explicit type
const localForm = reactive<AnnouncementFormData>({
  title: '',
  content: '',
  type: 'INFO',
  priority: 'NORMAL',
  isPublished: false,
  expiresAt: null,
  recipients: [{ recipientType: 'ALL', recipientId: null }]
});

// Form errors with explicit type
const errors = reactive<{ [key: string]: string }>({
  title: '',
  content: ''
});

// Initialize form when props change
watchEffect(() => {
    console.log('🔧 AnnouncementForm watchEffect: isOpen changed to', props.isOpen);
    if (props.isOpen) {
      // Reset errors
      errors.title = '';
      errors.content = '';
    
    // Fill form with initial data
    if (props.initialData) {
      localForm.title = props.initialData.title;
      localForm.content = props.initialData.content;
      localForm.type = props.initialData.type;
      localForm.priority = props.initialData.priority;
      localForm.isPublished = props.initialData.isPublished;
      localForm.expiresAt = props.initialData.expiresAt;
      localForm.recipients = props.initialData.recipients || [{ recipientType: 'ALL', recipientId: null }];
    } else {
      // Reset form for new announcement
      localForm.title = '';
      localForm.content = '';
      localForm.type = 'INFO';
      localForm.priority = 'NORMAL';
      localForm.isPublished = false;
      localForm.expiresAt = null;
      localForm.recipients = [{ recipientType: 'ALL', recipientId: null }];
    }
  }
});

// Watch for isEditing changes to reset form when switching from edit to create
watch(
    () => [props.isEditing, props.isOpen],
    ([isEditing, isOpen]) => {
      if (!isEditing && isOpen) {
        Object.assign(localForm, {
          title: '',
          content: '',
          type: 'INFO',
          priority: 'NORMAL',
          isPublished: false,
          expiresAt: null,
          recipients: [{ recipientType: 'ALL', recipientId: null }]
        });
        errors.title = '';
        errors.content = '';
      }
    },
    { immediate: true }
  );

// Form validation function with return type
const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  errors.title = '';
  errors.content = '';
  
  // Validate title
  if (!localForm.title.trim()) {
    errors.title = 'Judul harus diisi';
    isValid = false;
  } else if (localForm.title.length < 5) {
    errors.title = 'Judul minimal 5 karakter';
    isValid = false;
  } else if (localForm.title.length > 100) {
    errors.title = 'Judul maksimal 100 karakter';
    isValid = false;
  }
  
  // Validate content
  if (!localForm.content.trim()) {
    errors.content = 'Isi pengumuman harus diisi';
    isValid = false;
  } else if (localForm.content.length < 10) {
    errors.content = 'Isi pengumuman minimal 10 karakter';
    isValid = false;
  }
  
  return isValid;
};

// Handle form submission with proper return type
const handleSubmit = (): void => {
  console.log('🔧 AnnouncementForm handleSubmit called, form data:', { ...localForm });
  if (validateForm()) {
    // Ensure recipients is always included
    const formDataToSubmit = {
      ...localForm,
      recipients: localForm.recipients.length > 0 ? localForm.recipients : [{ recipientType: 'ALL', recipientId: null }]
    };
    emit('submit', formDataToSubmit);
  }
};

// Add debug method to check if component is properly mounted
onMounted(() => {
  console.log('🔧 AnnouncementForm component mounted');
});
</script>