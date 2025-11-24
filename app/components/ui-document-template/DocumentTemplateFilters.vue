<template>
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
            :value="searchQuery"
            @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
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
          :value="selectedType"
          @change="$emit('update:selectedType', ($event.target as HTMLSelectElement).value as DocumentType | '')"
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
</template>

<script setup lang="ts">
import type { DocumentType } from '@prisma/client';

// Props with two-way binding
const props = defineProps<{
  searchQuery: string;
  selectedType: DocumentType | '';
}>();

// Emits for two-way binding
const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'update:selectedType': [value: DocumentType | ''];
  'reset': [];
}>();

// Methods
const resetFilters = () => {
  emit('reset');
};
</script>