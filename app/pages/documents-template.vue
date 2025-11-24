<template>
  <div class="min-h-screen bg-white">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Content -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Template Dokumen</h1>
            <p class="text-gray-500 mt-2">Kelola template dokumen untuk otomatisasi pembuatan surat</p>
          </div>
          
          <!-- Tombol Tambah Template -->
          <button
            @click="handleCreateTemplate"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambah Template</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <DocumentTemplateFilters
        v-model:searchQuery="searchQuery"
        v-model:selectedType="selectedType"
        @reset="resetFilters"
      />

      <!-- Loading State -->
      <DocumentTemplateLoading v-if="isLoading" />

      <!-- Error State -->
      <DocumentTemplateError
        v-else-if="apiError"
        :error-message="apiError"
        @retry="fetchTemplates"
      />

      <!-- Data Table -->
      <DocumentTemplatesTable
        v-else
        :paginated-templates="paginatedTemplates"
        :filtered-templates="filteredTemplates"
        :current-page="currentPage"
        :items-per-page="itemsPerPage"
        :total-pages="totalPages"
        :start-index="startIndex"
        :end-index="endIndex"
        @delete-template="handleDeleteTemplate"
        @previous-page="previousPage"
        @next-page="nextPage"
        @go-to-page="goToPage"
      />

      <!-- Create/Edit Template Modal -->
      <DocumentTemplateModal
        :visible="modalVisible"
        :initial-data="formData"
        :is-submitting="isSubmitting"
        @close="closeModal"
        @submit="handleSubmit"
      />

      <!-- Toast Notification -->
      <div
        v-if="toast.visible"
        :class="[
          'fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0',
          {
            'bg-green-500 text-white': toast.type === 'success',
            'bg-red-500 text-white': toast.type === 'error',
            'bg-blue-500 text-white': toast.type === 'info',
            'bg-yellow-500 text-white': toast.type === 'warning'
          }
        ]"
      >
        <div class="flex items-center space-x-3">
          <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="toast.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 22a9 9 0 100-18 9 9 0 000 18z" />
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { DocumentType } from '@prisma/client';
import { useDocumentTemplates, type DocumentTemplate } from '@/composables/useDocumentTemplates';
import { useToast } from '@/composables/useToast';

// Components
import DocumentTemplateFilters from '@/components/ui-document-template/DocumentTemplateFilters.vue';
import DocumentTemplateLoading from '@/components/ui-document-template/DocumentTemplateLoading.vue';
import DocumentTemplateError from '@/components/ui-document-template/DocumentTemplateError.vue';
import DocumentTemplatesTable from '@/components/ui-document-template/DocumentTemplatesTable.vue';
import DocumentTemplateModal from '@/components/form/documents-template/DocumentTemplateModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

// Composables
const templateComposable = useDocumentTemplates();
const { toast } = useToast();

// Destructure composable properties
const {
  isLoading,
  apiError,
  currentPage,
  itemsPerPage,
  searchQuery,
  selectedType,
  paginatedTemplates,
  filteredTemplates,
  totalPages,
  startIndex,
  endIndex,
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  nextPage,
  previousPage,
  goToPage,
  resetFilters
} = templateComposable;

// Modal state
const modalVisible = ref(false);
const isSubmitting = ref(false);

// Form data
const formData = ref({
  title: '',
  parameters: '',
  file: null as File | null
});

// Modal functions
const openModal = () => {
  // Reset form data
  formData.value = {
    title: '',
    parameters: '',
    file: null
  };
  
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

// Event handlers
const handleCreateTemplate = () => {
  openModal();
};

const handleDeleteTemplate = async (template: DocumentTemplate) => {
  // We'll need to import formatDocumentType from the table component or recreate it here
  // For simplicity, we'll use a basic implementation
  const typeMap: Record<string, string> = {
    SURAT_PENGANTAR: 'Surat Pengantar',
    SURAT_KETERANGAN: 'Surat Keterangan',
    SURAT_DOMISILI: 'Surat Domisili',
    SURAT_TIDAK_MAMPU: 'Surat Tidak Mampu',
    SURAT_KELAHIRAN: 'Surat Kelahiran',
    SURAT_KEMATIAN: 'Surat Kematian',
    SURAT_PINDAH: 'Surat Pindah',
    OTHER: 'Lainnya'
  };
  
  if (confirm(`Apakah Anda yakin ingin menghapus template "${typeMap[template.type] || template.type}"?`)) {
    try {
      await deleteTemplate(template.id);
      toast.success('Template berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Gagal menghapus template!');
    }
  }
};

const handleSubmit = async (formData: FormData) => {
  const title = formData.get('title') as string;
  const parameters = formData.get('parameters') as string;
  const file = formData.get('file') as File | null;
  
  if (!title || !file) {
    toast.error('Harap isi judul dan pilih file!');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    await createTemplate(formData);
    toast.success('Template berhasil dibuat!');
    closeModal();
  } catch (error) {
    console.error('Error creating template:', error);
    toast.error('Gagal membuat template!');
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchTemplates();
});
</script>