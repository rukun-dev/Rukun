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
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Template</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Cari berdasarkan jenis template..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <!-- Filter by Type -->
          <div class="w-full md:w-64">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Template</label>
            <select
              v-model="selectedType"
              class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              <option value="">Semua Jenis</option>
              <option value="SURAT_PENGANTAR">Surat Pengantar</option>
              <option value="SURAT_KETERANGAN">Surat Keterangan</option>
              <option value="SURAT_DOMISILI">Surat Domisili</option>
              <option value="SURAT_TIDAK_MAMPU">Surat Tidak Mampu</option>
              <option value="SURAT_KELAHIRAN">Surat Kelahiran</option>
              <option value="SURAT_KEMATIAN">Surat Kematian</option>
              <option value="SURAT_PINDAH">Surat Pindah</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
          
          <!-- Reset Filters -->
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat data template dokumen...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="apiError" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p class="text-gray-600 mb-4">{{ apiError }}</p>
        <button
          @click="fetchTemplates"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Data Table -->
      <div v-else-if="paginatedTemplates.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Template Dokumen</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan {{ startIndex }} - {{ endIndex }} dari {{ filteredTemplates.length }} template
              </span>
              <select
                v-model.number="itemsPerPage"
                class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="10">10 per halaman</option>
                <option :value="25">25 per halaman</option>
                <option :value="50">50 per halaman</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Template
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat Tanggal
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(template, index) in paginatedTemplates" :key="template.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ startIndex + index }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDocumentType(template.type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="
                      template.isActive
                        ? 'bg-green-100 text-green-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                        : 'bg-gray-100 text-gray-800 px-2 inline-flex text-xs leading-5 font-semibold rounded-full'
                    "
                  >
                    {{ template.isActive ? 'Aktif' : 'Tidak Aktif' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(template.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="toggleTemplateStatus(template.id)"
                      class="text-indigo-600 hover:text-indigo-900"
                      title="Toggle Status"
                    >
                      {{ template.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
                    </button>
                    <button
                      @click="handleEditTemplate(template)"
                      class="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      @click="handleDeleteTemplate(template)"
                      class="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="() => goToPage(1)"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
            </div>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                "
                class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
              >
                {{ page }}
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                @click="() => goToPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Tidak ada data template dokumen
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Data template dokumen tidak ditemukan dengan kriteria pencarian yang Anda masukkan.
          </p>
        </div>
      </div>

      <!-- Create/Edit Template Modal -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-semibold text-gray-900">
                {{ isEditMode ? 'Edit Template' : 'Tambah Template Dokumen' }}
              </h3>
              <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-6">
            <form @submit.prevent="handleSubmit">
              <!-- Document Type -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen *</label>
                <select
                  v-model="formData.type"
                  class="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">Pilih jenis dokumen</option>
                  <option value="SURAT_PENGANTAR">Surat Pengantar</option>
                  <option value="SURAT_KETERANGAN">Surat Keterangan</option>
                  <option value="SURAT_DOMISILI">Surat Domisili</option>
                  <option value="SURAT_TIDAK_MAMPU">Surat Tidak Mampu</option>
                  <option value="SURAT_KELAHIRAN">Surat Kelahiran</option>
                  <option value="SURAT_KEMATIAN">Surat Kematian</option>
                  <option value="SURAT_PINDAH">Surat Pindah</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              <!-- Template Content -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Konten Template *</label>
                <div class="bg-gray-50 p-4 rounded-lg mb-2 text-xs text-gray-500">
                  <p>Gunakan variabel berikut dalam template:</p>
                  <p class="mt-1">${nama}, ${nik}, ${tempat_lahir}, ${tanggal_lahir}, ${alamat}, ${rt}, ${rw}, ${kota}, ${kecamatan}, ${kelurahan}, ${tanggal_sekarang}</p>
                </div>
                <textarea
                  v-model="formData.content"
                  rows="10"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan konten template dokumen..."
                  required
                ></textarea>
              </div>

              <!-- Status -->
              <div class="mb-6">
                <div class="flex items-center">
                  <input
                    v-model="formData.isActive"
                    type="checkbox"
                    id="status"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label for="status" class="ml-2 block text-sm text-gray-700">
                    Aktifkan template ini
                  </label>
                </div>
              </div>

              <!-- Buttons -->
              <div class="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  :disabled="isSubmitting"
                >
                  {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { DocumentType } from '@prisma/client';
import { useDocumentTemplates, type DocumentTemplate } from '@/composables/useDocumentTemplates';
import { useToast } from '@/composables/useToast';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

// Composables
const templateComposable = useDocumentTemplates();
const { toast } = useToast();

// Destructure composable properties
const {
  templates,
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
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus,
  nextPage,
  previousPage,
  goToPage,
  resetFilters
} = templateComposable;

// Modal state
const modalVisible = ref(false);
const isEditMode = ref(false);
const selectedTemplate = ref<DocumentTemplate | null>(null);
const isSubmitting = ref(false);

// Form data
const formData = ref({
  type: '' as DocumentType | '',
  content: '',
  isActive: true
});

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, currentPage.value + 2);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

// Helper functions
const formatDocumentType = (type: DocumentType): string => {
  const typeMap: Record<DocumentType, string> = {
    SURAT_PENGANTAR: 'Surat Pengantar',
    SURAT_KETERANGAN: 'Surat Keterangan',
    SURAT_DOMISILI: 'Surat Domisili',
    SURAT_TIDAK_MAMPU: 'Surat Tidak Mampu',
    SURAT_KELAHIRAN: 'Surat Kelahiran',
    SURAT_KEMATIAN: 'Surat Kematian',
    SURAT_PINDAH: 'Surat Pindah',
    OTHER: 'Lainnya'
  };
  return typeMap[type] || type;
};

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Modal functions
const openModal = (editMode = false, template: DocumentTemplate | null = null) => {
  isEditMode.value = editMode;
  selectedTemplate.value = template;
  
  // Reset form data
  formData.value = {
    type: '',
    content: '',
    isActive: true
  };
  
  // Fill form with template data if editing
  if (template) {
    formData.value = {
      type: template.type,
      content: template.content,
      isActive: template.isActive
    };
  }
  
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
  selectedTemplate.value = null;
  isEditMode.value = false;
};

// Event handlers
const handleCreateTemplate = () => {
  openModal(false);
};

const handleEditTemplate = (template: DocumentTemplate) => {
  openModal(true, template);
};

const handleDeleteTemplate = async (template: DocumentTemplate) => {
  if (confirm(`Apakah Anda yakin ingin menghapus template "${formatDocumentType(template.type)}"?`)) {
    try {
      await deleteTemplate(template.id);
      toast.success('Template berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Gagal menghapus template!');
    }
  }
};

const handleSubmit = async () => {
  if (!formData.value.type || !formData.value.content) {
    toast.error('Harap isi semua field yang diperlukan!');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    if (isEditMode.value && selectedTemplate.value) {
      await updateTemplate(selectedTemplate.value.id, formData.value);
      toast.success('Template berhasil diperbarui!');
    } else {
      await createTemplate(formData.value);
      toast.success('Template berhasil dibuat!');
    }
    closeModal();
  } catch (error) {
    console.error('Error saving template:', error);
    toast.error(isEditMode.value ? 'Gagal memperbarui template!' : 'Gagal membuat template!');
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchTemplates();
});
</script>