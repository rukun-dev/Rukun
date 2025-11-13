<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Toolbar: Add Payment button (header text removed) -->
      <div class="flex justify-end mb-6">
        <button
          v-if="canManagePayments"
          @click="openAddForm"
          class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pembayaran
        </button>
      </div>

      <!-- Payment Options -->
      <PaymentOptions
        class="mt-2"
        :qrisUrl="qrisUrl"
        :canUpload="canUploadQris"
        @qrisUploaded="onQrisUploaded"
        bankName="Bank BRI"
        accountNumber="1234567890"
        accountHolder="Bendahara RT 01"
        whatsapp="6281234567890"
        note="Cantumkan keterangan: Nama, Blok/Rumah, bulan pembayaran."
      />

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Payments -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Pembayaran</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ totalPayments }}</h3>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 6h18M3 14h18M3 18h18" />
              </svg>
            </div>
          </div>
        </div>
        <!-- Paid -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Telah Dibayar</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ paidCount }}</h3>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <!-- Overdue -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Terlambat</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ overdueCount }}</h3>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-1.414-1.414L12 9.172 7.05 4.222 5.636 5.636 10.586 10.586 5.636 15.536l1.414 1.414L12 12l4.95 4.95 1.414-1.414-4.95-4.95 4.95-4.95z" />
              </svg>
            </div>
          </div>
        </div>
        <!-- Pending -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Menunggu</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ pendingCount }}</h3>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Pembayaran</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="search"
                type="text"
                placeholder="Cari deskripsi..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="statusFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Lunas</option>
              <option value="OVERDUE">Terlambat</option>
              <option value="CANCELLED">Dibatalkan</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <select
              v-model="typeFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
            >
              <option value="">Semua Jenis</option>
              <option value="IURAN_BULANAN">Iuran Bulanan</option>
              <option value="IURAN_KEBERSIHAN">Iuran Kebersihan</option>
              <option value="SUMBANGAN">Sumbangan</option>
              <option value="DENDA">Denda</option>
              <option value="OTHER">Lainnya</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Pembayaran</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredPayments.length }} data
              </span>
              <select
                v-model.number="itemsPerPage"
                class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option :value="10">10 per halaman</option>
                <option :value="25">25 per halaman</option>
                <option :value="50">50 per halaman</option>
              </select>
            </div>
          </div>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Jatuh Tempo</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warga</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (Rp)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" v-if="!loading">
            <tr v-for="p in paginatedPayments" :key="p.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(p.dueDate) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ p.wargaName || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ mapType(p.type) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                <span :class="p.status === 'PAID' ? 'text-green-600' : p.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-700'">
                  {{ currency(p.amount) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm" :class="statusColor(p.status)">{{ mapStatus(p.status) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex space-x-2" :class="{ 'opacity-50 pointer-events-none': !canManagePayments }">
                  <button
                    @click="openEdit(p)"
                    class="text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    @click="askDelete(p)"
                     class="text-red-600 hover:text-red-800 transition-colors"
                     title="Hapus"
                   >
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path
                         stroke-linecap="round"
                         stroke-linejoin="round"
                         stroke-width="2"
                         d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16"
                       />
                     </svg>
                     
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="flex justify-center space-x-2">
                  <div class="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  <div class="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  <div class="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Delete Confirmation Modal -->
        <ConfirmDelete
          v-model="showDelete"
          title="Hapus Pembayaran?"
          message="Apakah Anda yakin ingin menghapus pembayaran ini?"
          :details="toDelete ? `${toDelete.description} • ${currency(toDelete.amount)}` : ''"
          @confirm="confirmDelete"
          @cancel="showDelete = false"
        />

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between" v-if="totalPages > 1">
          <div>
            <button class="px-2 py-1 text-sm" :disabled="currentPage === 1" @click="currentPage = 1">First</button>
            <button class="px-2 py-1 text-sm" :disabled="currentPage === 1" @click="currentPage = currentPage - 1">Previous</button>
            <button
              v-for="page in visiblePages"
              :key="page"
              class="px-3 py-1 text-sm rounded-md"
              :class="page === currentPage ? 'bg-blue-600 text-white' : 'text-gray-700'"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
            <button class="px-2 py-1 text-sm" :disabled="currentPage === totalPages" @click="currentPage = currentPage + 1">Next</button>
            <button class="px-2 py-1 text-sm" :disabled="currentPage === totalPages" @click="currentPage = totalPages">Last</button>
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="ml-3 text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- Modals -->
      <AddPayment
        v-if="!isEditing"
        v-model="isFormOpen"
        :isSubmitting="formSubmitting"
        @save="handleSave"
      />
      <EditPayment
        v-else
        v-model="isFormOpen"
        :payment="form as any"
        :isSubmitting="formSubmitting"
        @save="handleSave"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { usePayments, type Payment } from '@/composables/usePayments'
import { useAuth } from '@/composables/useAuth'
import { currency } from '@/lib/utils'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// QRIS state (diisi saat unggah)
const qrisUrl = ref<string | undefined>(undefined)
const onQrisUploaded = (file: { url: string; id?: string }) => {
  qrisUrl.value = file.url
  toast.success('QRIS berhasil diunggah')
}

// Batasi hak unggah berdasarkan peran
const { userRole, isAuthenticated } = useAuth()
const canUploadQris = computed(() => {
  if (!isAuthenticated.value) return false
  const allowed = ['SUPER_ADMIN', 'BENDAHARA', 'KETUA_RT', 'SEKRETARIS']
  return !!userRole.value && allowed.includes(userRole.value as any)
})

// Batasi tambah/edit/hapus pembayaran untuk WARGA
const canManagePayments = computed(() => {
  if (!isAuthenticated.value) return false
  return (userRole.value as any) !== 'WARGA'
})

const { payments, fetchPayments, addPayment, updatePayment, deletePayment, error, loading } = usePayments()

/* Filters */
const search = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

/* Stats */
const totalPayments = computed(() => payments.value.length)
const paidCount = computed(() => payments.value.filter(p => p.status === 'PAID').length)
const overdueCount = computed(() => payments.value.filter(p => p.status === 'OVERDUE').length)
const pendingCount = computed(() => payments.value.filter(p => p.status === 'PENDING').length)

const filteredPayments = computed(() => {
  return payments.value.filter(p => {
    const matchesSearch = p.description.toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus = statusFilter.value ? p.status === statusFilter.value : true
    const matchesType = typeFilter.value ? p.type === typeFilter.value : true
    return matchesSearch && matchesStatus && matchesType
  })
})

/* Pagination */
const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredPayments.value.length / itemsPerPage.value) || 1)

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredPayments.value.length))

const paginatedPayments = computed(() => {
  return filteredPayments.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const cur = currentPage.value
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else if (end === total) start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

const isFormOpen = ref(false)
const isEditing = ref(false)
const formSubmitting = ref(false)
const form = ref<Payment | null>(null)

onMounted(() => {
  fetchPayments()
})

const openAddForm = () => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak menambah pembayaran')
    return
  }
  isEditing.value = false
  form.value = null
  isFormOpen.value = true
}

const openEdit = (payment: Payment) => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak mengubah pembayaran')
    return
  }
  isEditing.value = true
  form.value = { ...payment }
  isFormOpen.value = true
}

const handleSave = async (payload: Payment) => {
  formSubmitting.value = true
  try {
    if (isEditing.value && form.value) {
      await updatePayment(form.value.id, payload)
      toast.success('Pembayaran berhasil diperbarui')
    } else {
      await addPayment(payload)
      toast.success('Pembayaran berhasil ditambahkan')
    }
    isFormOpen.value = false
  } catch (err) {
    toast.error('Terjadi kesalahan')
  } finally {
    formSubmitting.value = false
  }
}

const showDelete = ref(false)
const toDelete = ref<Payment | null>(null)

const askDelete = (p: Payment) => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak menghapus pembayaran')
    return
  }
  toDelete.value = p
  showDelete.value = true
}

const confirmDelete = async () => {
  if (toDelete.value) {
    try {
      await deletePayment(toDelete.value.id)
      toast.success('Pembayaran berhasil dihapus')
    } catch (err) {
      toast.error('Gagal menghapus pembayaran')
    } finally {
      showDelete.value = false
      toDelete.value = null
    }
  }
}

const formatDate = (d: Date) => {
  const date = new Date(d)
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const mapType = (t: Payment['type']) => {
  switch (t) {
    case 'IURAN_BULANAN':
      return 'Iuran Bulanan'
    case 'IURAN_KEBERSIHAN':
      return 'Iuran Kebersihan'
    case 'SUMBANGAN':
      return 'Sumbangan'
    case 'DENDA':
      return 'Denda'
    default:
      return 'Lainnya'
  }
}

const mapStatus = (s: Payment['status']) => {
  switch (s) {
    case 'PAID':
      return 'Lunas'
    case 'OVERDUE':
      return 'Terlambat'
    case 'CANCELLED':
      return 'Dibatalkan'
    default:
      return 'Pending'
  }
}

const statusColor = (s: Payment['status']) => {
  switch (s) {
    case 'PAID':
      return 'text-green-600'
    case 'OVERDUE':
      return 'text-red-600'
    case 'CANCELLED':
      return 'text-gray-500'
    default:
      return 'text-yellow-600'
  }
}
</script>