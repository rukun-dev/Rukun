<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div
      v-for="it in items"
      :key="it.key"
      class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 text-sm font-medium">{{ it.label }}</p>
          <p class="text-3xl font-bold text-gray-900">{{ it.value }}</p>
        </div>

        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center', it.bg]">
          <svg class="w-6 h-6" :class="it.stroke" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <!-- Total -->
            <template v-if="it.key === 'total'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
            </template>

            <!-- Laki-laki -->
            <template v-else-if="it.key === 'male'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </template>

            <!-- Perempuan -->
            <template v-else-if="it.key === 'female'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </template>

            <!-- Kepala Keluarga -->
            <template v-else-if="it.key === 'heads'">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </template>
          </svg>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Keterangan statistik -->
  <div class="text-center mt-4">
    <p class="text-xs text-gray-500">
      * Statistik menampilkan total keseluruhan data warga
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // { total:number, male:number, female:number, heads:number }
  stats: {
    type: Object,
    required: true,
    default: () => ({ total: 0, male: 0, female: 0, heads: 0 })
  }
})

const items = computed(() => [
  { key: 'total',  label: 'Total Warga',     value: props.stats.total  ?? 0, bg: 'bg-blue-100',   stroke: 'text-blue-600'   },
  { key: 'male',   label: 'Laki-laki',       value: props.stats.male   ?? 0, bg: 'bg-green-100',  stroke: 'text-green-600'  },
  { key: 'female', label: 'Perempuan',       value: props.stats.female ?? 0, bg: 'bg-pink-100',   stroke: 'text-pink-600'   },
  { key: 'heads',  label: 'Kepala Keluarga', value: props.stats.heads  ?? 0, bg: 'bg-purple-100', stroke: 'text-purple-600' }
])
</script>
