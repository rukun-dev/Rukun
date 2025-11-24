<template>
  <div class="min-h-screen bg-white">

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Content -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div></div>
          
          <!-- Tombol Tambah Dokumen -->
          <button
            @click="handleDocumentCreate"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambah Dokumen</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <StatsDocuments 
        :stats="{
          total: stats.totalDocuments || 0,
          approved: stats.approvedDocuments || 0,
          rejected: stats.rejectedDocuments || 0,
          pending: stats.pendingDocuments || 0
        }"
      />

      <!-- Filters -->
      <DocumentFilters
        v-model:searchQuery="searchQueryRef"
        v-model:selectedCategory="selectedCategoryRef"
        v-model:selectedStatus="selectedStatusRef"
        class="mb-6"
      />

    <!-- Header -->
      <DocumentsHeader @create="handleDocumentCreate" />

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat data dokumen...</p>
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
          @click="fetchDocuments"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Data Table -->
      <div v-else-if="paginatedDocuments.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <h3 class="text-lg font-semibold text-gray-900">Data Dokumen</h3>
              
              <!-- Bulk Actions -->
              <div v-if="selectedDocuments.length > 0" class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">{{ selectedDocuments.length }} dipilih</span>
                <button
                  @click="handleBulkApprove"
                  :disabled="isSubmitting"
                  class="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {{ isSubmitting ? 'Memproses...' : 'Setujui Semua' }}
                </button>
                <button
                  @click="handleBulkReject"
                  :disabled="isSubmitting"
                  class="px-3 py-1 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  {{ isSubmitting ? 'Memproses...' : 'Tolak Semua' }}
                </button>
                <button
                  @click="handleDeselectAllDocuments"
                  :disabled="isSubmitting"
                  class="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan {{ startIndex }} - {{ endIndex }} dari {{ filteredDocuments.length }} dokumen
              </span>
              <select
                v-model.number="itemsPerPageRef"
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
      <DocumentsTable
        :documents="paginatedDocuments"
        :selected-documents="selectedDocuments"
        @edit="handleDocumentEdit"
        @delete="handleDocumentDelete"
        @approve="approveDocument"
        @reject="handleDocumentRejection"
        @show-detail="(doc) => openDetailModal(doc.id)"
        @select-document="handleSelectDocument"
        @deselect-document="handleDeselectDocument"
        @select-all-documents="handleSelectAllDocuments"
        @deselect-all-documents="handleDeselectAllDocuments"
      />

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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Tidak ada data dokumen
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Data dokumen tidak ditemukan dengan kriteria pencarian yang Anda masukkan.
          </p>
        </div>
      </div>
    <!-- Document Create Modal -->
    <DocumentsCreate
      :visible="modalVisible"
      :editing-document="isEditMode ? selectedDocument : undefined"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
    
    <!-- Document Detail Modal -->
    <DocumentDetailModal
      :is-open="detailModalVisible"
      :document-id="selectedDocumentId"
      @close="closeDetailModal"
    />
    
    </main>
  </div>
</template>

<script setup lang="ts">
import type { Document } from '~/types/document';
import { ref, computed, onMounted } from 'vue';
import { useDocuments } from '@/composables/useDocuments';
import { useToast } from '@/composables/useToast';
import DocumentsHeader from '@/components/ui-documents/DocumentsHeader.vue';
import StatsDocuments from '@/components/ui-documents/StatsDocuments.vue';
import DocumentFilters from '@/components/ui-documents/DocumentFilters.vue';
import DocumentsTable from '@/components/ui-documents/DocumentsTable.vue';
import DocumentsCreate from '@/components/form/documents/DocumentsCreate.vue';
import DocumentDetailModal from '@/components/ui-documents/DocumentDetailModal.vue';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Composables
const { toast } = useToast();
const {
  // State
  documents,
  isLoading,
  apiError,
  stats,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  itemsPerPage,
  
  // Computed
  paginatedDocuments,
  filteredDocuments,
  
  // Functions
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  approveDocument,
  rejectDocument,
  nextPage,
  previousPage,
  goToPage,
  
  // Mutables
  searchQueryRef,
  selectedCategoryRef,
  selectedStatusRef,
  itemsPerPage: itemsPerPageRef
} = useDocuments();

// Modal state
const modalVisible = ref(false);
const isEditMode = ref(false);
const selectedDocument = ref<Document | null>(null);
const isSubmitting = ref(false);

// Bulk selection state
const selectedDocuments = ref<string[]>([]);

// Detail modal state
const detailModalVisible = ref(false);
const selectedDocumentId = ref<string | null>(null);

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

// Modal functions
const openModal = (editMode = false, document: Document | null = null) => {
  isEditMode.value = editMode;
  selectedDocument.value = document;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
  selectedDocument.value = null;
  isEditMode.value = false;
};

// Detail modal functions
const openDetailModal = (documentId: string) => {
  selectedDocumentId.value = documentId;
  detailModalVisible.value = true;
};

const closeDetailModal = () => {
  detailModalVisible.value = false;
  selectedDocumentId.value = null;
};

// Event handlers
const handleDocumentCreate = () => {
  openModal(false);
};

const handleDocumentEdit = (document: Document) => {
  openModal(true, document);
};

const handleDocumentDelete = async (document: Document) => {
  if (confirm(`Apakah Anda yakin ingin menghapus dokumen "${document.title}"?`)) {
    try {
      await deleteDocument(document.id);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }
};

const handleModalSubmit = async (data: any) => {
  // Prevent double execution
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  
  try {
    if (isEditMode.value && selectedDocument.value) {
      await updateDocument(selectedDocument.value.id, data);
    } else {
      await createDocument(data);
    }
    closeModal();
    await fetchDocuments();
  } catch (error) {
    console.error('Error saving document:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleDocumentApproval = async (data: any) => {
  if (selectedDocument.value) {
    try {
      await approveDocument(selectedDocument.value.id);
      closeModal();
      await fetchDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
    }
  }
};

const handleDocumentRejection = async (data: { reason: string }) => {
  if (selectedDocument.value) {
    try {
      await rejectDocument(selectedDocument.value.id, data.reason);
      closeModal();
      await fetchDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
    }
  }
};

// Bulk selection handlers
const handleSelectDocument = (documentId: string) => {
  if (!selectedDocuments.value.includes(documentId)) {
    selectedDocuments.value.push(documentId);
  }
};

const handleDeselectDocument = (documentId: string) => {
  selectedDocuments.value = selectedDocuments.value.filter(id => id !== documentId);
};

const handleSelectAllDocuments = () => {
  selectedDocuments.value = paginatedDocuments.value.map(doc => doc.id);
};

const handleDeselectAllDocuments = () => {
  selectedDocuments.value = [];
};

// Bulk action handlers
const handleBulkApprove = async () => {
  if (selectedDocuments.value.length === 0) return;
  
  if (!confirm(`Apakah Anda yakin ingin menyetujui ${selectedDocuments.value.length} dokumen?`)) {
    return;
  }

  isSubmitting.value = true;
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // Process documents one by one using existing single endpoint
    for (const documentId of selectedDocuments.value) {
      try {
        await $fetch(`/api/documents/${documentId}/approve`, {
          method: 'PATCH'
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error approving document ${documentId}:`, error);
      }
    }
    
    // Refresh documents list
    await fetchDocuments();
    
    // Clear selection
    selectedDocuments.value = [];
    
    // Show success message
    if (errorCount === 0) {
      toast.success(`${successCount} dokumen berhasil disetujui`);
    } else {
      toast.warning(`${successCount} dokumen disetujui, ${errorCount} gagal`);
    }
    
  } catch (error) {
    console.error('Bulk approve error:', error);
    toast.error('Gagal menyetujui dokumen secara bulk');
  } finally {
    isSubmitting.value = false;
  }
};

const handleBulkReject = async () => {
  if (selectedDocuments.value.length === 0) return;
  
  const rejectionReason = prompt('Masukkan alasan penolakan:');
  if (!rejectionReason || rejectionReason.trim().length < 10) {
    toast.error('Alasan penolakan minimal 10 karakter');
    return;
  }

  if (!confirm(`Apakah Anda yakin ingin menolak ${selectedDocuments.value.length} dokumen?`)) {
    return;
  }

  isSubmitting.value = true;
  let successCount = 0;
  let errorCount = 0;
  
  try {
    // Process documents one by one using existing single endpoint
    for (const documentId of selectedDocuments.value) {
      try {
        await $fetch(`/api/documents/${documentId}/reject`, {
          method: 'PATCH',
          body: { rejectionReason }
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error rejecting document ${documentId}:`, error);
      }
    }
    
    // Refresh documents list
    await fetchDocuments();
    
    // Clear selection
    selectedDocuments.value = [];
    
    // Show success message
    if (errorCount === 0) {
      toast.success(`${successCount} dokumen berhasil ditolak`);
    } else {
      toast.warning(`${successCount} dokumen ditolak, ${errorCount} gagal`);
    }
    
  } catch (error) {
    console.error('Bulk reject error:', error);
    toast.error('Gagal menolak dokumen secara bulk');
  } finally {
    isSubmitting.value = false;
  }
};

// Watch for itemsPerPage changes
watch(itemsPerPageRef, () => {
  goToPage(1);
});

// Lifecycle
onMounted(() => {
  fetchDocuments();
});
</script>
