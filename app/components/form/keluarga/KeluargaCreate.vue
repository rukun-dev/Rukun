<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen bg-black/50 pt-4 px-4 pb-20 text-center sm:block sm:p-50">
      <!-- Background overlay -->
      <div 
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
        @click="closeModal"
      ></div>
      
      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle  sm:max-w-3xl sm:w-full">
        <div class="bg-white px-6 py-5 sm:p-6">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Tambah Kartu Keluarga
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

              <!-- Form Content -->
              <form @submit.prevent="handleSubmit">
                <div class="space-y-6">
                  <!-- No. KK & Status -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="noKk" class="block text-sm font-medium text-gray-700 mb-1">
                        No. Kartu Keluarga <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="noKk"
                        v-model="form.noKk"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan No. Kartu Keluarga"
                        maxlength="16"
                      />
                      <p v-if="errors.noKk" class="mt-1 text-sm text-red-600">{{ errors.noKk }}</p>
                    </div>
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
                        Status <span class="text-red-500">*</span>
                      </label>
                      <select
                        id="status"
                        v-model="form.status"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                      >
                        <option value="">Pilih Status</option>
                        <option value="Aktif">Aktif</option>
                        <option value="Tidak Aktif">Tidak Aktif</option>
                      </select>
                      <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
                    </div>
                  </div>

                  <!-- Kepala Keluarga & NIK -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="kepalaKeluarga" class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Kepala Keluarga <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kepalaKeluarga"
                        v-model="form.kepalaKeluarga"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Nama Kepala Keluarga"
                      />
                      <p v-if="errors.kepalaKeluarga" class="mt-1 text-sm text-red-600">{{ errors.kepalaKeluarga }}</p>
                    </div>
                    <div>
                      <label for="nikKepala" class="block text-sm font-medium text-gray-700 mb-1">
                        NIK Kepala Keluarga <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nikKepala"
                        v-model="form.nikKepala"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan NIK Kepala Keluarga"
                        maxlength="16"
                      />
                      <p v-if="errors.nikKepala" class="mt-1 text-sm text-red-600">{{ errors.nikKepala }}</p>
                    </div>
                  </div>

                  <!-- Alamat -->
                  <div>
                    <label for="alamat" class="block text-sm font-medium text-gray-700 mb-1">
                      Alamat <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      id="alamat"
                      v-model="form.alamat"
                      required
                      rows="3"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Masukkan Alamat Lengkap"
                    ></textarea>
                    <p v-if="errors.alamat" class="mt-1 text-sm text-red-600">{{ errors.alamat }}</p>
                  </div>

                  <!-- RT/RW & Jumlah Anggota -->
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label for="rt" class="block text-sm font-medium text-gray-700 mb-1">
                        RT <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="rt"
                        v-model="form.rt"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="RT"
                        maxlength="2"
                      />
                      <p v-if="errors.rt" class="mt-1 text-sm text-red-600">{{ errors.rt }}</p>
                    </div>
                    <div>
                      <label for="rw" class="block text-sm font-medium text-gray-700 mb-1">
                        RW <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="rw"
                        v-model="form.rw"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="RW"
                        maxlength="2"
                      />
                      <p v-if="errors.rw" class="mt-1 text-sm text-red-600">{{ errors.rw }}</p>
                    </div>
                    <div>
                      <label for="jumlahAnggota" class="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah Anggota <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="jumlahAnggota"
                        v-model.number="form.jumlahAnggota"
                        required
                        min="1"
                        max="20"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="1"
                      />
                      <p v-if="errors.jumlahAnggota" class="mt-1 text-sm text-red-600">{{ errors.jumlahAnggota }}</p>
                    </div>
                  </div>

                  <!-- Provinsi & Kabupaten -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="provinsi" class="block text-sm font-medium text-gray-700 mb-1">
                        Provinsi <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="provinsi"
                        v-model="form.provinsi"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Provinsi"
                      />
                      <p v-if="errors.provinsi" class="mt-1 text-sm text-red-600">{{ errors.provinsi }}</p>
                    </div>
                    <div>
                      <label for="kabupaten" class="block text-sm font-medium text-gray-700 mb-1">
                        Kabupaten <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kabupaten"
                        v-model="form.kabupaten"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Kabupaten"
                      />
                      <p v-if="errors.kabupaten" class="mt-1 text-sm text-red-600">{{ errors.kabupaten }}</p>
                    </div>
                  </div>

                  <!-- Kecamatan & Kelurahan -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="kecamatan" class="block text-sm font-medium text-gray-700 mb-1">
                        Kecamatan <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kecamatan"
                        v-model="form.kecamatan"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Kecamatan"
                      />
                      <p v-if="errors.kecamatan" class="mt-1 text-sm text-red-600">{{ errors.kecamatan }}</p>
                    </div>
                    <div>
                      <label for="kelurahan" class="block text-sm font-medium text-gray-700 mb-1">
                        Kelurahan <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kelurahan"
                        v-model="form.kelurahan"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Kelurahan"
                      />
                      <p v-if="errors.kelurahan" class="mt-1 text-sm text-red-600">{{ errors.kelurahan }}</p>
                    </div>
                  </div>

                  <!-- Nama Keluarga & Kode Pos -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label for="namaKeluarga" class="block text-sm font-medium text-gray-700 mb-1">
                        Nama Keluarga <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="namaKeluarga"
                        v-model="form.namaKeluarga"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Masukkan Nama Keluarga"
                      />
                      <p v-if="errors.namaKeluarga" class="mt-1 text-sm text-red-600">{{ errors.namaKeluarga }}</p>
                    </div>
                    <div>
                      <label for="kodePos" class="block text-sm font-medium text-gray-700 mb-1">
                        Kode Pos <span class="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="kodePos"
                        v-model="form.kodePos"
                        required
                        class="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="12345"
                        maxlength="5"
                        pattern="\d*"
                        inputmode="numeric"
                      />
                      <p v-if="errors.kodePos" class="mt-1 text-sm text-red-600">{{ errors.kodePos }}</p>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    class="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click="closeModal"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// Props & Emits
interface FormData {
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
  kodePos: string;
  status: string;
}

const emit = defineEmits<{
  close: [];
  save: [data: FormData];
}>();

// Form state
const form = reactive<FormData>({
  noKk: '',
  kepalaKeluarga: '',
  nikKepala: '',
  jumlahAnggota: 1,
  alamat: '',
  rt: '',
  rw: '',
  provinsi: '',
  kabupaten: '',
  kecamatan: '',
  kelurahan: '',
  namaKeluarga: '',
  kodePos: '',
  status: ''
});

// Validation errors
const errors = reactive<Partial<Record<keyof FormData, string>>>({});

// Methods
const closeModal = () => {
  emit('close');
};

const validateForm = (): boolean => {
  let isValid = true;
  
  // Reset errors
  Object.keys(errors).forEach(key => delete errors[key as keyof FormData]);
  
  // Validate required fields
  if (!form.noKk.trim()) {
    errors.noKk = 'No. Kartu Keluarga harus diisi';
    isValid = false;
  } else if (form.noKk.length !== 16) {
    errors.noKk = 'No. Kartu Keluarga harus 16 digit';
    isValid = false;
  }
  
  if (!form.kepalaKeluarga.trim()) {
    errors.kepalaKeluarga = 'Nama Kepala Keluarga harus diisi';
    isValid = false;
  }
  
  if (!form.nikKepala.trim()) {
    errors.nikKepala = 'NIK Kepala Keluarga harus diisi';
    isValid = false;
  } else if (form.nikKepala.length !== 16) {
    errors.nikKepala = 'NIK harus 16 digit';
    isValid = false;
  }
  
  if (!form.alamat.trim()) {
    errors.alamat = 'Alamat harus diisi';
    isValid = false;
  }
  
  if (!form.rt.trim()) {
    errors.rt = 'RT harus diisi';
    isValid = false;
  }
  
  if (!form.rw.trim()) {
    errors.rw = 'RW harus diisi';
    isValid = false;
  }

  if (!form.provinsi.trim()) {
    errors.provinsi = 'Provinsi harus diisi';
    isValid = false;
  }

  if (!form.kabupaten.trim()) {
    errors.kabupaten = 'Kabupaten harus diisi';
    isValid = false;
  }

  if (!form.kecamatan.trim()) {
    errors.kecamatan = 'Kecamatan harus diisi';
    isValid = false;
  }

  if (!form.kelurahan.trim()) {
    errors.kelurahan = 'Kelurahan harus diisi';
    isValid = false;
  }

  if (!form.namaKeluarga.trim()) {
    errors.namaKeluarga = 'Nama keluarga harus diisi';
    isValid = false;
  }

  if (!form.status) {
    errors.status = 'Status harus dipilih';
    isValid = false;
  }

  if (!form.jumlahAnggota || form.jumlahAnggota < 1) {
    errors.jumlahAnggota = 'Jumlah Anggota minimal 1';
    isValid = false;
  }

  if (!form.kodePos) {
    errors.kodePos = 'Kode pos harus diisi';
    isValid = false;
  } else if (!/^\d{5}$/.test(form.kodePos)) {
    errors.kodePos = 'Kode pos harus 5 digit angka';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    // Format RT/RW to have leading zeros if needed
    form.rt = form.rt.padStart(2, '0');
    form.rw = form.rw.padStart(2, '0');
    
    // Emit save event with form data
    emit('save', { ...form });
    
    // Reset form
    Object.assign(form, {
      noKk: '',
      kepalaKeluarga: '',
      nikKepala: '',
      jumlahAnggota: 1,
      alamat: '',
      rt: '',
      rw: '',
      provinsi: '',
      kabupaten: '',
      kecamatan: '',
      kelurahan: '',
      namaKeluarga: '',
      kodePos: '',
      status: ''
    });
    
    // Close modal
    closeModal();
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

/* Input styling */
input:focus, textarea:focus, select:focus {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .sm\:max-w-3xl {
    max-width: 100%;
    margin: 0 1rem;
  }
}
</style>