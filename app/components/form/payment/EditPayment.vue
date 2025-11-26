<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Edit Pembayaran</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="close">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
          <select v-model="local.type" class="w-full px-3 py-2 border rounded-lg">
            <option value="IURAN_BULANAN">Iuran Bulanan</option>
            <option value="IURAN_KEBERSIHAN">Iuran Kebersihan</option>
            <option value="SUMBANGAN">Sumbangan</option>
            <option value="DENDA">Denda</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="local.description" type="text" class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
          <input
            v-model="amountStr"
            @input="onAmountInput"
            type="text"
            inputmode="numeric"
            class="w-full px-3 py-2 border rounded-lg"
            placeholder="Masukkan jumlah"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Jatuh Tempo</label>
          <input v-model="dueDateStr" type="date" class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <!-- Field Warga dihilangkan dari form edit -->

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="local.status" class="w-full px-3 py-2 border rounded-lg">
            <option value="PENDING">Pending</option>
            <option value="PAID">Lunas</option>
            <option value="OVERDUE">Terlambat</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <button type="button" class="px-4 py-2 rounded-lg border" @click="close">Batal</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Payment } from '@/composables/usePayments'

const props = defineProps<{
  modelValue: boolean
  isSubmitting: boolean
  payment: Payment
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', value: Payment): void
}>()

const local = ref<Payment>({ ...props.payment })
const amountStr = ref<string>('')
const formatThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
amountStr.value = local.value.amount ? formatThousands(String(local.value.amount)) : ''

watch(() => props.payment, (p) => {
  local.value = { ...p }
  amountStr.value = local.value.amount ? formatThousands(String(local.value.amount)) : ''
}, { deep: true })

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const dueDateStr = ref<string>(toDateStr(local.value.dueDate))

watch(dueDateStr, (val) => {
  local.value.dueDate = new Date(val)
})

const close = () => emit('update:modelValue', false)

const onAmountInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value
  const digits = raw.replace(/\D/g, '')
  amountStr.value = digits ? formatThousands(digits) : ''
  local.value.amount = digits ? Number(digits) : 0
}

const onSubmit = () => {
  if (!local.value.description || local.value.amount <= 0) return
  emit('save', { ...local.value })
}
</script>