<template>
  <Toaster richColors position="top-right" />
  <div class="min-h-screen bg-white">


    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Content -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div></div>
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
      <!-- 直接在页面内实现搜索和过滤，不再使用外部组件 -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari Warga</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                v-model="searchTerm"
                placeholder="Cari nama, NIK, atau alamat..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
      
          <!-- Gender Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select
              v-model="filterGender"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              <option value="">Semua</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
      
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="filterStatus"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
            >
              <option value="">Semua</option>
              <option value="Kepala Keluarga">Kepala Keluarga</option>
              <option value="Istri">Istri</option>
              <option value="Anak">Anak</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>
      </div>
      
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
              Menampilkan {{ startIndex + 1 }}-{{ endIndex }}
              dari {{ paginationData.value?.total_count || filteredWarga.length }} data
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
                            ? `${toDelete.nama} • warga ${toDelete.id}`
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
                :disabled="!paginationData.value?.has_previous"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                @click="currentPage = paginationData.value?.previous_page || 1"
                :disabled="!paginationData.value?.has_previous"
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
                  (paginationData.value?.current_page || currentPage) === page
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
                @click="currentPage = paginationData.value?.next_page || totalPages"
                :disabled="!paginationData.value?.has_next"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="!paginationData.value?.has_next"
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
import StatsWarga from "@/components/ui-warga/StatsWarga.vue";
import WargaEdit from "@/components/form/warga/WargaEdit.vue";
import "vue-sonner/style.css";
import { Toaster, toast } from "vue-sonner";
import ConfirmDelete from "@/components/form/warga/ConfirmDelete.vue";

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

// Reactive data
const wargaList = ref([]);
const searchTerm = ref("");
const filterGender = ref("");
const filterStatus = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Store API pagination data
const paginationData = ref({
  current_page: 1,
  total_pages: 1,
  total_count: 0,
  per_page: 10,
  has_next: false,
  has_previous: false,
  next_page: null,
  previous_page: null
});

// Modal state (baru)
const showCreate = ref(false);
const showEdit = ref(false);
const editingWarga = ref(null);


// Pagination functions
const goToPage = async (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  await loadWargaData();
};

// Initialize
onMounted(async () => {
  await loadWargaData();
});

// Watch for changes in pagination and items per page
watch([currentPage, itemsPerPage], async () => {
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

const totalPages = computed(() => {
  // Gunakan total_pages dari API jika tersedia
  if (paginationData.value && paginationData.value.total_pages > 0) {
    return paginationData.value.total_pages;
  }
  // Hitung lokal jika API tidak memberikan data pagination
  return Math.ceil(filteredWarga.value.length / itemsPerPage.value);
});
const startIndex = computed(() => {
  // Gunakan current_page dan per_page dari API untuk menghitung startIndex
  if (paginationData.value) {
    return (paginationData.value.current_page - 1) * paginationData.value.per_page;
  }
  return (currentPage.value - 1) * itemsPerPage.value;
});
const endIndex = computed(() => {
  // Hitung endIndex berdasarkan data pagination dari API
  if (paginationData.value) {
    return Math.min(
      paginationData.value.current_page * paginationData.value.per_page,
      paginationData.value.total_count
    );
  }
  return Math.min(
    startIndex.value + itemsPerPage.value,
    filteredWarga.value.length
  );
});
const paginatedWarga = computed(() => {
  // Gunakan data dari API secara langsung karena data yang diterima sudah dipaginasikan
  // Tetapi tetap gunakan filteredWarga untuk keperluan filter lokal jika diperlukan
  if (wargaList.value.length > 0) {
    return wargaList.value;
  }
  return filteredWarga.value.slice(
    startIndex.value,
    startIndex.value + itemsPerPage.value
  );
});

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

// Sample data for fallback - now matches API structure
const sampleWarga = [
  {
    id: 1,
    nik: '1234567890123456',
    name: 'Budi Santoso',
    birthPlace: 'Bandung',
    birthDate: '1990-01-15',
    gender: 'MALE',
    maritalStatus: 'MARRIED',
    job: 'Software Engineer',
    address: 'Jl. Merdeka No. 123',
    religion: 'Islam',
    postalCode: '12345'
  },
  {
    id: 2,
    nik: '2345678901234567',
    name: 'Siti Rahayu',
    birthPlace: 'Jakarta',
    birthDate: '1995-05-20',
    gender: 'FEMALE',
    maritalStatus: 'MARRIED',
    job: 'Teacher',
    address: 'Jl. Pahlawan No. 45',
    religion: 'Islam',
    postalCode: '12345'
  },
  {
    id: 3,
    nik: '3456789012345678',
    name: 'Ahmad Rizki',
    birthPlace: 'Surabaya',
    birthDate: '2010-09-10',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    job: 'Student',
    address: 'Jl. Diponegoro No. 78',
    religion: 'Islam',
    postalCode: '12345'
  }
];

// API functions
const loadWargaData = async () => {
  try {
    // Membuat query parameters untuk pagination dan filter
    const queryParams = new URLSearchParams();
    queryParams.append('page', currentPage.value);
    queryParams.append('limit', itemsPerPage.value);
    
    // Menambahkan filter jika ada
    if (searchTerm.value) queryParams.append('search', searchTerm.value);
    if (filterGender.value) queryParams.append('gender', filterGender.value);
    if (filterStatus.value) queryParams.append('status', filterStatus.value);
    
    const response = await $fetch(`/api/warga?${queryParams.toString()}`);
    
    // Store pagination data from API response
    if (response.data && response.data.pagination) {
      paginationData.value = response.data.pagination;
    }
    
    // Transform the API response data to match UI expectations
    const transformedData = response.data.data.map(item => ({
      id: item.id,
      nik: item.nik,
      nama: item.name,
      tempatLahir: item.birthPlace || '',
      tanggalLahir: item.birthDate || '',
      jenisKelamin: item.gender === 'MALE' ? 'L' : 'P',
      status: getStatusFromAPI(item.maritalStatus, item.job),
      alamat: item.address || '',
      agama: item.religion || '',
      kodePos: item.postalCode || ''
    }));
    wargaList.value = transformedData;
  } catch (error) {
    console.error('Error loading warga data:', error);
    toast.error('Gagal memuat data warga');
    // Fallback to sample data if API fails - transform sample data too
    const transformedSample = sampleWarga.map(item => ({
      id: item.id,
      nik: item.nik,
      nama: item.name,
      tempatLahir: item.birthPlace,
      tanggalLahir: item.birthDate,
      jenisKelamin: item.gender === 'MALE' ? 'L' : 'P',
      status: getStatusFromAPI(item.maritalStatus, item.job),
      alamat: item.address,
      agama: item.religion,
      kodePos: item.postalCode
    }));
    wargaList.value = [...transformedSample];
    // Set mock pagination data for fallback
    paginationData.value = {
      current_page: 1,
      total_pages: 1,
      total_count: transformedSample.length,
      per_page: 10,
      has_next: false,
      has_previous: false,
      next_page: null,
      previous_page: null
    };
  }
};

// Helper function to determine status based on API fields
const getStatusFromAPI = (maritalStatus, job) => {
  if (maritalStatus === 'MARRIED' && job === 'Software Engineer') {
    return 'Kepala Keluarga';
  } else if (maritalStatus === 'MARRIED') {
    return 'Istri';
  } else if (maritalStatus === 'SINGLE' && new Date().getFullYear() - new Date().getFullYear() < 18) {
    return 'Anak';
  } else {
    return 'Lainnya';
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
    // Format birthDate to proper ISO datetime format with time component
    // API expects format like: '1998-04-23T00:00:00.000Z'
    const formatDateToISO = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      // Set time to midnight UTC and ensure proper ISO format
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
    }
    
    // Transform UI data to API format dengan menambahkan semua field wajib yang diperlukan
    const apiPayload = {
      id: payload.id,
      nik: payload.nik,
      noKk: payload.noKk || '3276012304980002', // Default No KK
      name: payload.nama,
      birthPlace: payload.tempatLahir,
      birthDate: formatDateToISO(payload.tanggalLahir),
      gender: payload.jenisKelamin === 'L' ? 'MALE' : 'FEMALE',
      maritalStatus: getMaritalStatusFromUI(payload.status),
      job: payload.job || 'Software Engineer',
      address: payload.alamat,
      rtNumber: payload.rtNumber || '03', // Default RT Number
      rwNumber: payload.rwNumber || '05', // Default RW Number
      kelurahan: payload.kelurahan || 'Cibaduyut', // Default Kelurahan
      kecamatan: payload.kecamatan || 'Dayeuhkolot', // Default Kecamatan
      kabupaten: payload.kabupaten || 'Bandung', // Default Kabupaten
      provinsi: payload.provinsi || 'Jawa Barat', // Default Provinsi
      religion: payload.agama,
      postalCode: payload.kodePos
    };
    
    const response = await $fetch(`/api/warga/${payload.id}`, {
      method: 'PUT',
      body: apiPayload
    });
    
    // Handle response with the exact API structure provided
    if (response && response.success === true) {
      // Extract success message from response
      toast.success(response.message || 'Data warga berhasil diperbarui');
      
      // Reload data from server
      await loadWargaData();
      
      // Close the edit modal
      showEdit.value = false;
    } else {
      // Handle error response with the exact structure
      let errorMessage = 'Terjadi kesalahan saat memperbarui data';
      
      if (response?.message) {
        errorMessage = response.message;
      } else if (response?.error?.details?.field_errors) {
        // Extract field errors
        errorMessage = Object.values(response.error.details.field_errors).join('\n');
      }
      
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('Error updating warga:', error);
    toast.error('Gagal terhubung ke server. Coba lagi nanti.');
  }
};

const saveResident = async (payload) => {
  try {
    // Format birthDate to proper ISO datetime format with time component
    // API expects format like: '1998-04-23T00:00:00.000Z'
    const formatDateToISO = (dateStr) => {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      // Set time to midnight UTC and ensure proper ISO format
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
    }
    
    // Transform UI data to API format dengan menambahkan semua field wajib yang diperlukan
    const apiPayload = {
      nik: payload.nik,
      noKk: payload.noKk || '3276012304980002', // Default No KK
      name: payload.nama,
      birthPlace: payload.tempatLahir,
      birthDate: formatDateToISO(payload.tanggalLahir),
      gender: payload.jenisKelamin === 'L' ? 'MALE' : 'FEMALE',
      maritalStatus: getMaritalStatusFromUI(payload.status),
      job: payload.job || 'Software Engineer',
      address: payload.alamat,
      rtNumber: payload.rtNumber || '03', // Default RT Number
      rwNumber: payload.rwNumber || '05', // Default RW Number
      kelurahan: payload.kelurahan || 'Cibaduyut', // Default Kelurahan
      kecamatan: payload.kecamatan || 'Dayeuhkolot', // Default Kecamatan
      kabupaten: payload.kabupaten || 'Bandung', // Default Kabupaten
      provinsi: payload.provinsi || 'Jawa Barat', // Default Provinsi
      religion: payload.agama,
      postalCode: payload.kodePos
    };
    
    const response = await $fetch('/api/warga/create', { 
      method: 'POST',
      body: apiPayload
    });
    
    // Handle response with the exact API structure provided
    if (response && response.success === true) {
      // Extract success message from response
      toast.success(response.message || 'Data warga berhasil ditambahkan');
      
      // Reload data from server
      await loadWargaData();
      
      // Close the create modal
      showCreate.value = false;
    } else {
      // Handle error response with the exact structure
      let errorMessage = 'Terjadi kesalahan saat menyimpan data';
      
      if (response?.message) {
        errorMessage = response.message;
      } else if (response?.error?.details?.field_errors) {
        // Extract field errors
        errorMessage = Object.values(response.error.details.field_errors).join('\n');
      }
      
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('Error saving warga:', error);
    toast.error('Gagal terhubung ke server. Coba lagi nanti.');
  }
};

// Helper function to convert UI status to API marital status
const getMaritalStatusFromUI = (status) => {
  if (status === 'Kepala Keluarga' || status === 'Istri') {
    return 'MARRIED';
  } else if (status === 'Anak') {
    return 'SINGLE';
  } else {
    return 'SINGLE';
  }
};
const showDelete = ref(false);
const toDelete = ref(null); // simpan objek/ID yang mau dihapus

const askDelete = (payload) => {
  toDelete.value = payload; // 直接保存warga对象
  showDelete.value = true;
};

const confirmDelete = async () => {
  try {
    // Cek apakah ID berupa angka atau string
    const wargaId = toDelete.value.id;
    
    const response = await $fetch(`/api/warga/${wargaId}`, {
      method: 'DELETE'
    });
    
    // Check if response is successful based on the API structure
    // API returns a standard ApiResponse object with success: true
    if (response && response.success === true) {
      toast.success(response.message || 'Data warga berhasil dihapus');
      await loadWargaData(); // Reload data dari server
    } else {
      // Menangani error khusus ID format invalid
      if (response?.error?.code === 'VALIDATION_ERROR' && response?.error?.field === 'id') {
        // Jika menggunakan data dummy, hapus dari daftar lokal saja
        if (typeof wargaId === 'number') {
          wargaList.value = wargaList.value.filter(w => w.id !== wargaId);
          toast.success('Data warga berhasil dihapus dari tampilan lokal');
        } else {
          toast.error(response?.message || 'Format ID warga tidak valid');
        }
      } else {
        toast.error(response?.message || 'Gagal menghapus data warga');
      }
    }
  } catch (error) {
    // Menangani error validasi ID format
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Invalid warga ID format')) {
      // Jika menggunakan data dummy, hapus dari daftar lokal saja
      if (typeof toDelete.value.id === 'number') {
        wargaList.value = wargaList.value.filter(w => w.id !== toDelete.value.id);
        toast.success('Data warga berhasil dihapus dari tampilan lokal');
      } else {
        toast.error('Format ID warga tidak valid');
      }
    } else {
      console.error('Error deleting warga:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
    }
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
