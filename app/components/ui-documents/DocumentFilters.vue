<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Search Input -->
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari dokumen..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Category Filter -->
      <select
        class="block w-full px-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :value="selectedCategory"
        @change="$emit('update:selectedCategory', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">Semua Kategori</option>
        <option value="surat">Surat Keterangan</option>
        <option value="laporan">Laporan</option>
        <option value="keuangan">Dokumen Keuangan</option>
        <option value="lainnya">Lainnya</option>
      </select>

      <!-- Status Filter -->
      <select
        class="block w-full px-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        :value="selectedStatus"
        @change="$emit('update:selectedStatus', ($event.target as HTMLSelectElement).value)"
      >
        <option value="all">Semua Status</option>
        <option value="approved">Disetujui</option>
        <option value="rejected">Ditolak</option>
        <option value="pending">Menunggu</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  searchQuery?: string;
  selectedCategory?: string;
  selectedStatus?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:searchQuery': [value: string];
  'update:selectedCategory': [value: string];
  'update:selectedStatus': [value: string];
}>();
</script>