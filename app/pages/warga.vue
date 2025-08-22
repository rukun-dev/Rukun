<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
    <!-- Header Navigation -->
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">RT Management</h1>
              <p class="text-xs text-gray-500">Sistem Digital RT</p>
            </div>
          </div>

          <!-- Breadcrumb -->
          <div class="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
            <span>Dashboard</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
            <span class="text-blue-600 font-medium">Manajemen Warga</span>
          </div>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Manajemen Warga</h2>
            <p class="text-gray-600">Kelola data warga RT dengan mudah dan efisien</p>
          </div>
          <!-- GANTI: pakai openAdd -->
          <button @click="openAdd"
                  class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>Tambah Warga</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <StatsWarga
        :stats="{
          total: totalWarga,
          male : wargaLakiLaki,
          female : wargaPerempuan,
          heads : kepalaKeluarga
        }"
        />

      <!-- Search & Filters -->
      <SearchFilter
        v-model="filters"
        class="mb-6"
        />

      <!-- Data Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Warga</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan {{ startIndex + 1 }}-{{ Math.min(startIndex + itemsPerPage, filteredWarga.length) }} dari {{ filteredWarga.length }} data
              </span>
              <select v-model.number="itemsPerPage"
                      class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option :value="10">10 per halaman</option>
                <option :value="25">25 per halaman</option>
                <option :value="50">50 per halaman</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Body -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(warga, index) in paginatedWarga" :key="warga.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ startIndex + index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ warga.nik }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                      {{ warga.nama.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ warga.nama }}</div>
                      <div class="text-sm text-gray-500">{{ warga.tempatLahir }}, {{ formatTanggal(warga.tanggalLahir) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ warga.jenisKelamin }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ hitungUmur(warga.tanggalLahir) }} tahun</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(warga.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                    {{ warga.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ warga.alamat }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <!-- GANTI: pakai openEdit -->
                    <button @click="openEdit(warga)" class="text-blue-600 hover:text-blue-800 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button @click="deleteWarga(warga.id)" class="text-red-600 hover:text-red-800 transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredWarga.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data warga</h3>
          <p class="mt-1 text-sm text-gray-500">Data warga tidak ditemukan dengan kriteria pencarian yang Anda masukkan.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button @click="currentPage = 1" :disabled="currentPage === 1"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                First
              </button>
              <button @click="currentPage--" :disabled="currentPage === 1"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
            </div>

            <div class="flex items-center space-x-1">
              <button v-for="page in visiblePages" :key="page" @click="currentPage = page"
                      :class="currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'"
                      class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors">
                {{ page }}
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <button @click="currentPage++" :disabled="currentPage === totalPages"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
              <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
                      class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- WargaCreate Component -->
    <WargaCreate
      v-model="showCreate"
      :value="null"
      @save="saveResident"
    />

    <!-- WargaEdit Component -->
    <WargaEdit
      v-model="showEdit"
      :value="editingWarga"
      :existing-niks="nikList"
      @update="updateResident"
      />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import WargaCreate from '@/components/form/warga/WargaCreate.vue'
import SearchFilter from '@/components/ui/search-filter/SearchFilter.vue'
import StatsWarga from '@/components/ui-warga/StatsWarga.vue'
import WargaEdit from '@/components/form/warga/WargaEdit.vue'

// Reactive data
const wargaList = ref([])
const searchTerm = ref('')
const filterGender = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal state (baru)
const showCreate = ref(false)
const showEdit = ref(false)
const editingWarga = ref(null)

// Sample data
const sampleWarga = [
  { id: 1, nik: '3301012345678901', nama: 'Ahmad Ridwan', tempatLahir: 'Jakarta', tanggalLahir: '1980-05-15', jenisKelamin: 'L', status: 'Kepala Keluarga', alamat: 'Jl. Merdeka No. 123, RT 01/RW 01' },
  { id: 2, nik: '3301012345678902', nama: 'Siti Nurhaliza', tempatLahir: 'Bandung', tanggalLahir: '1985-08-22', jenisKelamin: 'P', status: 'Istri', alamat: 'Jl. Merdeka No. 123, RT 01/RW 01' },
  { id: 3, nik: '3301012345678903', nama: 'Muhammad Faris', tempatLahir: 'Jakarta', tanggalLahir: '2010-03-10', jenisKelamin: 'L', status: 'Anak', alamat: 'Jl. Merdeka No. 123, RT 01/RW 01' },
  { id: 4, nik: '3301012345678904', nama: 'Dewi Sartika', tempatLahir: 'Surabaya', tanggalLahir: '1975-12-08', jenisKelamin: 'P', status: 'Kepala Keluarga', alamat: 'Jl. Kebangsaan No. 45, RT 02/RW 01' },
  { id: 5, nik: '3301012345678905', nama: 'Budi Santoso', tempatLahir: 'Yogyakarta', tanggalLahir: '1990-01-20', jenisKelamin: 'L', status: 'Anak', alamat: 'Jl. Kebangsaan No. 45, RT 02/RW 01' },
  { id: 6, nik: '3301012345678906', nama: 'Kartini Wijaya', tempatLahir: 'Solo', tanggalLahir: '1978-04-21', jenisKelamin: 'P', status: 'Kepala Keluarga', alamat: 'Jl. Pahlawan No. 78, RT 03/RW 02' },
  { id: 7, nik: '3301012345678907', nama: 'Raden Sutomo', tempatLahir: 'Malang', tanggalLahir: '1955-11-17', jenisKelamin: 'L', status: 'Orang Tua', alamat: 'Jl. Veteran No. 90, RT 04/RW 02' },
  { id: 8, nik: '3301012345678908', nama: 'Aminah Surya', tempatLahir: 'Semarang', tanggalLahir: '1958-09-13', jenisKelamin: 'P', status: 'Orang Tua', alamat: 'Jl. Veteran No. 90, RT 04/RW 02' }
]

// Initialize
onMounted(() => {
  wargaList.value = [...sampleWarga]
})

// Computed
const filteredWarga = computed(() => {
  let filtered = wargaList.value
  if (searchTerm.value) {
    const s = searchTerm.value.toLowerCase()
    filtered = filtered.filter(w =>
      w.nama.toLowerCase().includes(s) ||
      w.nik.includes(s) ||
      w.alamat.toLowerCase().includes(s)
    )
  }
  if (filterGender.value) filtered = filtered.filter(w => w.jenisKelamin === filterGender.value)
  if (filterStatus.value) filtered = filtered.filter(w => w.status === filterStatus.value)
  return filtered
})
const nikList = computed(() => wargaList.value.map(w => w.nik))

const filters = computed({
  get: () => ({
    searchTerm: searchTerm.value,
    gender: filterGender.value,
    status: filterStatus.value
  }),
  set: (v) => {
    searchTerm.value = v.searchTerm ?? ''
    filterGender.value = v.gender ?? ''
    filterStatus.value = v.status ?? ''
    currentPage.value = 1 // reset halaman ketika filter berubah
  }
})

const totalPages = computed(() => Math.ceil(filteredWarga.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const paginatedWarga = computed(() => filteredWarga.value.slice(startIndex.value, startIndex.value + itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
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

// Stats
const totalWarga = computed(() => wargaList.value.length)
const wargaLakiLaki = computed(() => wargaList.value.filter(w => w.jenisKelamin === 'L').length)
const wargaPerempuan = computed(() => wargaList.value.filter(w => w.jenisKelamin === 'P').length)
const kepalaKeluarga = computed(() => wargaList.value.filter(w => w.status === 'Kepala Keluarga').length)


// Helpers
const formatTanggal = (tanggal) =>
  new Date(tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })

const hitungUmur = (tanggalLahir) => {
  const today = new Date()
  const birth = new Date(tanggalLahir)
  let age = today.getFullYear() - birth.getFullYear()
  const mdiff = today.getMonth() - birth.getMonth()
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const getStatusClass = (status) => ({
  'Kepala Keluarga': 'bg-blue-100 text-blue-800',
  'Istri': 'bg-pink-100 text-pink-800',
  'Anak': 'bg-green-100 text-green-800',
  'Orang Tua': 'bg-purple-100 text-purple-800',
  'Lainnya': 'bg-gray-100 text-gray-800'
}[status] || 'bg-gray-100 text-gray-800')

// CRUD helpers
const openAdd = () => {
  editingWarga.value = null
  showCreate.value = true
}
const openEdit = (warga) => {
  editingWarga.value = { ...warga }
  showEdit.value = true
}
const updateResident = (payload) => {
  const idx = wargaList.value.findIndex(w => w.id === payload.id)
  console.log('Found index:', idx)
  
  if (idx !== -1) {
    console.log('Before update:', wargaList.value[idx])
    wargaList.value = wargaList.value.map(warga => 
      warga.id === payload.id ? { ...payload } : warga
    )
    console.log('After update - success!')
    showEdit.value = false
  } else {
    console.log('ID tidak ditemukan!', payload.id)
  }
}
const saveResident = (payload) => {
  const data = { id: payload.id ?? Date.now(), ...payload }
  wargaList.value.push(data)
  // sesuaikan halaman bila total berubah
  const newTotal = Math.ceil(filteredWarga.value.length / itemsPerPage.value) || 1
  if (currentPage.value > newTotal) currentPage.value = newTotal
}
const deleteWarga = (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus data warga ini?')) {
    wargaList.value = wargaList.value.filter(w => w.id !== id)
    const newTotal = Math.ceil(filteredWarga.value.length / itemsPerPage.value) || 1
    if (currentPage.value > newTotal) currentPage.value = newTotal
  }
}

// reset pagination jika filter berubah
watch([searchTerm, filterGender, filterStatus], () => { currentPage.value = 1 })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active { transition: all 0.3s ease-out; }
.slide-up-enter-from { transform: translateY(20px); opacity: 0; }
</style>
