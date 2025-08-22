<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="close">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">Edit Warga</h3>
        <p class="text-gray-600 mt-1">Perbarui informasi warga</p>
      </div>

      <form @submit.prevent="onSubmit" class="p-6 space-y-6">
        <!-- Banner error -->
        <div v-if="formError || hasErrors" class="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
          <p class="font-medium">Periksa kembali isian Anda:</p>
          <ul class="list-disc list-inside text-sm mt-1 space-y-0.5">
            <li v-if="errors.nik">{{ errors.nik }}</li>
            <li v-if="errors.nama">{{ errors.nama }}</li>
            <li v-if="errors.tempatLahir">{{ errors.tempatLahir }}</li>
            <li v-if="errors.tanggalLahir">{{ errors.tanggalLahir }}</li>
            <li v-if="errors.jenisKelamin">{{ errors.jenisKelamin }}</li>
            <li v-if="errors.status">{{ errors.status }}</li>
            <li v-if="errors.alamat">{{ errors.alamat }}</li>
            <li v-if="formError">{{ formError }}</li>
          </ul>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- NIK -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NIK</label>
            <input
              v-model.trim="local.nik"
              @input="sanitizeNik"
              type="text"
              inputmode="numeric"
              pattern="\d*"
              required
              maxlength="16"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.nik ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan NIK (16 digit)"
            />
            <p v-if="errors.nik" class="mt-1 text-sm text-red-600">{{ errors.nik }}</p>
          </div>

          <!-- Nama -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <input
              v-model.trim="local.nama"
              @input="clearError('nama')"
              type="text"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.nama ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan nama lengkap"
            />
            <p v-if="errors.nama" class="mt-1 text-sm text-red-600">{{ errors.nama }}</p>
          </div>

          <!-- Tempat Lahir -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
            <input
              v-model.trim="local.tempatLahir"
              @input="clearError('tempatLahir')"
              type="text"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.tempatLahir ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan tempat lahir"
            />
            <p v-if="errors.tempatLahir" class="mt-1 text-sm text-red-600">{{ errors.tempatLahir }}</p>
          </div>

          <!-- Tanggal Lahir -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
            <input
              v-model="local.tanggalLahir"
              @change="clearError('tanggalLahir')"
              type="date"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.tanggalLahir ? 'border-red-300' : 'border-gray-200'"
            />
            <p v-if="errors.tanggalLahir" class="mt-1 text-sm text-red-600">{{ errors.tanggalLahir }}</p>
          </div>

          <!-- Jenis Kelamin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            <select
              v-model="local.jenisKelamin"
              @change="clearError('jenisKelamin')"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.jenisKelamin ? 'border-red-300' : 'border-gray-200'"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
            <p v-if="errors.jenisKelamin" class="mt-1 text-sm text-red-600">{{ errors.jenisKelamin }}</p>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status dalam Keluarga</label>
            <select
              v-model="local.status"
              @change="clearError('status')"
              required
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="errors.status ? 'border-red-300' : 'border-gray-200'"
            >
              <option value="">Pilih Status</option>
              <option value="Kepala Keluarga">Kepala Keluarga</option>
              <option value="Istri">Istri</option>
              <option value="Anak">Anak</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Lainnya">Lainnya</option>
            </select>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
          </div>
        </div>

        <!-- Alamat -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
          <textarea
            v-model.trim="local.alamat"
            @input="clearError('alamat')"
            required
            rows="3"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            :class="errors.alamat ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan alamat lengkap"
          ></textarea>
          <p v-if="errors.alamat" class="mt-1 text-sm text-red-600">{{ errors.alamat }}</p>
        </div>

        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button type="button" @click="close"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Batal
          </button>
          <button type="submit"
            class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium">
            Perbarui Data
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Object, default: null },           // warga yang sedang diedit
  existingNiks: { type: Array, default: () => [] }, // untuk cek duplikasi
})
const emit = defineEmits(['update:modelValue', 'update'])

const formError = ref('')
const errors = reactive({
  nik: '', nama: '', tempatLahir: '', tanggalLahir: '',
  jenisKelamin: '', status: '', alamat: ''
})
const hasErrors = computed(() => Object.values(errors).some(Boolean))

// state lokal agar tidak memutasi props langsung
const local = reactive({
  id: props.value?.id ?? null,
  nik: props.value?.nik ?? '',
  nama: props.value?.nama ?? '',
  tempatLahir: props.value?.tempatLahir ?? '',
  tanggalLahir: props.value?.tanggalLahir ?? '',
  jenisKelamin: props.value?.jenisKelamin ?? '',
  status: props.value?.status ?? '',
  alamat: props.value?.alamat ?? ''
})

// sinkronisasi saat `value` berganti (klik edit baris lain)
watch(() => props.value, (v) => {
  Object.assign(local, {
    id: v?.id ?? null,
    nik: v?.nik ?? '',
    nama: v?.nama ?? '',
    tempatLahir: v?.tempatLahir ?? '',
    tanggalLahir: v?.tanggalLahir ?? '',
    jenisKelamin: v?.jenisKelamin ?? '',
    status: v?.status ?? '',
    alamat: v?.alamat ?? ''
  })
  resetErrors()
}, { deep: true })

const resetErrors = () => {
  formError.value = ''
  Object.keys(errors).forEach(k => (errors[k] = ''))
}
const clearError = (field) => { errors[field] = ''; formError.value = '' }

const close = () => { emit('update:modelValue', false); resetErrors() }

// Helpers validasi
const isNikValid = (nik) => /^\d{16}$/.test(nik)
const isDateValid = (d) => {
  const dt = new Date(d)
  const now = new Date()
  return !Number.isNaN(dt.getTime()) && dt <= now
}
const sanitizeNik = (e) => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 16)
  if (v !== local.nik) local.nik = v
  clearError('nik')
}

const validate = () => {
  resetErrors()

  // NIK
  if (!isNikValid(local.nik)) errors.nik = 'NIK harus 16 digit angka.'
  else {
    const selfNik = props.value?.nik ?? ''
    const dupe = props.existingNiks.includes(local.nik) && local.nik !== selfNik
    if (dupe) errors.nik = 'NIK sudah digunakan oleh warga lain.'
  }

  // Nama
  if (!local.nama) errors.nama = 'Nama wajib diisi.'
  else if (local.nama.length < 3) errors.nama = 'Nama minimal 3 karakter.'

  // Tempat lahir
  if (!local.tempatLahir) errors.tempatLahir = 'Tempat lahir wajib diisi.'

  // Tanggal lahir
  if (!local.tanggalLahir) errors.tanggalLahir = 'Tanggal lahir wajib diisi.'
  else if (!isDateValid(local.tanggalLahir)) errors.tanggalLahir = 'Tanggal lahir tidak valid atau di masa depan.'

  // JK
  if (!local.jenisKelamin) errors.jenisKelamin = 'Pilih jenis kelamin.'

  // Status
  if (!local.status) errors.status = 'Pilih status dalam keluarga.'

  // Alamat
  if (!local.alamat) errors.alamat = 'Alamat wajib diisi.'
  else if (local.alamat.length < 5) errors.alamat = 'Alamat terlalu pendek.'

  if (hasErrors.value) formError.value = 'Ada data yang belum benar. Mohon lengkapi/benarkan isian.'
  return !hasErrors.value
}

const onSubmit = () => {
   const payload = { ...local, id: props.value?.id ?? local.id } // jaga ID asli
    emit('update', payload)
    emit('update:modelValue', false)
    resetErrors()
}
</script>
