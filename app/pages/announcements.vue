<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Daftar Pengumuman</h1>
        <p class="text-gray-500 mt-1">Kelola dan lihat semua pengumuman di lingkungan rumah tangga</p>
      </div>
      
      <!-- Create New Announcement Button -->
      <button
        v-if="canEditAnnouncement"
        @click="openCreateModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Buat Pengumuman
      </button>
    </div>

    <!-- Announcement Filters -->
    <AnnouncementFilters
      v-model="localFilters"
      @change="handleFiltersChange"
    />

    <!-- Announcements List -->
    <div v-if="!loading && announcements.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <h3 class="text-lg font-medium text-gray-700">Tidak ada pengumuman</h3>
      <p class="text-gray-500 mt-2">Belum ada pengumuman yang dibuat atau sesuai dengan filter yang dipilih</p>
      <button
        v-if="canEditAnnouncement"
        @click="openCreateModal"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Buat Pengumuman Pertama
      </button>
    </div>

    <div v-else-if="!loading" class="grid grid-cols-1 gap-4">
      <AnnouncementCard
        v-for="announcement in announcements"
        :key="announcement.id"
        :announcement="announcement"
        :can-edit="canEditAnnouncement"
        @edit="openEditModal(announcement)"
        @delete="handleDeleteAnnouncement(announcement.id)"
      />
    </div>

    <!-- Loading State -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div class="flex flex-col gap-4">
        <div class="animate-pulse">
          <div class="h-10 bg-gray-200 rounded-lg mb-4"></div>
          <div class="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
        </div>
        <div class="animate-pulse">
          <div class="h-10 bg-gray-200 rounded-lg mb-4"></div>
          <div class="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
        </div>
        <div class="animate-pulse">
          <div class="h-10 bg-gray-200 rounded-lg mb-4"></div>
          <div class="h-6 bg-gray-200 rounded-lg w-1/2 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded-lg w-full"></div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && announcements.length > 0" class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="text-sm text-gray-500">
        Menampilkan {{ (meta.page - 1) * meta.limit + 1 }} - {{ Math.min(meta.page * meta.limit, meta.total) }} dari {{ meta.total }} pengumuman
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="changePage(meta.page - 1)"
          :disabled="!meta.has_prev_page"
          class="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-3 py-2 border rounded-md',
            page === meta.page 
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        
        <button
          @click="changePage(meta.page + 1)"
          :disabled="!meta.has_next_page"
          class="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p class="ml-3 text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Announcement Form Modal -->
    <div v-if="isFormOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <AnnouncementForm
          :is-open="isFormOpen"
          :is-editing="isEditing"
          :initial-data="formInitialData"
          :loading="formLoading"
          @close="handleCloseModal"
          @submit="handleFormSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Apply auth middleware to protect this page
import { ref, computed, watch } from 'vue';
import { useAnnouncements,type Announcement, type AnnouncementFormData } from '../../app/composables/useAnnouncements';
import AnnouncementCard from '../../app/components/ui-announcements/AnnouncementCard.vue';
import AnnouncementForm from '../components/form/announcements/AnnouncementForm.vue';
import AnnouncementFilters from '../../app/components/ui-announcements/AnnouncementFilters.vue';
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Use the announcements composable
const {
  announcements,
  loading,
  error,
  meta,
  canEditAnnouncement,
  setFilters,
  changePage,
  createAnnouncement,
  updateAnnouncement
} = useAnnouncements();

// Local state for filters
const localFilters = ref({
  search: '',
  type: '',
  status: '',
  priorities: [] as string[]
});

// Modal state
const isFormOpen = ref(false);
const isEditing = ref(false);
const formLoading = ref(false);
const formInitialData = ref<AnnouncementFormData>({
  title: '',
  content: '',
  type: 'INFO',
  priority: 'NORMAL',
  isPublished: false,
  expiresAt: null
});

// Computed property for visible pagination pages
const visiblePages = computed(() => {
  const totalPages = meta.value.total_pages;
  const currentPage = meta.value.page;
  const pages: number[] = [];
  
  // Show first page
  if (totalPages >= 1) {
    pages.push(1);
  }
  
  // Show pages around current page (avoid duplicates)
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i);
    }
  }
  
  // Show last page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }
  
  // Sort pages
  return [...new Set(pages)].sort((a, b) => a - b);
});

// Methods
const handleFiltersChange = (filters: typeof localFilters.value) => {
  localFilters.value = filters;
  setFilters(filters);
};

const openCreateModal = () => {
  isEditing.value = false;
  formInitialData.value = {
    title: '',
    content: '',
    type: 'INFO',
    priority: 'NORMAL',
    isPublished: false,
    expiresAt: null
  };
  isFormOpen.value = true;
};

const openEditModal = (announcement: Announcement) => {
  isEditing.value = true;
  formInitialData.value = {
    title: announcement.title,
    content: announcement.content,
    type: announcement.type,
    priority: announcement.priority,
    isPublished: announcement.isPublished,
    expiresAt: announcement.expiresAt
  };
  isFormOpen.value = true;
};

const handleCloseModal = () => {
  isFormOpen.value = false;
  // Reset form data after closing
  setTimeout(() => {
    formInitialData.value = {
      title: '',
      content: '',
      type: 'INFO',
      priority: 'NORMAL',
      isPublished: false,
      expiresAt: null
    };
    isEditing.value = false;
  }, 300);
};

const handleFormSubmit = async (formData: AnnouncementFormData) => {
  formLoading.value = true;
  try {
    if (isEditing.value) {
      // Find the announcement to update
      const announcementToUpdate = announcements.value.find(a => 
        a.title === formInitialData.value.title && a.content === formInitialData.value.content
      );
      
      if (announcementToUpdate) {
        await updateAnnouncement(announcementToUpdate.id, formData);
      } else {
        throw new Error('Pengumuman yang akan diperbarui tidak ditemukan');
      }
    } else {
      await createAnnouncement(formData);
    }
    handleCloseModal();
  } catch (err) {
    console.error('Error submitting form:', err);
    // Error handling is already done in the composable
  } finally {
    formLoading.value = false;
  }
};

const handleDeleteAnnouncement = (id: string) => {
  if (confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
    // Note: Implement delete functionality if needed
    toast.info('Fitur penghapusan pengumuman belum diimplementasikan');
  }
};

// Initialize filters on mount
setFilters(localFilters.value);
</script>

<style scoped>
/* Custom styles specific to this page */
</style>