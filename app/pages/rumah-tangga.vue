<template>
  <div class="min-h-screen bg-white">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">Rumah Tangga</h1>
        <p class="text-gray-500">Data keluarga/household di lingkungan RT.</p>
      </div>

      <!-- Stats (Houses) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm font-medium text-gray-500">Total Rumah</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ pagination?.total || houses.length }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm font-medium text-gray-500">Total Keluarga</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ houses.reduce((sum, h) => sum + (h.familyCount || 0), 0) }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm font-medium text-gray-500">Total Anggota</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ houses.reduce((sum, h) => sum + (h.memberCount || 0), 0) }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p class="text-sm font-medium text-gray-500">RT Unik (halaman ini)</p>
          <p class="text-2xl font-bold text-gray-900 mt-1">{{ new Set(houses.map(h => h.rtNumber)).size }}</p>
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
              placeholder="Cari RT/RW, Kelurahan, Kecamatan, Kabupaten, Provinsi, Kepala..."
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
          <div class="flex items-center justify-between gap-3">
            <h3 class="text-lg font-semibold text-gray-900">Daftar Rumah Tangga</h3>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600 hidden sm:inline">Menampilkan {{ houses.length }} data</span>
              <button
                @click="openForm()"
                class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><path d="M12 5c.552 0 1 .448 1 1v5h5c.552 0 1 .448 1 1s-.448 1-1 1h-5v5c0 .552-.448 1-1 1s-1-.448-1-1v-5H6c-.552 0-1-.448-1-1s.448-1 1-1h5V6c0-.552.448-1 1-1z"/></svg>
                Tambah Rumah
              </button>
            </div>
          </div>
        </div>

        <!-- Form Tambah Rumah -->
        <div v-if="showForm" class="px-6 py-4 border-b border-gray-200 bg-white">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Pilih Keluarga -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Keluarga (opsional)</label>
              <div class="flex gap-2">
                <input
                  v-model="familyQuery"
                  @input="searchFamilies(familyQuery)"
                  type="text"
                  placeholder="Cari No KK / Nama Keluarga / Kepala Keluarga..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  @change="chooseFamily(($event.target as HTMLSelectElement).value)"
                  class="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Pilih hasil</option>
                  <option v-for="fam in familyOptions" :key="fam.id" :value="fam.id">
                    {{ fam.noKk }} - {{ fam.head_name }} ({{ fam.name }})
                  </option>
                </select>
              </div>
              <div v-if="selectedFamily" class="mt-2 text-sm text-gray-600">
                <p>No KK: <span class="font-medium">{{ selectedFamily.no_kk }}</span></p>
                <p>Kepala: <span class="font-medium">{{ selectedFamily.head_name }}</span></p>
                <p>Alamat: <span class="font-medium">{{ selectedFamily.address }}</span></p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Kepala Keluarga</label>
              <div class="flex gap-2">
                <input
                  v-model="headQuery"
                  @input="searchWargaHeads(headQuery)"
                  type="text"
                  placeholder="Cari NIK/Nama..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  v-model="form.headNik"
                  class="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Pilih hasil</option>
                  <option v-for="opt in headOptions" :key="opt.nik" :value="opt.nik">{{ opt.nik }} - {{ opt.name }}</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Keluarga</label>
                <input type="number" v-model.number="form.familyCount" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Anggota</label>
                <input type="number" v-model.number="form.memberCount" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">RT</label>
                <input v-model="form.rtNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">RW</label>
                <input v-model="form.rwNumber" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kelurahan</label>
                <input v-model="form.kelurahan" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <input v-model="form.kecamatan" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                <input v-model="form.kabupaten" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                <input v-model="form.provinsi" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                <input v-model="form.postalCode" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                :disabled="formLoading || !canSubmit"
                @click="submitForm()"
                class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
              >Simpan Rumah</button>
              <button @click="closeForm()" class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm">Batal</button>
              <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
            </div>
          </div>
        </div>
        <!-- Body -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK Kepala</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RT/RW</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelurahan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kecamatan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kabupaten</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provinsi</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Pos</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="housesLoading">
                <td colspan="9" class="px-6 py-4 text-sm text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="housesError">
                <td colspan="9" class="px-6 py-4 text-sm text-red-600">{{ housesError }}</td>
              </tr>
              <tr v-else-if="houses.length === 0">
                <td colspan="9" class="px-6 py-8 text-center text-sm text-gray-500">Tidak ada data</td>
              </tr>
              <tr v-else v-for="h in houses" :key="h.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ h.head?.name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ h.headNik }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.rtNumber }}/{{ h.rwNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.kelurahan }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.kecamatan }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.kabupaten }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.provinsi }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ h.postalCode || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{{ formatDate(h.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </div>
          <div class="flex items-center gap-2">
            <button
              class="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              :disabled="(currentPage || 1) <= 1"
              @click="goPrevPage()"
            >Sebelumnya</button>
            <button
              class="px-3 py-1 text-sm rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              :disabled="(currentPage || 1) >= totalPages"
              @click="goNextPage()"
            >Berikutnya</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useHouses } from '@/composables/useHouses'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

// Houses listing controls
const {
  houses,
  pagination,
  loading: housesLoading,
  error: housesError,
  searchTerm,
  currentPage,
  loadHouses,
} = useHouses()

// Houses form controls
const {
  showForm,
  form,
  formLoading,
  formError,
  headQuery,
  headOptions,
  searchWargaHeads,
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
} = useHouses()

// Derived pagination helpers for safer template bindings
const totalPages = computed(() => pagination.value?.total_pages ?? 1)

onMounted(() => {
  loadHouses(1)
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
</script>

<style scoped></style>
