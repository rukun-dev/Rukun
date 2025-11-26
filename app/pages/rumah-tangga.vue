<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Content Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div></div>
          <button
            @click="openForm()"
            class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Tambah Rumah</span>
          </button>
        </div>
      </div>

      <!-- Stats (Houses) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Rumah -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Rumah</p>
              <h3 class="text-3xl font-bold text-gray-900">{{ pagination?.total || houses.length }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9.5l9-6 9 6M5 10v9h14v-9M9 14h6v5H9z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Keluarga -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Keluarga</p>
              <h3 class="text-3xl font-bold text-gray-900">{{ houses.reduce((sum, h) => sum + (h.familyCount || 0), 0) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Anggota -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">Total Anggota</p>
              <h3 class="text-3xl font-bold text-gray-900">{{ houses.reduce((sum, h) => sum + (h.memberCount || 0), 0) }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- RT Unik -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500 mb-1">RT Unik (halaman ini)</p>
              <h3 class="text-3xl font-bold text-gray-900">{{ new Set(houses.map(h => h.rtNumber)).size }}</h3>
            </div>
            <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters (Houses) -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Cari</label>
            <input
              v-model="searchTerm"
              @input="loadHouses(1)"
              type="text"
              placeholder="Cari RT/RW, Kepala Keluarga, NIK Kepala..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              @click="resetHousesFilter"
              class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
            >Reset</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">Data Rumah Tangga</h3>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">
                Menampilkan halaman {{ currentPage }} dari {{ totalPages }},
                total {{ pagination?.total || houses.length }} data
              </span>
              <select
                v-model.number="limit"
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
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor Rumah</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK Kepala</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT/RW</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Kepala Keluarga</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Anggota Keluarga</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="housesLoading">
                <td colspan="7" class="px-6 py-4 text-sm text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="housesError">
                <td colspan="7" class="px-6 py-4 text-sm text-red-600">{{ housesError }}</td>
              </tr>
              <tr v-else-if="houses.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">Tidak ada data</td>
              </tr>
              <tr v-else v-for="h in houses" :key="h.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.houseNumber || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>{{ h.head?.name || '-' }}</div>
                  <div v-if="(h.familyCount || 0) > 1" class="text-xs text-gray-500">(+{{ (h.familyCount || 0) - 1 }} KK lainnya)</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ h.headNik }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.rtNumber }}/{{ h.rwNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.familyCount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.memberCount }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div class="flex items-center space-x-3">
                    <button
                      @click="startEdit(h)"
                      class="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Edit"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      @click="askDelete(h)"
                      class="text-red-600 hover:text-red-800 transition-colors"
                      title="Hapus"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <button
                @click="currentPage = 1"
                :disabled="(pagination?.page || 1) <= 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                @click="goPrevPage()"
                :disabled="(pagination?.page || 1) <= 1"
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
                  (pagination?.page || currentPage) === page
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
                @click="goNextPage()"
                :disabled="(pagination?.page || 1) >= (pagination?.total_pages || totalPages)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                @click="currentPage = totalPages"
                :disabled="(pagination?.page || 1) >= (pagination?.total_pages || totalPages)"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Modal Form Tambah Rumah -->
    <HouseForm
      v-if="showForm"
      v-model:form="form"
      :formLoading="formLoading"
      :formError="formError"
      :headQuery="headQuery"
      :headOptions="headOptions"
      :searchWargaHeads="searchWargaHeads"
      :rtConfigured="rtConfigured"
      :familyQuery="familyQuery"
      :familyOptions="familyOptions"
      :selectedFamily="selectedFamily"
      :searchFamilies="searchFamilies"
      :chooseFamily="chooseFamily"
      :closeForm="closeForm"
      :title="isEditing ? 'Edit Rumah' : 'Tambah Rumah'"
      :submitForm="submitForm"
      :canSubmit="canSubmit"
    />

    <ConfirmDelete
      v-model="showDelete"
      title="Hapus Rumah?"
      message="Apakah Anda yakin ingin menghapus rumah ini?"
      :details="toDelete ? `${toDelete.houseNumber || '-'} • NIK ${toDelete.headNik}` : ''"
      @confirm="confirmDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useHouses } from '@/composables/useHouses'
import HouseForm from '@/components/form/House/HouseForm.vue'
import ConfirmDelete from '@/components/form/warga/ConfirmDelete.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

// Single composable instance for consistent state across list and form
const {
  houses,
  pagination,
  loading: housesLoading,
  error: housesError,
  searchTerm,
  currentPage,
  limit,
  loadHouses,
  // form state & actions
  showForm,
  form,
  formLoading,
  formError,
  headQuery,
  headOptions,
  searchWargaHeads,
  rtConfigured,
  loadRtProfile,
  familyQuery,
  familyOptions,
  selectedFamily,
  searchFamilies,
  chooseFamily,
  openForm,
  closeForm,
  resetForm,
  submitForm,
  canSubmit,
  // edit/delete
  startEdit,
  deleteHouse,
  isEditing,
} = useHouses()

// Derived pagination helpers for safer template bindings
const totalPages = computed(() => pagination.value?.total_pages ?? 1)
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const cur = pagination.value?.page ?? currentPage.value
  let start = Math.max(1, cur - 2)
  let end = Math.min(total, cur + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else if (end === total) start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

onMounted(async () => {
  try {
    await loadRtProfile()
  } catch (e) {
    // Biarkan form tetap muncul; jika profil RT belum ada, field lokasi akan tampil
  }
  loadHouses(1)
})

// Reload when page size changes
watch(limit, () => {
  loadHouses(1)
})

// Reload when page changes via header buttons
watch(currentPage, (p) => {
  loadHouses(p)
})

function resetHousesFilter() {
  searchTerm.value = ''
  loadHouses(1)
}

function goPrevPage() {
  const current = pagination.value?.page ?? 1
  const page = current - 1
  if (page >= 1) {
    loadHouses(page)
  }
}

function goNextPage() {
  const current = pagination.value?.page ?? 1
  const max = pagination.value?.total_pages ?? 1
  const page = current + 1
  if (page <= max) {
    loadHouses(page)
  }
}

const formatDate = (d: string) => {
  if (!d) return '-'
  const date = new Date(d)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
}

// Delete modal state & handlers
const showDelete = ref(false)
const toDelete = ref<any>(null)
function askDelete(h: any) {
  toDelete.value = h
  showDelete.value = true
}
const confirmDelete = async () => {
  try {
    if (!toDelete.value) return
    await deleteHouse(toDelete.value.id)
  } finally {
    showDelete.value = false
    toDelete.value = null
  }
}
</script>

<style scoped></style>
