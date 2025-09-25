<template>
  <Toaster richColors position="top-right" />
  <RouterView />
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"
  >
    <!-- Header Navigation -->
    <header
      class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200"
    >
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">RT Management</h1>
              <p class="text-xs text-gray-500">Sistem Digital RT</p>
            </div>
          </div>

          <!-- Breadcrumb -->
          <div
            class="hidden sm:flex items-center space-x-2 text-sm text-gray-600"
          >
            <span>Dashboard</span>
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
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
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              Manajemen Warga
            </h2>
            <p class="text-gray-600">
              Kelola data warga RT dengan mudah dan efisien
            </p>
          </div>
          <!-- GANTI: pakai openAdd -->
          <button
            @click="openAdd"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>Tambah Warga</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <StatsWarga
        :stats="{
          total: totalWarga,
          male: wargaLakiLaki,
          female: wargaPerempuan,
          heads: kepalaKeluarga,
        }"
      />

      <!-- Search & Filters -->
      <SearchFilter v-model="filters" class="mb-6" />

      <!-- Data Table -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Warga</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan {{ startIndex + 1 }}-{{
                  Math.min(startIndex + itemsPerPage, filteredWarga.length)
                }}
                dari {{ filteredWarga.length }} data
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

        <!-- Body -->
        <div class="overflow-x-auto">
          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span class="text-gray-600">Memuat data warga...</span>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="!loading && wargaList.length === 0" class="text-center py-12">
            <div class="text-gray-500">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data warga</h3>
              <p class="mt-1 text-sm text-gray-500">Belum ada data warga yang tersedia.</p>
            </div>
          </div>
          
          <!-- Data Table -->
          <table v-else class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  NIK
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nama Lengkap
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  JK
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Umur
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Alamat
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Agama
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Kode Pos
                </th>
                <th
                  class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(warga, index) in paginatedWarga"
                :key="warga.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ startIndex + index + 1 }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  {{ warga.nik }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div
                      class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3"
                    >
                      {{ warga.nama.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ warga.nama }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ warga.tempatLahir }},
                        {{ formatTanggal(warga.tanggalLahir) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ warga.jenisKelamin }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ hitungUmur(warga.tanggalLahir) }} tahun
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(warga.status)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ warga.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ warga.alamat }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ warga.agama }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ warga.kodePos }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex space-x-2">
                    <!-- GANTI: pakai openEdit -->
                    <button
                      @click="openEdit(warga)"
                      class="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="askDelete(warga.id)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus"
                    >
                      <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16"
                        />
                      </svg>
                      <ConfirmDelete
                        v-model="showDelete"
                        title="Hapus Data Warga?"
                        message="Apakah Anda yakin ingin menghapus data ini?"
                        :details="
                          toDelete
                            ? `${toDelete.sampleWarga.nama} • warga ${toDelete.sampleWarga.id}`
                            : ''
                        "
                        @confirm="confirmDelete"
                        @cancel="showDelete = false"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredWarga.length === 0" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Tidak ada data warga
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Data warga tidak ditemukan dengan kriteria pencarian yang Anda
            masukkan.
          </p>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="px-6 py-4 border-t border-gray-200 bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = 1"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                @click="currentPage--"
                :disabled="currentPage === 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
            </div>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="currentPage = page"
                :class="
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                "
                class="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg transition-colors"
              >
                {{ page }}
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <button
                @click="currentPage++"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="currentPage === totalPages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
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
    @save="saveResident" />
    
    <!-- WargaEdit Component -->
    <WargaEdit
      v-model="showEdit"
      :value="editingWarga"
      :existing-niks="nikList"
      @update="updateResident"
    />
  </div>

<!-- Import Export Section -->
<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
    </svg>
    Import & Export Data
  </h3>
  
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Import Card -->
    <div class="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
      <div class="flex items-center mb-3">
        <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Import Data</h4>
          <p class="text-sm text-gray-500">Unggah file CSV untuk menambahkan data warga</p>
        </div>
      </div>
      
      <div class="space-y-2">
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleImport" 
          accept=".csv"
          class="hidden"
        />
        <button 
          @click="$refs.fileInput.click()"
          class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          Pilih File CSV
        </button>
        
        <a href="/template-warga.csv" download 
           class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Download Template
        </a>
      </div>
    </div>

    <!-- Export Card -->
    <div class="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
      <div class="flex items-center mb-3">
        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <h4 class="font-medium text-gray-900">Export Data</h4>
          <p class="text-sm text-gray-500">Unduh data warga dalam format CSV</p>
        </div>
      </div>
      
      <button 
        @click="exportCsv"
        class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
        </svg>
        Export ke CSV
      </button>
    </div>
  </div>

  <!-- Modal Tambah Warga -->
  <WargaCreate 
    v-if="showCreate" 
    @close="showCreate = false" 
    @save="saveResident" 
  />
</div>

</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import WargaCreate from "@/components/form/warga/WargaCreate.vue";
import SearchFilter from "@/components/ui/search-filter/SearchFilter.vue";
import StatsWarga from "@/components/ui-warga/StatsWarga.vue";
import WargaEdit from "@/components/form/warga/WargaEdit.vue";
import "vue-sonner/style.css";
import { Toaster, toast } from "vue-sonner";
import ConfirmDelete from "@/components/form/warga/ConfirmDelete.vue";

// Page meta with authentication
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Auth composable
const { user, isAuthenticated, userRole } = useAuth()

// Reactive data
const wargaList = ref([]);
const searchTerm = ref("");
const filterGender = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);
const loading = ref(false);

// Modal state (baru)
const showCreate = ref(false);
const showEdit = ref(false);
const editingWarga = ref(null);


// Initialize
onMounted(async () => {
  await loadWargaData();
});

// Computed
const filteredWarga = computed(() => {
  let filtered = wargaList.value;
  if (searchTerm.value) {
    const s = searchTerm.value.toLowerCase();
    filtered = filtered.filter(
      (w) =>
        w.nama.toLowerCase().includes(s) ||
        w.nik.includes(s) ||
        w.alamat.toLowerCase().includes(s)
    );
  }
  if (filterGender.value)
    filtered = filtered.filter((w) => w.jenisKelamin === filterGender.value);
  if (filterStatus.value)
    filtered = filtered.filter((w) => w.status === filterStatus.value);
  return filtered;
});
const nikList = computed(() => wargaList.value.map((w) => w.nik));

const filters = computed({
  get: () => ({
    searchTerm: searchTerm.value,
    gender: filterGender.value,
    status: filterStatus.value,
  }),
  set: (v) => {
    searchTerm.value = v.searchTerm ?? "";
    filterGender.value = v.gender ?? "";
    filterStatus.value = v.status ?? "";
    currentPage.value = 1; // reset halaman ketika filter berubah
  },
});

const totalPages = computed(() =>
  Math.ceil(filteredWarga.value.length / itemsPerPage.value)
);
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const paginatedWarga = computed(() =>
  filteredWarga.value.slice(
    startIndex.value,
    startIndex.value + itemsPerPage.value
  )
);

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const cur = currentPage.value;
  let start = Math.max(1, cur - 2);
  let end = Math.min(total, cur + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4);
    else if (end === total) start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

// Stats
const totalWarga = computed(() => wargaList.value.length);
const wargaLakiLaki = computed(
  () => wargaList.value.filter((w) => w.jenisKelamin === "L").length
);
const wargaPerempuan = computed(
  () => wargaList.value.filter((w) => w.jenisKelamin === "P").length
);
const kepalaKeluarga = computed(
  () => wargaList.value.filter((w) => w.status === "Kepala Keluarga").length
);

// Helpers
const formatTanggal = (tanggal) =>
  new Date(tanggal).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const hitungUmur = (tanggalLahir) => {
  const today = new Date();
  const birth = new Date(tanggalLahir);
  let age = today.getFullYear() - birth.getFullYear();
  const mdiff = today.getMonth() - birth.getMonth();
  if (mdiff < 0 || (mdiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getStatusClass = (status) =>
  ({
    "Kepala Keluarga": "bg-blue-100 text-blue-800",
    Istri: "bg-pink-100 text-pink-800",
    Anak: "bg-green-100 text-green-800",
    "Orang Tua": "bg-purple-100 text-purple-800",
    Lainnya: "bg-gray-100 text-gray-800",
  }[status] || "bg-gray-100 text-gray-800");

// API functions
const loadWargaData = async () => {
  try {
    loading.value = true;
    
    // Check if user is authenticated and has proper role
    if (!isAuthenticated.value) {
      toast.error('Anda harus login terlebih dahulu');
      return;
    }
    
    // Check if user has permission to view warga data
    if (!['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS'].includes(userRole.value)) {
      toast.error('Anda tidak memiliki izin untuk melihat data warga');
      return;
    }
    
    const response = await $fetch('/api/warga', {
      credentials: 'include'
    });
    
    if (response && response.success && response.data) {
      // API returns { success: true, data: { data: [...], pagination: {...} } }
      wargaList.value = response.data.data || [];
      console.log('Warga data loaded successfully:', wargaList.value.length, 'records');
      console.log('Pagination info:', response.data.pagination);
    } else {
      throw new Error(response?.message || 'Failed to load warga data');
    }
  } catch (error) {
    console.error('Error loading warga data:', error);
    
    // Handle different error types
    if (error.status === 401) {
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
      await navigateTo('/login');
    } else if (error.status === 403) {
      toast.error('Anda tidak memiliki izin untuk mengakses data warga');
    } else {
      toast.error(error.data?.message || 'Gagal memuat data warga');
    }
    
    // Don't fallback to sample data in production
    wargaList.value = [];
  } finally {
    loading.value = false;
  }
};

// CRUD helpers
const openAdd = () => {
  editingWarga.value = null;
  showCreate.value = true;
};
const openEdit = (warga) => {
  editingWarga.value = { ...warga };
  showEdit.value = true;
};
const updateResident = async (payload) => {
  try {
    const response = await $fetch(`/api/warga/${payload.id}`, {
      method: 'PUT',
      body: payload
    });
    
    if (response.success) {
      toast.success('Data warga berhasil diperbarui');
      await loadWargaData(); // Reload data dari server
      showEdit.value = false;
    } else {
      toast.error(response.message || 'Gagal memperbarui data warga');
    }
  } catch (error) {
    console.error('Error updating warga:', error);
    toast.error('Terjadi kesalahan saat memperbarui data');
  }
};
const saveResident = async (payload) => {
  try {
    const response = await $fetch('/api/warga/create', {
      method: 'POST',
      body: payload
    });
    
    if (response.success) {
      toast.success('Data warga berhasil ditambahkan');
      await loadWargaData(); // Reload data dari server
    } else {
      toast.error(response.message || 'Gagal menambahkan data warga');
    }
  } catch (error) {
    console.error('Error saving warga:', error);
    toast.error('Terjadi kesalahan saat menyimpan data');
  }
};
const showDelete = ref(false);
const toDelete = ref(null); // simpan objek/ID yang mau dihapus

const askDelete = (warga) => {
  toDelete.value = warga; // simpan data agar bisa tampilkan nama/NIK
  showDelete.value = true;
};

const confirmDelete = async () => {
  try {
    const response = await $fetch(`/api/warga/${toDelete.value.id}`, {
      method: 'DELETE'
    });
    
    if (response.success) {
      toast.success('Data warga berhasil dihapus');
      await loadWargaData(); // Reload data dari server
    } else {
      toast.error(response.message || 'Gagal menghapus data warga');
    }
  } catch (error) {
    console.error('Error deleting warga:', error);
    toast.error('Terjadi kesalahan saat menghapus data');
  }
  toDelete.value = null;
  showDelete.value = false;
};

// reset pagination jika filter berubah
watch([searchTerm, filterGender, filterStatus], () => {
  currentPage.value = 1;
});

// File input ref
const fileInput = ref(null)

// Import handler
const handleImport = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const csv = e.target.result
      const lines = csv.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      // Parse CSV (adjust mapping sesuai struktur CSV Anda)
      const importedData = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim())
        return {
          id: Date.now() + index,
          nik: values[0] || '',
          nama: values[1] || '',
          tempatLahir: values[2] || '',
          tanggalLahir: values[3] || '',
          jenisKelamin: values[4] || '',
          status: values[5] || '',
          alamat: values[6] || '',
          agama: values[7] || '',
          kodePos: values[8] || ''
        }
      }).filter(w => w.nik && w.nama) // Filter data valid

      wargaList.value.push(...importedData)
      toast.success(`Berhasil import ${importedData.length} data warga`)
      
      // Reset file input
      fileInput.value.value = ''
    } catch (error) {
      toast.error('Format file CSV tidak valid')
    }
  }
  reader.readAsText(file)
}

// Export handler
const exportCsv = () => {
  const headers = ['NIK', 'Nama Lengkap', 'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin', 'Status', 'Alamat', 'Agama', 'Kode Pos']
  const csvContent = [
    headers.join(','),
    ...wargaList.value.map(w => [
      w.nik,
      w.nama,
      w.tempatLahir,
      w.tanggalLahir,
      w.jenisKelamin,
      w.status,
      w.alamat,
      w.agama,
      w.kodePos
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `data-warga-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

</style>
