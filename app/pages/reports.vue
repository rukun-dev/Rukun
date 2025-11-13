<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Laporan & Ringkasan</h1>
          <p class="text-gray-500 mt-1">Ikhtisar data penting dari berbagai modul</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Dummy Data</span>
          <span class="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Hanya Laporan (read-only)</span>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Keuangan: Saldo -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Saldo Saat Ini</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ currency(balance) }}</h3>
              <p class="text-xs text-gray-500">Pendapatan {{ currency(totalIncome) }} • Pengeluaran {{ currency(totalExpense) }}</p>
            </div>
            <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3 1.657 0 3-1.343 3-3 0-1.657-1.343-3-3-3z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13c0 3.866-3.582 7-8 7s-8-3.134-8-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pembayaran: Status -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Ringkasan Pembayaran</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ payments.length }} total</h3>
              <p class="text-xs text-gray-500">Paid {{ paidCount }} • Pending {{ pendingCount }} • Overdue {{ overdueCount }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Dokumen: Status -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Ringkasan Dokumen</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ documents.length }} total</h3>
              <p class="text-xs text-gray-500">Approved {{ docApproved }} • Pending {{ docPending }} • Rejected {{ docRejected }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M7 8h10m2 0a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h14z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pengumuman & Warga -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Warga & Pengumuman</p>
              <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ totalResidents }} warga</h3>
              <p class="text-xs text-gray-500">Aktif {{ activeResidents }} • Pengumuman Aktif {{ activeAnnouncements }}</p>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-3-3h-4m-4 5H2v-2a3 3 0 013-3h4m3-3a3 3 0 110-6 3 3 0 010 6zm7 3a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Keuangan: Tabel Transaksi Terbaru -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto mb-8">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Transaksi Terbaru</h3>
            <span class="text-sm text-gray-600">Menampilkan {{ recentTransactions.length }} transaksi</span>
          </div>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="t in recentTransactions" :key="t.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(t.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ t.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ t.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                <span :class="t.type === 'EXPENSE' ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(t.amount) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  t.type === 'EXPENSE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                ]">{{ t.type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan' }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pembayaran: Ringkasan Status -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto mb-8">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Status Pembayaran</h3>
            <span class="text-sm text-gray-600">Total {{ payments.length }} pembayaran</span>
          </div>
        </div>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warga</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="p in payments" :key="p.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ p.wargaName || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ p.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">{{ formatCurrency(p.amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="statusBadgeClass(p.status)">{{ mapStatus(p.status) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(p.dueDate) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Dokumen & Pengumuman: Ringkasan Terbaru -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dokumen -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Dokumen Terbaru</h3>
            <span class="text-sm text-gray-600">{{ recentDocuments.length }} dokumen</span>
          </div>
          <ul class="divide-y divide-gray-200">
            <li v-for="d in recentDocuments" :key="d.id" class="px-6 py-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ d.title }}</p>
                <p class="text-xs text-gray-500">No. {{ d.number }} • {{ d.type }}</p>
              </div>
              <span :class="docBadgeClass(d.status)">{{ d.status }}</span>
            </li>
          </ul>
        </div>

        <!-- Pengumuman -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Pengumuman Terakhir</h3>
            <span class="text-sm text-gray-600">{{ recentAnnouncements.length }} pengumuman</span>
          </div>
          <ul class="divide-y divide-gray-200">
            <li v-for="a in recentAnnouncements" :key="a.id" class="px-6 py-4">
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-gray-900">{{ a.title }}</p>
                <span :class="annBadgeClass(a.type)">{{ a.type }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">Prioritas: {{ a.priority }} • {{ a.isActive ? 'Aktif' : 'Nonaktif' }}</p>
              <p class="text-sm text-gray-700 mt-2 line-clamp-2">{{ a.content }}</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Transaction } from '@/composables/useTransactions'
import type { Payment } from '@/composables/usePayments'
import type { Document } from '~/types/document'
import type { Announcement } from '~/types/announcement'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Dummy data sources (sinkron dengan bentuk data di modul terkait)
const transactions = ref<Transaction[]>([])
const payments = ref<Payment[]>([])
const documents = ref<Document[]>([])
const announcements = ref<Announcement[]>([])
const residents = ref<{ id: string; name: string; isActive: boolean }[]>([])

// Seed dummy
const seedData = () => {
  transactions.value = [
    { id: 'txn_10', type: 'INCOME', category: 'IURAN_BULANAN', amount: 75000, description: 'Iuran Maret', date: new Date('2024-03-05'), wargaName: 'Rina' },
    { id: 'txn_11', type: 'EXPENSE', category: 'KEBERSIHAN_LINGKUNGAN', amount: 50000, description: 'Pembelian sapu', date: new Date('2024-03-06') },
    { id: 'txn_12', type: 'INCOME', category: 'DONASI', amount: 150000, description: 'Donasi RW', date: new Date('2024-03-08'), wargaName: 'RW 01' },
    { id: 'txn_13', type: 'EXPENSE', category: 'KEGIATAN', amount: 120000, description: 'Dekor lomba', date: new Date('2024-03-10') },
    { id: 'txn_14', type: 'INCOME', category: 'IURAN_BULANAN', amount: 50000, description: 'Iuran April', date: new Date('2024-04-02'), wargaName: 'Andi' }
  ]

  payments.value = [
    { id: 'pay_10', type: 'IURAN_BULANAN', amount: 50000, description: 'Iuran Maret', dueDate: new Date('2024-03-30'), paidDate: new Date('2024-03-20'), status: 'PAID', wargaName: 'Rina' },
    { id: 'pay_11', type: 'IURAN_BULANAN', amount: 50000, description: 'Iuran April', dueDate: new Date('2024-04-30'), paidDate: null, status: 'PENDING', wargaName: 'Andi' },
    { id: 'pay_12', type: 'DENDA', amount: 10000, description: 'Denda keterlambatan', dueDate: new Date('2024-03-15'), paidDate: null, status: 'OVERDUE', wargaName: 'Budi' }
  ]

  documents.value = [
    { id: 'doc_10', title: 'Surat Domisili', number: 'SD-001', type: 'DOMISILI', content: '-', status: 'APPROVED', created_at: '2024-03-01', updated_at: '2024-03-02', approved_at: '2024-03-02', rejected_at: null, rejected_reason: null },
    { id: 'doc_11', title: 'Surat Pengantar', number: 'SP-112', type: 'PENGANTAR', content: '-', status: 'PENDING', created_at: '2024-03-05', updated_at: '2024-03-05', approved_at: null, rejected_at: null, rejected_reason: null },
    { id: 'doc_12', title: 'Surat Keterangan', number: 'SK-777', type: 'KETERANGAN', content: '-', status: 'REJECTED', created_at: '2024-03-07', updated_at: '2024-03-08', approved_at: null, rejected_at: '2024-03-08', rejected_reason: 'Data tidak lengkap' }
  ]

  announcements.value = [
    { id: 'ann_10', title: 'Kerja Bakti', content: 'Kerja bakti Minggu depan jam 7 pagi.', type: 'EVENT', priority: 'NORMAL', isActive: true, createdAt: '2024-03-01', updatedAt: '2024-03-01', createdBy: { id: 'u1', name: 'Ketua RT', role: 'KETUA_RT' } },
    { id: 'ann_11', title: 'Peringatan Sampah', content: 'Mohon tidak membuang sampah sembarangan.', type: 'WARNING', priority: 'HIGH', isActive: true, createdAt: '2024-03-04', updatedAt: '2024-03-04', createdBy: { id: 'u2', name: 'Sekretaris', role: 'SEKRETARIS' } },
    { id: 'ann_12', title: 'Info Tagihan', content: 'Iuran bulan ini jatuh tempo tanggal 30.', type: 'INFO', priority: 'NORMAL', isActive: false, createdAt: '2024-03-07', updatedAt: '2024-03-07', createdBy: { id: 'u3', name: 'Bendahara', role: 'BENDAHARA' } }
  ]

  residents.value = [
    { id: 'w1', name: 'Rina', isActive: true },
    { id: 'w2', name: 'Andi', isActive: true },
    { id: 'w3', name: 'Budi', isActive: false },
    { id: 'w4', name: 'Siti', isActive: true },
    { id: 'w5', name: 'Joko', isActive: true }
  ]
}

onMounted(seedData)

/* Derived metrics */
const totalIncome = computed(() =>
  transactions.value
    .filter((t: Transaction) => t.type === 'INCOME')
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0)
)
const totalExpense = computed(() =>
  transactions.value
    .filter((t: Transaction) => t.type === 'EXPENSE')
    .reduce((acc: number, t: Transaction) => acc + t.amount, 0)
)
const balance = computed(() => totalIncome.value - totalExpense.value)

const paidCount = computed(() => payments.value.filter((p: Payment) => p.status === 'PAID').length)
const pendingCount = computed(() => payments.value.filter((p: Payment) => p.status === 'PENDING').length)
const overdueCount = computed(() => payments.value.filter((p: Payment) => p.status === 'OVERDUE').length)

const docApproved = computed(() => documents.value.filter((d: Document) => d.status === 'APPROVED').length)
const docPending = computed(() => documents.value.filter((d: Document) => d.status === 'PENDING').length)
const docRejected = computed(() => documents.value.filter((d: Document) => d.status === 'REJECTED').length)

const activeAnnouncements = computed(() => announcements.value.filter((a: Announcement) => a.isActive).length)
const totalResidents = computed(() => residents.value.length)
const activeResidents = computed(() => residents.value.filter(r => r.isActive).length)

const recentTransactions = computed(() => transactions.value.slice(0, 5))
const recentDocuments = computed(() => documents.value.slice(0, 5))
const recentAnnouncements = computed(() => announcements.value.slice(0, 5))

/* Helpers */
const currency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val)
const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val)
const formatDate = (d: Date | string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(d))

const statusBadgeClass = (status: Payment['status']) => {
  switch (status) {
    case 'PAID': return 'px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800'
    case 'PENDING': return 'px-2 inline-flex text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800'
    case 'OVERDUE': return 'px-2 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800'
    default: return 'px-2 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
  }
}

const statusLabelMap: Record<string, string> = {
  PAID: 'Lunas',
  PENDING: 'Menunggu',
  OVERDUE: 'Terlambat',
  CANCELLED: 'Dibatalkan'
}
const mapStatus = (s: Payment['status']) => statusLabelMap[s] ?? s

const docBadgeClass = (s: Document['status']) => {
  const base = 'px-2 inline-flex text-xs font-semibold rounded-full'
  if (s === 'APPROVED') return `${base} bg-green-100 text-green-800`
  if (s === 'PENDING') return `${base} bg-yellow-100 text-yellow-800`
  if (s === 'REJECTED') return `${base} bg-red-100 text-red-800`
  return `${base} bg-gray-100 text-gray-800`
}

const annBadgeClass = (t: Announcement['type']) => {
  const base = 'px-2 inline-flex text-xs font-semibold rounded-full'
  if (t === 'EVENT') return `${base} bg-indigo-100 text-indigo-800`
  if (t === 'WARNING') return `${base} bg-orange-100 text-orange-800`
  if (t === 'URGENT') return `${base} bg-red-100 text-red-800`
  return `${base} bg-blue-100 text-blue-800`
}

</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>