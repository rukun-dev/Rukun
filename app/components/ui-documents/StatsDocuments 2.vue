<script setup lang="ts">
import type { PropType } from 'vue';

// Props
interface Stats {
  total?: number;
  approved?: number;
  rejected?: number;
  pending?: number;
}

const props = defineProps({
  stats: {
    type: Object as PropType<Stats>,
    required: true,
    default: () => ({})
  }
});

// Methods
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Total Dokumen -->
    <div class="stats-card bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Total Dokumen</p>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formatNumber(stats.total || 0) }}
          </h3>
        
        </div>
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Dokumen Disetujui -->
    <div class="stats-card bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Dokumen Disetujui</p>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formatNumber(stats.approved || 0) }}
          </h3>
         
        </div>
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Dokumen Ditolak -->
    <div class="stats-card bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Dokumen Ditolak</p>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formatNumber(stats.rejected || 0) }}
          </h3>
          
        </div>
        <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Menunggu Persetujuan -->
    <div class="stats-card bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">Menunggu Persetujuan</p>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formatNumber(stats.pending || 0) }}
          </h3>
         
        </div>
        <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Animations for stats cards */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-card {
  animation: fadeInUp 0.3s ease forwards;
}

.stats-card:nth-child(2) {
  animation-delay: 0.1s;
}

.stats-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stats-card:nth-child(4) {
  animation-delay: 0.3s;
}
</style>