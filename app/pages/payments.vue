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
              <button
                v-if="canManagePayments"
                @click="openManageAll"
                class="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v8m4-4H8" />
                </svg>
                <span>Kelola Semua</span>
              </button>
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
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="5" class="px-6 py-8 text-center">
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

        <!-- Bulk Delete Confirmation Modal -->
        <ConfirmDelete
          v-model="showDeleteBulk"
          title="Hapus Massal Pembayaran?"
          :message="deleteBulkMessage"
          :details="deleteBulkDetails"
          @confirm="confirmDeleteBulk"
          @cancel="showDeleteBulk = false"
        />

        <!-- Manage Modal (Edit + Hapus dengan filter) -->
        <div v-if="showManage" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold text-gray-900">Kelola Pembayaran</h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ manageTarget ? (manageTarget.description + ' • ' + currency(manageTarget.amount)) : '' }}
            </p>

            <div v-if="bulkManageMode" class="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Item {{ manageIndex + 1 }} dari {{ manageList.length }}</span>
              <div class="space-x-2">
                <button
                  class="px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
                  :disabled="manageIndex === 0"
                  @click="managePrev"
                >Sebelumnya</button>
                <button
                  class="px-3 py-1 rounded-md border border-gray-300 text-gray-700 disabled:opacity-50"
                  :disabled="manageIndex >= manageList.length - 1"
                  @click="manageNext"
                >Berikutnya</button>
              </div>
            </div>

            <!-- Filter Waktu untuk Kelola Semua + Hapus Massal -->
            <div v-if="bulkManageMode" class="mt-4 border border-gray-200 rounded-lg p-3">
              <label class="text-sm font-medium text-gray-900">Filter Waktu</label>
              <div class="mt-2 grid grid-cols-1 gap-3">
                <div>
                  <div class="flex items-center space-x-4 text-sm text-gray-700">
                    <label class="flex items-center space-x-2">
                      <input type="radio" class="form-radio" value="MONTH" v-model="bulkDeleteMode" />
                      <span>Bulan</span>
                    </label>
                    <label class="flex items-center space-x-2">
                      <input type="radio" class="form-radio" value="DATE" v-model="bulkDeleteMode" />
                      <span>Tanggal</span>
                    </label>
                  </div>
                </div>
                <div v-if="bulkDeleteMode === 'MONTH'">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Bulan</label>
                  <input type="month" v-model="bulkDeleteMonth" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div v-else>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Tanggal</label>
                  <input type="date" v-model="bulkDeleteDate" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <button
                  class="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  @click="applyManageFilter"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L14 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 018 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                  </svg>
                  <span>Terapkan Filter</span>
                </button>
                <button
                  class="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  @click="askDeleteBulk"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16" />
                  </svg>
                  <span>Hapus Semua (Terfilter)</span>
                </button>
              </div>
            </div>

            <div class="mt-4 space-y-4">
              <button
                class="w-full inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                @click="doEditFromManage"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit</span>
              </button>

              <div class="border border-gray-200 rounded-lg p-3">
                <label class="text-sm font-medium text-gray-900">Filter Hapus</label>
                <div class="mt-2 space-y-2 text-sm text-gray-700">
                  <label class="flex items-center space-x-2">
                    <input type="radio" class="form-radio" value="PENDING_ONLY" v-model="deleteFilter" />
                    <span>Hanya status Pending</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" class="form-radio" value="PENDING_OR_OVERDUE" v-model="deleteFilter" />
                    <span>Pending atau Terlambat</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input type="radio" class="form-radio" value="ALL" v-model="deleteFilter" />
                    <span>Semua status</span>
                  </label>
                </div>
                <button
                  class="mt-3 w-full inline-flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  @click="doDeleteWithFilter"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16" />
                  </svg>
                  <span>Hapus sesuai filter</span>
                </button>
              </div>
            </div>

            <div class="mt-5 flex justify-end">
              <button class="px-4 py-2 text-gray-700 hover:text-gray-900" @click="showManage = false; manageTarget = null; bulkManageMode = false; manageIndex = 0">Tutup</button>
            </div>
          </div>
        </div>

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
        @saveBulk="handleSaveBulk"
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

// Manage modal state
const showManage = ref(false)
const manageTarget = ref<Payment | null>(null)
type DeleteFilter = 'PENDING_ONLY' | 'PENDING_OR_OVERDUE' | 'ALL'
const deleteFilter = ref<DeleteFilter>('PENDING_ONLY')
// Bulk delete state
type BulkDeleteMode = 'MONTH' | 'DATE'
const bulkDeleteMode = ref<BulkDeleteMode>('MONTH')
const bulkDeleteMonth = ref<string>('') // YYYY-MM
const bulkDeleteDate = ref<string>('') // YYYY-MM-DD
const bulkDeleteSubmitting = ref(false)
const showDeleteBulk = ref(false)
const deleteBulkMessage = computed(() => bulkDeleteMode.value === 'MONTH' ? 'Menghapus semua pembayaran pada bulan terpilih.' : 'Menghapus semua pembayaran pada tanggal terpilih.')
const deleteBulkDetails = ref<string>('')
// Bulk manage state
const bulkManageMode = ref(false)
const manageIndex = ref(0)
const manageList = computed(() => {
  let base = filteredPayments.value
  // Terapkan filter waktu hanya saat mode kelola massal aktif
  if (bulkManageMode.value) {
    if (bulkDeleteMode.value === 'MONTH' && bulkDeleteMonth.value) {
      const [yearStr, monthStr] = bulkDeleteMonth.value.split('-')
      const y = Number(yearStr)
      const m = Number(monthStr)
      base = base.filter(p => {
        const d = new Date(p.dueDate)
        return d.getFullYear() === y && (d.getMonth() + 1) === m
      })
    } else if (bulkDeleteMode.value === 'DATE' && bulkDeleteDate.value) {
      const target = new Date(bulkDeleteDate.value)
      const ty = target.getFullYear()
      const tm = target.getMonth()
      const td = target.getDate()
      base = base.filter(p => {
        const d = new Date(p.dueDate)
        return d.getFullYear() === ty && d.getMonth() === tm && d.getDate() === td
      })
    }
  }
  return base
})

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

const openManage = (payment: Payment) => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak mengelola pembayaran')
    return
  }
  bulkManageMode.value = false
  manageTarget.value = { ...payment }
  deleteFilter.value = 'PENDING_ONLY'
  showManage.value = true
}

const openManageAll = () => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak mengelola pembayaran')
    return
  }
  if (manageList.value.length === 0) {
    toast.error('Tidak ada pembayaran untuk dikelola')
    return
  }
  bulkManageMode.value = true
  manageIndex.value = 0
  deleteFilter.value = 'PENDING_ONLY'
  const firstItem = manageList.value[manageIndex.value]
  if (!firstItem) {
    toast.error('Tidak ada pembayaran untuk dikelola')
    bulkManageMode.value = false
    return
  }
  manageTarget.value = { ...firstItem }
  showManage.value = true
}

const applyManageFilter = () => {
  // Validasi input filter waktu
  if (bulkDeleteMode.value === 'MONTH') {
    if (!bulkDeleteMonth.value) {
      toast.error('Pilih bulan terlebih dahulu')
      return
    }
  } else {
    if (!bulkDeleteDate.value) {
      toast.error('Pilih tanggal terlebih dahulu')
      return
    }
  }
  // Reset ke item pertama dari daftar terfilter
  manageIndex.value = 0
  const first = manageList.value[0]
  if (!first) {
    manageTarget.value = null
    toast.error('Tidak ada item sesuai filter')
    return
  }
  manageTarget.value = { ...first }
}

const doEditFromManage = () => {
  if (manageTarget.value) {
    openEdit(manageTarget.value)
    showManage.value = false
    manageTarget.value = null
  }
}

const doDeleteWithFilter = () => {
  const p = manageTarget.value
  if (!p) return
  const allowed =
    deleteFilter.value === 'ALL' ? true :
    deleteFilter.value === 'PENDING_OR_OVERDUE' ? (p.status === 'PENDING' || p.status === 'OVERDUE') :
    deleteFilter.value === 'PENDING_ONLY' ? p.status === 'PENDING' : false

  if (!allowed) {
    toast.error('Pembayaran tidak memenuhi kriteria penghapusan')
    return
  }
  askDelete(p)
  showManage.value = false
  manageTarget.value = null
}

const askDeleteBulk = () => {
  if (!canManagePayments.value) {
    toast.error('Anda tidak berhak menghapus pembayaran')
    return
  }
  if (bulkDeleteMode.value === 'MONTH') {
    if (!bulkDeleteMonth.value) {
      toast.error('Pilih bulan terlebih dahulu')
      return
    }
    const [yearStr, monthStr] = bulkDeleteMonth.value.split('-')
    if (!yearStr || !monthStr) {
      toast.error('Format bulan tidak valid')
      return
    }
    deleteBulkDetails.value = `Bulan: ${monthStr}-${yearStr}`
  } else {
    if (!bulkDeleteDate.value) {
      toast.error('Pilih tanggal terlebih dahulu')
      return
    }
    deleteBulkDetails.value = `Tanggal: ${bulkDeleteDate.value}`
  }
  showDeleteBulk.value = true
}

const confirmDeleteBulk = async () => {
  bulkDeleteSubmitting.value = true
  try {
    const body: any = {}
    if (bulkDeleteMode.value === 'MONTH') {
      const [yearStr, monthStr] = bulkDeleteMonth.value.split('-')
      body.year = Number(yearStr)
      body.month = Number(monthStr)
    } else {
      body.date = bulkDeleteDate.value
    }
    await $fetch('/api/finances/manage/payments/bulk', { method: 'DELETE', body })
    await fetchPayments()
    toast.success('Pembayaran massal berhasil dihapus')
    showDeleteBulk.value = false
    deleteBulkDetails.value = ''
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Gagal menghapus pembayaran massal'
    toast.error(msg)
  } finally {
    bulkDeleteSubmitting.value = false
  }
}

const manageNext = () => {
  if (!bulkManageMode.value) return
  if (manageIndex.value >= manageList.value.length - 1) return
  manageIndex.value = Math.min(manageIndex.value + 1, manageList.value.length - 1)
  const nextItem = manageList.value[manageIndex.value]
  if (nextItem) manageTarget.value = { ...nextItem }
}

const managePrev = () => {
  if (!bulkManageMode.value) return
  if (manageIndex.value <= 0) return
  manageIndex.value = Math.max(manageIndex.value - 1, 0)
  const prevItem = manageList.value[manageIndex.value]
  if (prevItem) manageTarget.value = { ...prevItem }
}

const handleSave = async (payload: Payment) => {
  formSubmitting.value = true
  try {
    if (isEditing.value && form.value) {
      const { id: _ignored, ...rest } = payload
      await updatePayment(form.value.id, rest)
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

type BulkPaymentInput = Pick<Payment, 'type' | 'description' | 'amount' | 'dueDate' | 'status'>
const handleSaveBulk = async (payload: BulkPaymentInput) => {
  formSubmitting.value = true
  try {
    if (!canManagePayments.value) {
      toast.error('Anda tidak berhak menambah pembayaran')
      return
    }
    await $fetch('/api/finances/manage/payments/bulk', {
      method: 'POST',
      body: {
        type: payload.type,
        description: payload.description,
        amount: payload.amount,
        dueDate: payload.dueDate,
        status: payload.status,
        // @ts-ignore: roles dikirim dari AddPayment.vue sebagai array string
        roles: (payload as any).roles || ['WARGA']
      }
    })
    await fetchPayments()
    toast.success('Pembayaran iuran untuk semua warga (kecuali super admin) berhasil dibuat')
    isFormOpen.value = false
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Gagal membuat pembayaran massal'
    toast.error(msg)
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
      // Jika sedang mode bulk, buka kembali modal Kelola untuk item berikutnya
      if (bulkManageMode.value) {
        if (manageList.value.length === 0) {
          bulkManageMode.value = false
          showManage.value = false
          manageTarget.value = null
          manageIndex.value = 0
        } else {
          // Pastikan indeks tidak melewati batas setelah data berubah
          manageIndex.value = Math.min(manageIndex.value, Math.max(0, manageList.value.length - 1))
          const current = manageList.value[manageIndex.value]
          if (current) {
            manageTarget.value = { ...current }
            showManage.value = true
          } else {
            bulkManageMode.value = false
            manageTarget.value = null
            showManage.value = false
            manageIndex.value = 0
          }
        }
      }
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