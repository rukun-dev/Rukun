<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
    <div
      v-for="it in items"
      :key="it.key"
      class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div class="flex items-start justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500 mb-1">{{ it.label }}</p>
          <h3 class="text-3xl font-bold text-gray-900 mb-2">
            {{ formatNumber(it.value) }}
          </h3>
        </div>
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', it.bg]">
          <svg class="w-6 h-6" :class="it.stroke" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Total Kartu Keluarga -->
            <template v-if="it.key === 'total'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </template>

            <!-- Total Anggota -->
            <template v-else-if="it.key === 'members'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </template>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- Keterangan statistik -->
  <div class="text-center mt-4">
    <p class="text-xs text-gray-500">
      * Statistik menampilkan total keseluruhan data keluarga
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';

// Props
interface Stats {
  total?: number;
  members?: number;
  active?: number;
  expired?: number;
}

const props = defineProps({
  stats: {
    type: Object as PropType<Stats>,
    required: true,
    default: () => ({})
  }
});

// Computed
const items = computed(() => [
  { key: 'total',  label: 'Total Kartu Keluarga', value: props.stats.total  ?? 0, bg: 'bg-blue-100',   stroke: 'text-blue-600'   },
  { key: 'members', label: 'Total Anggota Keluarga', value: props.stats.members ?? 0, bg: 'bg-indigo-100', stroke: 'text-indigo-600' }
])

// Methods
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};
</script>

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