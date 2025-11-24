<template>
  <!-- Data Table -->
  <div v-if="paginatedTemplates.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Data Template Dokumen</h3>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-600">
            Menampilkan {{ startIndex }} - {{ endIndex }} dari {{ filteredTemplates.length }} template
          </span>
          <select
            :value="itemsPerPage"
            @change="$emit('change-items-per-page', parseInt(($event.target as HTMLSelectElement).value))"
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(template.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end space-x-2">
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { DocumentType } from '@prisma/client';
import type { DocumentTemplate } from '@/composables/useDocumentTemplates';

// Props
const props = defineProps<{
  paginatedTemplates: DocumentTemplate[];
  filteredTemplates: DocumentTemplate[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}>();

// Emits
const emit = defineEmits<{
  'delete-template': [template: DocumentTemplate];
  'previous-page': [];
  'next-page': [];
  'go-to-page': [page: number];
  'change-items-per-page': [itemsPerPage: number];
}>();

// Computed
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, props.currentPage - 2);
  const end = Math.min(props.totalPages, props.currentPage + 2);
  
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

// Event handlers
const handleDeleteTemplate = (template: DocumentTemplate) => {
  emit('delete-template', template);
};

const previousPage = () => {
  emit('previous-page');
};

const nextPage = () => {
  emit('next-page');
};

const goToPage = (page: number) => {
  emit('go-to-page', page);
};
</script>