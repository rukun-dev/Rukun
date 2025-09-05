<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="lg:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">Cari Warga</label>
        <div class="relative">
          <input
            :value="model.searchTerm"
            @input="setField('searchTerm', $event.target.value)"
            type="text"
            :placeholder="placeholder || 'Cari nama, NIK, atau alamat...'"
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Gender -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
        <select
          :value="model.gender"
          @change="setField('gender', $event.target.value)"
          class="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          :value="model.status"
          @change="setField('status', $event.target.value)"
          class="w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ searchTerm: '', gender: '', status: '' })
  },
  placeholder: { type: String, default: '' },
  genderOptions: {
    type: Array,
    default: () => ([
      { label: 'Semua', value: '' },
      { label: 'Laki-laki', value: 'L' },
      { label: 'Perempuan', value: 'P' }
    ])
  },
  statusOptions: {
    type: Array,
    default: () => ([
      { label: 'Semua', value: '' },
      { label: 'Kepala Keluarga', value: 'Kepala Keluarga' },
      { label: 'Istri', value: 'Istri' },
      { label: 'Anak', value: 'Anak' },
      { label: 'Orang Tua', value: 'Orang Tua' },
      { label: 'Lainnya', value: 'Lainnya' }
    ])
  }
})

const emit = defineEmits(['update:modelValue'])

const model = computed(() => props.modelValue || { searchTerm:'', gender:'', status:'' })
const setField = (key, val) => emit('update:modelValue', { ...model.value, [key]: val })
</script>
