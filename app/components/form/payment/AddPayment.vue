<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div class="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Tambah Pembayaran</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="close">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
          <select v-model="form.type" class="w-full px-3 py-2 border rounded-lg">
            <option value="IURAN_BULANAN">Iuran Bulanan</option>
            <option value="IURAN_KEBERSIHAN">Iuran Kebersihan</option>
            <option value="SUMBANGAN">Sumbangan</option>
            <option value="DENDA">Denda</option>
            <option value="OTHER">Lainnya</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <input v-model="form.description" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Deskripsi pembayaran" />
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

        <!-- Target Pembayar: Pilih peran yang perlu membayar (multi-select) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Siapa yang perlu membayar?</label>
          <div class="grid grid-cols-2 gap-2">
            <label class="flex items-center space-x-2">
              <input type="checkbox" value="WARGA" v-model="selectedRoles" />
              <span>Warga</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" value="KETUA_RT" v-model="selectedRoles" />
              <span>Ketua RT</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" value="BENDAHARA" v-model="selectedRoles" />
              <span>Bendahara</span>
            </label>
            <label class="flex items-center space-x-2">
              <input type="checkbox" value="SEKRETARIS" v-model="selectedRoles" />
              <span>Sekretaris</span>
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-1">SUPER_ADMIN selalu dikecualikan.</p>
        </div>

        <div class="flex items-center justify-end space-x-3 pt-2">
          <button type="button" class="px-4 py-2 rounded-lg border" @click="close">Batal</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 text-white" :disabled="isSubmitting">
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
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
}>()

type BulkPaymentInput = Pick<Payment, 'type' | 'description' | 'amount' | 'dueDate' | 'status'>
type RoleOption = 'WARGA' | 'KETUA_RT' | 'BENDAHARA' | 'SEKRETARIS'
type BulkPaymentWithRoles = Pick<Payment, 'type' | 'description' | 'amount' | 'dueDate' | 'status'> & {
  roles?: RoleOption[]
}

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'save', value: Payment): void
  (e: 'saveBulk', value: BulkPaymentWithRoles): void
}>()

const today = new Date()
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
const toDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const form = ref<Payment>({
  id: '',
  type: 'IURAN_BULANAN',
  amount: 0,
  description: '',
  dueDate: today,
  paidDate: null,
  status: 'PENDING',
  wargaName: ''
})

const dueDateStr = ref<string>(toDateStr(today))
const amountStr = ref<string>('')
const selectedRoles = ref<RoleOption[]>(['WARGA'])

const formatThousands = (digits: string) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const onAmountInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value
  const digits = raw.replace(/\D/g, '')
  amountStr.value = digits ? formatThousands(digits) : ''
  form.value.amount = digits ? Number(digits) : 0
}

watch(() => props.modelValue, (open) => {
  if (open) {
    amountStr.value = form.value.amount ? formatThousands(String(form.value.amount)) : ''
  } else {
    amountStr.value = ''
  }
})

watch(dueDateStr, (val) => {
  form.value.dueDate = new Date(val)
})

const close = () => emit('update:modelValue', false)

const onSubmit = () => {
  // Basic validation
  if (!form.value.description || form.value.amount <= 0) return
  const payload: BulkPaymentWithRoles = {
    type: form.value.type,
    description: form.value.description,
    amount: form.value.amount,
    dueDate: form.value.dueDate,
    status: form.value.status,
    roles: selectedRoles.value,
  }
  emit('saveBulk', payload)
}
</script>