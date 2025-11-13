<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Page Header removed per request -->

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Transactions -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Transaksi</p>
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ totalTransactions }}</h3>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.04 0-2.05.2-3 .58V7a5 5 0 116 0v1.58A7.968 7.968 0 0012 8z" />
            </svg>
          </div>
        </div>
      </div>
      <!-- Income -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</p>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{{ currency(totalIncome) }}</h3>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </div>
        </div>
      </div>
      <!-- Expense -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</p>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{{ currency(totalExpense) }}</h3>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
      <!-- Balance -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Saldo Saat Ini</p>
            <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{{ currency(balance) }}</h3>
          </div>
          <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3 1.657 0 3-1.343 3-3 0-1.657-1.343-3-3-3z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13c0 3.866-3.582 7-8 7s-8-3.134-8-7" />
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Cari Transaksi</label>
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

        <!-- Category Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select
            v-model="categoryFilter"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
          >
            <option value="">Semua Kategori</option>
            <option value="IURAN_BULANAN">Iuran Bulanan</option>
            <option value="DONASI">Donasi</option>
            <option value="KEGIATAN">Kegiatan</option>
            <option value="KEBERSIHAN_LINGKUNGAN">Kebersihan Lingkungan</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
          <select
            v-model="typeFilter"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
          >
            <option value="">Semua Tipe</option>
            <option value="INCOME">Pemasukan</option>
            <option value="EXPENSE">Pengeluaran</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Data Transaksi</h3>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Menampilkan {{ startIndex + 1 }}-{{ endIndex }} dari {{ filteredTransactions.length }} data
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
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah (Rp)</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200" v-if="!loading">
          <tr v-for="txn in paginatedTransactions" :key="txn.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(txn.date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ getCategoryLabel(txn.category) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ txn.description }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
              <span :class="txn.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'">
                {{ formatCurrency(txn.amount) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                txn.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              ]">{{ txn.type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan' }}</span>
            </td>
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

    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useTransactions } from '../../app/composables/useTransactions'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const {
  transactions,
  loading,
  error,
  fetchTransactions,
  
} = useTransactions()

onMounted(fetchTransactions)

// Helper
const formatDate = (d: Date) => {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(d))
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num)
}

const getCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    'IURAN_BULANAN': 'Iuran Bulanan',
    'DONASI': 'Donasi',
    'KEGIATAN': 'Kegiatan',
    'KEBERSIHAN_LINGKUNGAN': 'Kebersihan Lingkungan'
  }
  return map[cat] || cat
}

// Filters
const search = ref('')
const categoryFilter = ref('')
const typeFilter = ref('')

// Derived filtered list
const filteredTransactions = computed(() => {
  return transactions.value.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.value.toLowerCase())
    const matchesCategory = categoryFilter.value ? t.category === categoryFilter.value : true
    const matchesType = typeFilter.value ? t.type === typeFilter.value : true
    return matchesSearch && matchesCategory && matchesType
  })
})

/* Pagination */
const itemsPerPage = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value) || 1)

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, filteredTransactions.value.length))

const paginatedTransactions = computed(() => {
  return filteredTransactions.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
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
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

// Totals
const totalTransactions = computed(() => filteredTransactions.value.length)
const totalIncome = computed(() => filteredTransactions.value.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0))
const totalExpense = computed(() => filteredTransactions.value.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0))
const balance = computed(() => totalIncome.value - totalExpense.value)

// Currency helper for template (no decimals)
const currency = (val: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val)


// expose to template
// in <script setup> all top-level are exposed automatically

</script>