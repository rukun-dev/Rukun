<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Search Input -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          v-model="localFilters.searchTerm"
          placeholder="Cari No. KK, Kepala Keluarga, Alamat..."
          class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          @input="updateFilters"
        />
        <button
          v-if="localFilters.searchTerm"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg class="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- RT Filter -->
      <select
        v-model="localFilters.rt"
        class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        @change="updateFilters"
      >
        <option value="">Semua RT</option>
        <option value="01">RT 01</option>
        <option value="02">RT 02</option>
        <option value="03">RT 03</option>
        <option value="04">RT 04</option>
        <option value="05">RT 05</option>
      </select>

      <!-- Status Filter -->
      <select
        v-model="localFilters.status"
        class="block w-full px-3 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
        @change="updateFilters"
      >
        <option value="">Semua Status</option>
        <option value="Aktif">Aktif</option>
        <option value="Tidak Aktif">Tidak Aktif</option>
      </select>
    </div>

    <!-- Filter Summary (for mobile) -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">
          <span class="font-medium">Filter:</span> {{ activeFiltersText }}
        </p>
        <button
          @click="resetFilters"
          class="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          <span>Hapus semua</span>
          <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

// Props & Emits
interface FilterType {
  searchTerm: string;
  rt: string;
  status: string;
}

const props = defineProps<{
  modelValue: FilterType;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: FilterType];
}>();

// Local state
const localFilters = ref<FilterType>({ ...props.modelValue });

// Watch for external model changes
watch(
  () => props.modelValue,
  (newValue) => {
    localFilters.value = { ...newValue };
  },
  { deep: true }
);

// Methods
const updateFilters = () => {
  emit('update:modelValue', { ...localFilters.value });
};

const clearSearch = () => {
  localFilters.value.searchTerm = '';
  updateFilters();
};

const resetFilters = () => {
  localFilters.value = {
    searchTerm: '',
    rt: '',
    status: ''
  };
  updateFilters();
};

// Computed properties
const hasActiveFilters = computed(() => {
  return (
    localFilters.value.searchTerm !== '' ||
    localFilters.value.rt !== '' ||
    localFilters.value.status !== ''
  );
});

const activeFiltersText = computed(() => {
  const filters: string[] = [];
  
  if (localFilters.value.searchTerm) {
    filters.push('Pencarian: ' + localFilters.value.searchTerm);
  }
  
  if (localFilters.value.rt) {
    filters.push('RT: ' + localFilters.value.rt);
  }
  
  if (localFilters.value.status) {
    filters.push('Status: ' + localFilters.value.status);
  }
  
  return filters.join(', ');
});
</script>

<style scoped>
/* Styling for filter inputs */
select, input {
  font-family: inherit;
}

/* Animation for clear button */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

button {
  animation: fadeIn 0.2s ease;
}
</style>