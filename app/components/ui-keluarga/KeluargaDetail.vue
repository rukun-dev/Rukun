<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        @click="closeModal"
      ></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
        <div class="bg-white px-6 py-5 sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Detail Kartu Keluarga
                </h3>
                <button 
                  type="button" 
                  class="text-gray-400 hover:text-gray-500 focus:outline-none"
                  @click="closeModal"
                >
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Kartu Keluarga Content -->
              <div v-if="keluarga" class="space-y-6">
                <!-- Header Card -->
                <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-xl">
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 class="text-sm font-medium opacity-80">No. Kartu Keluarga</h4>
                      <p class="text-2xl font-bold mt-1">{{ keluarga.noKk }}</p>
                    </div>
                    <div class="mt-4 md:mt-0">
                      <h4 class="text-sm font-medium opacity-80">Kepala Keluarga</h4>
                      <p class="text-xl font-bold mt-1">{{ keluarga.kepalaKeluarga }}</p>
                      <p class="text-sm mt-1 opacity-80">NIK: {{ keluarga.nikKepala }}</p>
                    </div>
                  </div>
                </div>

                <!-- Detail Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Alamat -->
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <h5 class="text-sm font-medium text-gray-500 mb-2">Alamat</h5>
                    <p class="text-gray-900">{{ keluarga.alamat }}</p>
                    <p class="text-gray-700 mt-1">RT {{ keluarga.rt }} / RW {{ keluarga.rw }}</p>
                    <p class="text-gray-700 mt-1">{{ keluarga.kelurahan }}, {{ keluarga.kecamatan }}</p>
                    <p class="text-gray-700 mt-1">{{ keluarga.kabupaten }}, {{ keluarga.provinsi }}</p>
                  </div>

                  <!-- Info Lain -->
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <h5 class="text-sm font-medium text-gray-500 mb-2">Informasi Lain</h5>
                    <div class="space-y-2">
                      <p class="text-gray-900">
                        <span class="font-medium">Nama Keluarga:</span> {{ keluarga.namaKeluarga }}
                      </p>
                      <p class="text-gray-900">
                        <span class="font-medium">Jumlah Anggota:</span> {{ keluarga.jumlahAnggota }} orang
                      </p>
                      <p class="text-gray-900">
                        <span class="font-medium">Status:</span>
                        <span :class="getStatusClass(keluarga.status)" class="ml-2 px-2 py-1 rounded-full text-xs font-medium">
                          {{ keluarga.status }}
                        </span>
                      </p>
                      <p class="text-gray-900" v-if="keluarga.updatedAt">
                        <span class="font-medium">Diperbarui:</span> {{ formatDate(keluarga.updatedAt) }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Anggota Keluarga (simulasi) -->
                <div>
                  <h5 class="text-lg font-medium text-gray-900 mb-3">Anggota Keluarga</h5>
                  <div class="bg-gray-50 p-4 rounded-xl">
                    <div class="overflow-x-auto">
                      <table class="min-w-full">
                        <thead>
                          <tr class="border-b border-gray-200">
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hubungan</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr class="border-b border-gray-200">
                            <td class="px-4 py-3 text-sm text-gray-900">1</td>
                            <td class="px-4 py-3 text-sm text-gray-900">{{ keluarga.nikKepala }}</td>
                            <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ keluarga.kepalaKeluarga }}</td>
                            <td class="px-4 py-3 text-sm text-gray-900">Kepala Keluarga</td>
                          </tr>
                          <!-- Simulasi anggota tambahan -->
                          <tr v-for="i in Math.min(3, keluarga.jumlahAnggota - 1)" :key="i" class="border-b border-gray-200">
                            <td class="px-4 py-3 text-sm text-gray-900">{{ i + 1 }}</td>
                            <td class="px-4 py-3 text-sm text-gray-900">
                              {{ keluarga.nikKepala.substring(0, 13) }}{{ 100 + i }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900">
                              {{ getRelationName(keluarga.kepalaKeluarga, i) }}
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-900">
                              {{ getRelation(i) }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div v-if="keluarga.jumlahAnggota > 4" class="mt-3 text-center">
                      <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Lihat semua {{ keluarga.jumlahAnggota }} anggota
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="closeModal"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="printDetail"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Cetak Detail
                  </button>
                </div>
              </div>

              <!-- Empty State -->
              <div v-else class="py-12 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 class="mt-2 text-lg font-medium text-gray-900">Data Tidak Ditemukan</h3>
                <p class="mt-1 text-sm text-gray-500">
                  Tidak dapat memuat detail kartu keluarga.
                </p>
                <button
                  type="button"
                  class="mt-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  @click="closeModal"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Props & Emits
interface Keluarga {
  id: number;
  noKk: string;
  kepalaKeluarga: string;
  nikKepala: string;
  jumlahAnggota: number;
  alamat: string;
  rt: string;
  rw: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaKeluarga: string;
  status: string;
  updatedAt?: string;
}

const props = defineProps<{
  keluarga?: Keluarga | null;
}>();

const emit = defineEmits<{
  close: [];
}>();

// Methods
const closeModal = () => {
  emit('close');
};

const getStatusClass = (status: string) => {
  return {
    'Aktif': 'bg-green-100 text-green-800',
    'Tidak Aktif': 'bg-red-100 text-red-800'
  }[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const getRelation = (index: number): string => {
  const relations = ['Istri', 'Anak Laki-laki', 'Anak Perempuan', 'Ayah', 'Ibu'];
  return relations[index % relations.length] || '';
};

const getRelationName = (kepalaName: string, index: number): string => {
  const baseName = kepalaName.split(' ')[0];
  const suffixes = ['Wati', 'Putra', 'Putri', 'Bapak', 'Ibu'];
  const suffix = suffixes[index % suffixes.length];
  
  if (index === 0) {
    return `${baseName} ${suffix}`; // Istri
  } else if (index === 1) {
    return `${baseName} ${suffix} ${index + 1}`; // Anak pertama
  } else {
    return `${baseName} ${suffix} ${index + 1}`; // Anak lainnya
  }
};

const printDetail = () => {
  if (props.keluarga) {
    // Simulasi print functionality
    console.log('Printing detail for:', props.keluarga);
    // In a real app, this would trigger window.print() or call an API to generate a PDF
    alert('Fitur cetak akan membuka jendela cetak.');
  }
};
</script>

<style scoped>
/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .sm\:max-w-3xl {
    max-width: 100%;
    margin: 0 1rem;
  }
}
</style>