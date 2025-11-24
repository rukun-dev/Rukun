<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    @click.self="close"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">
          {{ isEditing ? 'Edit Transaksi' : 'Tambah Transaksi' }}
        </h3>
        <p class="text-gray-600 mt-1">
          {{ isEditing ? 'Perbarui data transaksi' : 'Masukkan data transaksi baru' }}
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
            <input
              v-model="local.date"
              type="date"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-200"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
            <select
              v-model="local.category"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-200 appearance-none"
            >
              <option value="IURAN_BULANAN">Iuran Bulanan</option>
              <option value="DONASI">Donasi</option>
              <option value="KEGIATAN">Kegiatan</option>
              <option value="KEBERSIHAN_LINGKUNGAN">Kebersihan Lingkungan</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              v-model="local.description"
              rows="2"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-200"
              placeholder="Masukkan deskripsi transaksi"
            ></textarea>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jumlah (Rp)</label>
            <input
              v-model.number="local.amount"
              type="number"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-200"
              placeholder="Masukkan jumlah"
            />
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipe</label>
            <select
              v-model="local.type"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-200 appearance-none"
            >
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? (isEditing ? 'Menyimpan...' : 'Menambahkan...') : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import type { Transaction } from '@/composables/useTransactions'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  transaction: {
    type: Object as () => Transaction | null,
    default: null,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const local = reactive<Transaction>({
  id: '',
  type: 'INCOME',
  category: 'IURAN_BULANAN',
  amount: 0,
  description: '',
  date: new Date(),
})

watch(
  () => props.transaction,
  (val) => {
    if (val) {
      Object.assign(local, val)
    } else {
      // reset
      local.id = ''
      local.type = 'INCOME'
      local.category = 'IURAN_BULANAN'
      local.amount = 0
      local.description = ''
      local.date = new Date()
    }
  },
  { immediate: true }
)

// for closing
const close = () => {
  emit('update:modelValue', false)
}

const isEditing = computed(() => !!props.transaction)

const onSubmit = () => {
  emit('save', { ...local })
}
</script>