<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-bold text-gray-900">Detail Dokumen</h2>
      <button 
        @click="$emit('close')"
        class="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <div class="space-y-4">
      <div class="p-4 bg-gray-50 rounded-xl">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ document.title }}</h3>
        <p class="text-gray-500 text-sm">Nomor: {{ document.number }}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Tipe Dokumen</label>
          <p class="text-gray-900">{{ getTypeDisplay(document.type) }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">ID Warga</label>
          <p class="text-gray-900">{{ document.wargaId }}</p>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-500 mb-1">Dibuat Tanggal</label>
          <p class="text-gray-900">{{ formatDate(document.createdAt) }}</p>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-500 mb-1">Isi Dokumen</label>
        <div class="p-4 border border-gray-200 rounded-xl">
          <p class="text-gray-900">{{ document.content }}</p>
        </div>
      </div>
    </div>
    
    <div class="mt-6 flex justify-end space-x-3">
      <button 
        @click="$emit('close')"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Tutup
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

interface DocumentType {
  id: string;
  title: string;
  type: string;
  content: string;
  wargaId: string;
  number: string;
  createdAt: string;
}

const props = defineProps<{
  document: DocumentType;
}>();

const emit = defineEmits<{
  close: [];
}>();

const getTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'SURAT_TIDAK_MAMPU': 'Surat Keterangan Tidak Mampu',
    'SURAT_KETERANGAN_USAHA': 'Surat Keterangan Usaha',
    'SURAT_KETERANGAN_TINGGAL': 'Surat Keterangan Tinggal',
    'LAPORAN_KEUANGAN': 'Laporan Keuangan',
    'DOKUMEN_LAINNYA': 'Dokumen Lainnya',
    'SURAT_DOMISILI': 'Surat Domisili',
    'PROGRAM_KERJA': 'Program Kerja'
  };
  return typeMap[type] || type;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>