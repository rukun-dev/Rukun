<template>
  <Toaster richColors position="top-right" />
  <div class="min-h-screen bg-white">


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Content -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div></div>
          
          <!-- Tombol Tambah Kartu Keluarga -->
          <button
            @click="openAdd"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambah Kartu Keluarga</span>
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <StatsKeluarga 
        :stats="{
          total: stats.totalKartuKeluarga,
          members: stats.totalAnggotaKeluarga,
          active: stats.keluargaAktif,
          expired: stats.keluargaTidakAktif
        }"
      />

      <!-- Search & Filters -->
      <SearchFilterKeluarga v-model="filters" class="mb-6" />

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Memuat data kartu keluarga...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button
          @click="loadKeluarga"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Coba Lagi
        </button>
      </div>

      <!-- Data Table -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Kartu Keluarga</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan halaman {{ currentPage }} dari {{ apiPagination?.total_pages || 1 }}, 
                total {{ apiPagination?.total_count || 0 }} data
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
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. KK
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kepala Keluarga
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jml. Anggota
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alamat
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RT/RW
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provinsi
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kabupaten
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kecamatan
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelurahan
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Keluarga
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Pos
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(keluarga, index) in paginatedKeluarga"
                :key="keluarga.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ startIndex + index }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ keluarga.noKk }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div 
                      class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3"
                    >
                      {{ keluarga.kepalaKeluarga.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ keluarga.kepalaKeluarga }}
                      </div>
                      <div class="text-sm text-gray-500">
                        NIK: {{ keluarga.nikKepala }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.jumlahAnggota }} orang
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.alamat }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.rt }}/{{ keluarga.rw }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.provinsi }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.kabupaten }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.kecamatan }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.kelurahan }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.namaKeluarga }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ keluarga.kodePos }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="getStatusClass(keluarga.status)"
                    class="px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {{ keluarga.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="openEdit(keluarga)"
                      class="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="askDelete(keluarga)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16" />
                      </svg>
                    </button>
                    <button
                      @click="viewDetails(keluarga)"
                      class="text-green-600 hover:text-green-800 transition-colors"
                      title="Lihat Detail"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredKeluarga.length === 0" class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            Tidak ada data kartu keluarga
          </h3>
          <p class="mt-1 text-sm text-gray-500">
            Data kartu keluarga tidak ditemukan dengan kriteria pencarian yang Anda masukkan.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="() => goToPage(1)"
                :disabled="!(apiPagination?.has_previous)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                @click="() => previousPage()"
                :disabled="!(apiPagination?.has_previous)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
            </div>

            <div class="flex items-center space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="(e) => { e.preventDefault(); goToPage(page); }"
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
                @click="() => nextPage()"
                :disabled="!(apiPagination?.has_next)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                @click="(e) => { e.preventDefault(); goToPage(apiPagination?.total_pages || 1); }"
                :disabled="!(apiPagination?.has_next)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Import Export Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Import & Export Data
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Import Card -->
          <div class="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Import Data</h4>
                <p class="text-sm text-gray-500">Unggah file CSV untuk menambahkan data kartu keluarga</p>
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
                @click="fileInput?.click()"
                class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Pilih File CSV
              </button>
              
              <a href="/template-kartu-keluarga.csv" download 
                 class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h4 class="font-medium text-gray-900">Export Data</h4>
                <p class="text-sm text-gray-500">Unduh data kartu keluarga dalam format CSV</p>
              </div>
            </div>
            
            <button 
              @click="exportCsv"
              class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export ke CSV
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <KeluargaCreate
      v-if="showCreate"
      @close="closeModal"
      @save="saveKeluarga"
    />
    
    <KeluargaEdit
      v-if="showEdit"
      :keluarga="editingKeluarga"
      @close="closeModal"
      @update="saveKeluarga"
    />
    
    <KeluargaDetail
      v-if="showDetail"
      :keluarga="selectedKeluarga"
      @close="closeModal"
    />
    
    <ConfirmDelete 
      v-model="showDelete"
      title="Hapus Data Kartu Keluarga?"
      message="Apakah Anda yakin ingin menghapus data ini?"
      :details="toDelete ? `${toDelete.kepalaKeluarga} • No. KK: ${toDelete.noKk}` : ''"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Toaster, toast } from "vue-sonner";
import { useKeluarga, type KeluargaData } from "@/composables/useKeluarga";
import ConfirmDelete from "@/components/form/warga/ConfirmDelete.vue";

// Components
import StatsKeluarga from "@/components/ui-keluarga/StatsKeluarga.vue";
import SearchFilterKeluarga from "@/components/ui-keluarga/SearchFilterKeluarga.vue";
import KeluargaDetail from "@/components/ui-keluarga/KeluargaDetail.vue";
import KeluargaCreate from "@/components/form/keluarga/KeluargaCreate.vue";
import KeluargaEdit from "@/components/form/keluarga/KeluargaEdit.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Types
interface FilterType {
  searchTerm: string;
  rt: string;
  status: string;
}

// Use composable
const keluargaComposable = useKeluarga();
const keluargaList = keluargaComposable.keluargaList;
const loading = keluargaComposable.loading;
const error = keluargaComposable.error;
const searchTerm = keluargaComposable.searchTerm;
const filterRt = keluargaComposable.filterRt;
const filterStatus = keluargaComposable.filterStatus;
const currentPage = keluargaComposable.currentPage;
const itemsPerPage = keluargaComposable.itemsPerPage;
const apiPagination = keluargaComposable.apiPagination;
const filteredKeluarga = keluargaComposable.filteredKeluarga;
const paginatedKeluarga = keluargaComposable.paginatedKeluarga;
const totalPages = keluargaComposable.totalPages;
const stats = keluargaComposable.stats;
const loadKeluarga = keluargaComposable.loadKeluarga;
const addKeluarga = keluargaComposable.addKeluarga;
const updateKeluarga = keluargaComposable.updateKeluarga;
const deleteKeluarga = keluargaComposable.deleteKeluarga;
const resetFilters = keluargaComposable.resetFilters;
const nextPage = keluargaComposable.nextPage;
const previousPage = keluargaComposable.previousPage;
const goToPage = keluargaComposable.goToPage;

// Load data on component mount
onMounted(() => {
  loadKeluarga();
});

// Modal state
const showCreate = ref(false);
const showEdit = ref(false);
const showDelete = ref(false);
const showDetail = ref(false);
const editingKeluarga = ref<KeluargaData | null>(null);
const selectedKeluarga = ref<KeluargaData | null>(null);
const toDelete = ref<KeluargaData | null>(null);

// Ensure pagination variables are properly initialized
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const visiblePages = computed(() => {
  const pages: number[] = [];
  const total = apiPagination?.total_pages || 1;
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

// File input ref
const fileInput = ref<HTMLInputElement | null>(null);

// Initialize
onMounted(() => {
  loadKeluarga();
});

// Filter setter and getter
const filters = computed({
  get: () => ({
    searchTerm: searchTerm.value,
    rt: filterRt.value,
    status: filterStatus.value,
  }),
  set: (v: FilterType) => {
    searchTerm.value = v.searchTerm ?? "";
    filterRt.value = v.rt ?? "";
    filterStatus.value = v.status ?? "";
    currentPage.value = 1; // Reset page when filters change
  },
});

// Helper functions
const getStatusClass = (status: string) =>
  ({
    "Aktif": "bg-green-100 text-green-800",
    "Tidak Aktif": "bg-red-100 text-red-800",
    "Pending": "bg-yellow-100 text-yellow-800",
  })[status] || "bg-gray-100 text-gray-800";

// CRUD operations
const closeModal = () => {
  showCreate.value = false;
  showEdit.value = false;
  showDetail.value = false;
  editingKeluarga.value = null;
  selectedKeluarga.value = null;
};

const openAdd = () => {
  editingKeluarga.value = null;
  showCreate.value = true;
};

const openEdit = (keluarga: KeluargaData) => {
  editingKeluarga.value = { ...keluarga };
  showEdit.value = true;
};

const saveKeluarga = async (payload: Omit<KeluargaData, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    loading.value = true;
    
    if (editingKeluarga.value) {
      // Update existing keluarga
      await updateKeluarga(editingKeluarga.value.id, payload);
      showEdit.value = false;
      toast.success(`Data kartu keluarga berhasil diperbarui`);
    } else {
      // Add new keluarga
      await addKeluarga(payload);
      showCreate.value = false;
      toast.success(`Data kartu keluarga berhasil ditambahkan`);
    }
  } catch (error) {
    toast.error('Gagal menyimpan data kartu keluarga');
    console.error('Error saving keluarga:', error);
  } finally {
    loading.value = false;
  }
};

const askDelete = (keluarga: KeluargaData) => {
  toDelete.value = keluarga;
  showDelete.value = true;
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    
    if (toDelete.value) {
      await deleteKeluarga(toDelete.value.id);
      showDelete.value = false;
      toast.success(`Data kartu keluarga berhasil dihapus`);
    }
  } catch (error) {
    toast.error('Gagal menghapus data kartu keluarga');
    console.error('Error deleting keluarga:', error);
  } finally {
    loading.value = false;
  }
};

const viewDetails = (keluarga: KeluargaData) => {
  selectedKeluarga.value = keluarga;
  showDetail.value = true;
};

// File import handler
const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0]?.split(',').map(h => h.trim()) || [];
      
      // Parse CSV
      const importedData = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          noKk: values[0] || '',
          kepalaKeluarga: values[1] || '',
          nikKepala: values[2] || '',
          jumlahAnggota: parseInt(values[3] || '0') || 0,
          alamat: values[4] || '',
          rt: values[5] || '',
          rw: values[6] || '',
          provinsi: values[7] || '',
          kabupaten: values[8] || '',
          kecamatan: values[9] || '',
          kelurahan: values[10] || '',
          namaKeluarga: values[11] || '',
          kodePos: values[12] || '',
          status: values[13] || 'Aktif'
        };
      }).filter(k => k.noKk && k.kepalaKeluarga); // Filter valid data
      
      // Add imported data using composable
      importedData.forEach(async data => {
        try {
          await addKeluarga(data);
        } catch (error) {
          console.error('Error adding imported keluarga:', error);
        }
      });
      toast.success(`Berhasil import ${importedData.length} data kartu keluarga`);
      
      // Reset file input
      target.value = '';
    } catch (error) {
      toast.error('Format file CSV tidak valid');
    }
  };
  
  reader.readAsText(file);
};

// File export handler
const exportCsv = () => {
  const headers = ['No. KK', 'Kepala Keluarga', 'NIK Kepala', 'Jumlah Anggota', 'Alamat', 'RT', 'RW', 'Provinsi', 'Kabupaten', 'Kecamatan', 'Kelurahan', 'Nama Keluarga', 'Kode Pos', 'Status'];
  const csvContent = [
    headers.join(','),
    ...filteredKeluarga.value.map(k => [
      k.noKk,
      k.kepalaKeluarga,
      k.nikKepala,
      k.jumlahAnggota,
      k.alamat,
      k.rt,
      k.rw,
      k.provinsi,
      k.kabupaten,
      k.kecamatan,
      k.kelurahan,
      k.namaKeluarga,
      k.kodePos,
      k.status
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `data-kartu-keluarga-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('Data berhasil diekspor ke CSV');
};

// Watch for itemsPerPage changes to reload data with new page size
watch(itemsPerPage, () => {
  loadKeluarga(1);
});
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