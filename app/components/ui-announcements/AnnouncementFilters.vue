<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Search Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cari Pengumuman</label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            v-model="searchTerm"
            placeholder="Cari judul atau isi..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Type Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Pengumuman</label>
        <select
          v-model="selectedType"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          @change="handleFilterChange"
        >
          <option value="">Semua Tipe</option>
          <option value="INFO">Informasi</option>
          <option value="WARNING">Peringatan</option>
          <option value="URGENT">Darurat</option>
          <option value="EVENT">Acara</option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          v-model="selectedStatus"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
          @change="handleFilterChange"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak Aktif</option>
        </select>
      </div>
    </div>

    <!-- Priority Filter (Visible on larger screens) -->
    <div class="mt-4 hidden md:block">
      <label class="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
      <div class="flex gap-3">
        <button
          v-for="priority in priorities"
          :key="priority.value"
          :class="[
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
            selectedPriorities.includes(priority.value)
              ? `bg-${priority.color}-100 text-${priority.color}-800 border border-${priority.color}-300`
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          ]"
          @click="togglePriority(priority.value)"
        >
          {{ priority.label }}
        </button>
      </div>
    </div>

    <!-- Active Filters Summary -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Filter yang diterapkan:</span>
        <span v-if="searchTerm" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
          {{ searchTerm }}
          <button @click="clearSearch" class="ml-1 text-blue-600 hover:text-blue-800">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span v-if="selectedType" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          {{ getTypeLabel(selectedType) }}
          <button @click="clearType" class="ml-1 text-green-600 hover:text-green-800">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span v-if="selectedStatus" class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
          {{ selectedStatus === 'active' ? 'Aktif' : 'Tidak Aktif' }}
          <button @click="clearStatus" class="ml-1 text-purple-600 hover:text-purple-800">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <span 
          v-for="priority in selectedPriorities" 
          :key="priority"
          class="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
          :class="getPriorityBadgeClass(priority)"
        >
          {{ getPriorityLabel(priority) }}
          <button @click="togglePriority(priority)" class="ml-1" :class="getPriorityIconClass(priority)">
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <button
          @click="clearAllFilters"
          class="text-xs text-blue-600 hover:text-blue-800 ml-auto"
        >
          Hapus semua
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

// Props
const props = defineProps<{
  modelValue?: {
    search?: string;
    type?: string;
    status?: string;
    priorities?: string[];
  };
}>();

// Emits
const emit = defineEmits<{
  'update:modelValue': [filters: {
    search?: string;
    type?: string;
    status?: string;
    priorities?: string[];
  }];
  'change': [filters: {
    search?: string;
    type?: string;
    status?: string;
    priorities?: string[];
  }];
}>();

// Local state
const searchTerm = ref(props.modelValue?.search || '');
const selectedType = ref(props.modelValue?.type || '');
const selectedStatus = ref(props.modelValue?.status || '');
const selectedPriorities = ref(props.modelValue?.priorities || []);

// Priority options
const priorities = ref([
  { value: 'LOW', label: 'Rendah', color: 'gray' },
  { value: 'NORMAL', label: 'Normal', color: 'blue' },
  { value: 'HIGH', label: 'Tinggi', color: 'amber' },
  { value: 'URGENT', label: 'Darurat', color: 'red' }
]);

// Computed
const hasActiveFilters = computed(() => {
  return searchTerm.value || selectedType.value || selectedStatus.value || selectedPriorities.value.length > 0;
});

const currentFilters = computed(() => ({
  search: searchTerm.value,
  type: selectedType.value,
  status: selectedStatus.value,
  priorities: selectedPriorities.value
}));

// Methods
const handleSearch = () => {
  emitUpdate();
};

const handleFilterChange = () => {
  emitUpdate();
};

const togglePriority = (priority: string) => {
  const index = selectedPriorities.value.indexOf(priority);
  if (index > -1) {
    selectedPriorities.value.splice(index, 1);
  } else {
    selectedPriorities.value.push(priority);
  }
  emitUpdate();
};

const clearSearch = () => {
  searchTerm.value = '';
  emitUpdate();
};

const clearType = () => {
  selectedType.value = '';
  emitUpdate();
};

const clearStatus = () => {
  selectedStatus.value = '';
  emitUpdate();
};

const clearAllFilters = () => {
  searchTerm.value = '';
  selectedType.value = '';
  selectedStatus.value = '';
  selectedPriorities.value = [];
  emitUpdate();
};

const emitUpdate = () => {
  emit('update:modelValue', currentFilters.value);
  emit('change', currentFilters.value);
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'INFO': 'Informasi',
    'WARNING': 'Peringatan',
    'URGENT': 'Darurat',
    'EVENT': 'Acara'
  };
  return labels[type] || type;
};

const getPriorityLabel = (priority: string): string => {
  const priorityObj = priorities.value.find(p => p.value === priority);
  return priorityObj ? priorityObj.label : priority;
};

const getPriorityBadgeClass = (priority: string): string => {
  const priorityObj = priorities.value.find(p => p.value === priority);
  return priorityObj ? `bg-${priorityObj.color}-100 text-${priorityObj.color}-800` : 'bg-gray-100 text-gray-800';
};

const getPriorityIconClass = (priority: string): string => {
  const priorityObj = priorities.value.find(p => p.value === priority);
  return priorityObj ? `text-${priorityObj.color}-600 hover:text-${priorityObj.color}-800` : 'text-gray-600 hover:text-gray-800';
};

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchTerm.value = newValue.search || '';
    selectedType.value = newValue.type || '';
    selectedStatus.value = newValue.status || '';
    selectedPriorities.value = newValue.priorities || [];
  }
}, { deep: true });
</script>