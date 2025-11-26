<template>
  <div
    :class="inline ? 'bg-white rounded-2xl shadow-sm border border-gray-200 p-0' : 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'"
    @click.self="inline ? undefined : closeForm"
  >
    <div
      :class="inline ? 'bg-white rounded-2xl shadow-sm w-full' : 'bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto'"
      @click.stop
    >
      <div class="px-6 py-5 sm:p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg leading-6 font-medium text-gray-900">Tambah Rumah</h3>
        </div>
        <button
          v-if="!inline"
          type="button"
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
          @click="closeForm"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="submitForm()" class="p-4 sm:p-6 space-y-6">
        <!-- Bagian: Keluarga -->
        <div class="space-y-6">
          <h4 class="text-base font-semibold text-gray-900">Informasi Keluarga</h4>
          <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 sm:col-span-8 md:col-span-9">
              <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Keluarga <span class="text-gray-500 text-xs">(opsional)</span></label>
              <input
                :value="familyQuery"
                @input="searchFamilies(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Cari No KK / Nama Keluarga / Kepala Keluarga..."
                class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div class="col-span-12 sm:col-span-4 md:col-span-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Hasil</label>
              <select
                @change="chooseFamily(($event.target as HTMLSelectElement).value)"
                class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">Pilih hasil</option>
                <option v-for="fam in familyOptions" :key="fam.id" :value="fam.id">
                  {{ fam.noKk }} - {{ fam.head_name }} ({{ fam.name }})
                </option>
              </select>
            </div>
            <div v-if="selectedFamily" class="col-span-12 text-sm text-gray-600">
              <p>No KK: <span class="font-medium">{{ selectedFamily.no_kk }}</span></p>
              <p>Kepala: <span class="font-medium">{{ selectedFamily.head_name }}</span></p>
              <p>Alamat: <span class="font-medium">{{ selectedFamily.address }}</span></p>
            </div>
          </div>
        </div>

        <!-- Bagian: Kepala Keluarga & Kuantitas -->
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-8 md:col-span-7">
            <label class="block text-sm font-medium text-gray-700 mb-1">Kepala Keluarga <span class="text-red-500">*</span> <span class="text-gray-500 text-xs">(wajib isi salah satu: Kepala Keluarga atau pilih Keluarga)</span></label>
            <div class="grid grid-cols-12 gap-3">
              <input
                :value="headQuery"
                @input="searchWargaHeads(($event.target as HTMLInputElement).value)"
                type="text"
                placeholder="Cari Nama/NIK Kepala Keluarga..."
                class="col-span-12 sm:col-span-8 px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <select
                v-model="form.headNik"
                class="col-span-12 sm:col-span-4 px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
              >
                <option value="">Pilih hasil</option>
                <option v-for="opt in headOptions" :key="opt.nik" :value="opt.nik">{{ opt.nik }} - {{ opt.name }}</option>
              </select>
              <p v-if="headQuery && headOptions.length === 0" class="col-span-12 text-xs text-gray-500">Tidak ada hasil untuk input ini. Coba ketik nama atau pastikan NIK benar.</p>
              <!-- NIK Kepala (manual input) -->
              <div class="col-span-12">
                <label class="block text-sm font-medium text-gray-700 mb-1">NIK Kepala</label>
                <input
                  v-model="form.headNik"
                  type="text"
                  inputmode="numeric"
                  pattern="\d{16}"
                  maxlength="16"
                  placeholder="Masukkan NIK 16 digit"
                  @input="searchWargaHeads(($event.target as HTMLInputElement).value)"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div v-if="selectedHead" class="mt-2 text-sm text-gray-600">
              <div class="flex flex-wrap gap-4">
                <span><span class="text-gray-500">Nama:</span> <span class="font-medium">{{ selectedHead.name }}</span></span>
                <span v-if="selectedHead.noKk"><span class="text-gray-500">No KK:</span> <span class="font-medium">{{ selectedHead.noKk }}</span></span>
                <span v-if="selectedHead.address"><span class="text-gray-500">Alamat:</span> <span class="font-medium">{{ selectedHead.address }}</span></span>
              </div>
            </div>
          </div>
          <div class="col-span-12 sm:col-span-4 md:col-span-5 grid grid-cols-12 gap-4">
            <div class="col-span-12 sm:col-span-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Kepala Keluarga</label>
              <input type="number" v-model.number="form.familyCount" min="0" class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
            <div class="col-span-12 sm:col-span-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">Total Anggota Keluarga</label>
              <input type="number" v-model.number="form.memberCount" min="0" class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
            </div>
          </div>
        </div>

        <!-- Bagian: Alamat -->
         <div class="space-y-6">
          <h4 class="text-base font-semibold text-gray-900">Alamat</h4>
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-6 sm:col-span-3 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">RT <span class="text-red-500">*</span></label>
          <input v-model="form.rtNumber" type="text" inputmode="numeric" pattern="\d*" maxlength="3" class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
        </div>
        <div class="col-span-6 sm:col-span-3 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">RW <span class="text-red-500">*</span></label>
          <input v-model="form.rwNumber" type="text" inputmode="numeric" pattern="\d*" maxlength="3" class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
        </div>
        <div class="col-span-6 sm:col-span-3 md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Nomor Rumah</label>
          <input v-model="form.houseNumber" type="text" inputmode="numeric" pattern="[\dA-Za-z\-\/]*" maxlength="10" class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
        </div>
        <!-- Lokasi desa fix: kolom selain RT/RW/Nomor Rumah dihapus -->
      </div>
        </div>

        <!-- Aksi -->
        <div class="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            @click="inline ? resetForm?.() : closeForm()"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="formLoading || !canSubmit"
            class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
        <p v-if="formError" class="mt-2 text-sm text-red-600">{{ formError }}</p>
        
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Model for form (two-way binding from parent)
const form = defineModel<any>('form')

// Props for rest of state and actions
const {
  inline,
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
  closeForm,
  resetForm,
  submitForm,
  canSubmit,
} = defineProps<{
  inline?: boolean
  formLoading: any
  formError: any
  headQuery: any
  headOptions: any
  searchWargaHeads: (q: string) => any
  familyQuery: any
  familyOptions: any
  selectedFamily: any
  searchFamilies: (q: string) => any
  chooseFamily: (id: string) => any
  closeForm: () => any
  resetForm?: () => any
  submitForm: () => any
  canSubmit: any
}>()

const selectedHead = computed(() => {
  return (Array.isArray((<any>headOptions)) ? (<any>headOptions) : [])
    .find((h: any) => h?.nik === form.value?.headNik)
})
</script>

<style scoped></style>
