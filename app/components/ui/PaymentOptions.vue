<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Opsi Pembayaran</h3>
        <p class="text-sm text-gray-600">Silakan pilih metode pembayaran berikut</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- QRIS Card -->
      <div class="rounded-xl border border-gray-200 p-5 bg-gray-50">
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-medium text-gray-900">QRIS Bendahara</h4>
          <div v-if="qrisUrl" class="flex items-center space-x-2">
            <a :href="qrisUrl" download class="text-blue-600 hover:text-blue-800 text-sm">Unduh QRIS</a>
          </div>
        </div>
        <div class="flex items-center justify-center">
          <img v-if="qrisUrl" :src="qrisUrl" alt="QRIS Bendahara" class="w-56 h-56 object-contain rounded-lg shadow" />
          <div v-else class="w-56 h-56 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
            <div class="text-center">
              <div class="text-gray-500 text-sm">QRIS belum diunggah</div>
              <div class="text-[11px] text-gray-400 mt-1">Hubungi bendahara untuk mendapatkan QR</div>
            </div>
          </div>
        </div>
        <div class="mt-4 text-xs text-gray-500">
          Scan QRIS menggunakan aplikasi pembayaran (contoh: m-banking, e-wallet).
        </div>
      </div>

      <!-- Bank Transfer Card -->
      <div class="rounded-xl border border-gray-200 p-5 bg-gray-50">
        <h4 class="font-medium text-gray-900 mb-3">Transfer Rekening</h4>
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Bank</span>
            <span class="text-sm font-medium text-gray-900">{{ bankName }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">No. Rekening</span>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-mono font-semibold text-gray-900">{{ accountNumber }}</span>
              <button @click="copyAccount" class="text-blue-600 hover:text-blue-800 text-xs">Salin</button>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Nama Pemilik</span>
            <span class="text-sm font-medium text-gray-900">{{ accountHolder }}</span>
          </div>
        </div>

        <div class="mt-4 flex items-center space-x-3">
          <button v-if="whatsapp" @click="openWhatsApp" class="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700">
            Konfirmasi via WhatsApp
          </button>
          <span v-if="copied" class="text-xs text-green-700">Nomor rekening tersalin</span>
        </div>

        <p v-if="note" class="mt-4 text-xs text-gray-500">{{ note }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ 
  qrisUrl?: string
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  whatsapp?: string // format: 628xxxxxxxxxx
  note?: string
}>()

const copied = ref(false)

const copyAccount = async () => {
  if (!props.accountNumber) return
  try {
    await navigator.clipboard.writeText(props.accountNumber)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (e) {
    // noop
  }
}

const openWhatsApp = () => {
  if (!props.whatsapp) return
  const text = encodeURIComponent('Halo Bendahara, saya ingin konfirmasi pembayaran iuran.')
  window.open(`https://wa.me/${props.whatsapp}?text=${text}`, '_blank')
}

const bankName = props.bankName ?? '—'
const accountNumber = props.accountNumber ?? '—'
const accountHolder = props.accountHolder ?? '—'
const whatsapp = props.whatsapp
const qrisUrl = props.qrisUrl
const note = props.note
</script>