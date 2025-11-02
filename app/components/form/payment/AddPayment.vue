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
          Tambah Pembayaran
        </h3>
        <p class="text-gray-600 mt-1">
          Masukkan data pembayaran baru
        </p>
      </div>

      <!-- Form -->
      <form @submit.prevent="onSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 gap-6">
          <!-- Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jatuh Tempo</label>
            <input
              v-model="local.dueDate"
              type="date"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-200"
            />
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Pembayaran</label>
            <select
              v-model="local.type"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-200 appearance-none"
            >
              <option value="IURAN_BULANAN">Iuran Bulanan</option>
              <option value="IURAN_KEBERSIHAN">Iuran Kebersihan</option>
              <option value="SUMBANGAN">Sumbangan</option>
              <option value="DENDA">Denda</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              v-model="local.description"
              rows="2"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors border-gray-200"
              placeholder="Masukkan deskripsi pembayaran"
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

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              v-model="local.status"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white border-gray-200 appearance-none"
            >
              <option value="PENDING">Menunggu</option>
              <option value="PAID">Lunas</option>
              <option value="OVERDUE">Terlambat</option>
              <option value="CANCELLED">Dibatalkan</option>
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
            {{ isSubmitting ? 'Menambahkan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { Payment } from '@/composables/usePayments'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const local = reactive<Payment>({
  id: '',
  type: 'IURAN_BULANAN',
  amount: 0,
  description: '',
  dueDate: new Date(),
  paidDate: null,
  status: 'PENDING',
})

// close modal
const close = () => emit('update:modelValue', false)

const onSubmit = () => {
  emit('save', { ...local })
}
</script>