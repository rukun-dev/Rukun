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
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">NIK</label>
            <div class="relative">
              <input
                v-model.trim="local.nik"
                @input="sanitizeNik"
                @focus="focusedField = 'nik'"
                @blur="focusedField = ''"
                type="text"
                inputmode="numeric"
                pattern="\d*"
                required
                maxlength="16"
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.nik ? 'border-red-300' : 'border-gray-200'"
                placeholder="Masukkan NIK (16 digit)"
              />
              
              <!-- Tooltip NIK -->
              <div v-if="showTooltip('nik')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.nik">NIK wajib diisi</span>
                <span v-else-if="local.nik.length < 16">NIK harus 16 digit ({{ local.nik.length }}/16)</span>
                <span v-else-if="!isNikValid(local.nik)">NIK hanya boleh berisi angka</span>
                <span v-else-if="isDuplicateNik(local.nik)">NIK sudah digunakan</span>
                <span v-else class="text-green-400">✓ NIK valid</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.nik" class="mt-1 text-sm text-red-600">{{ errors.nik }}</p>
          </div>

          <!-- Nama -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <div class="relative">
              <input
                v-model.trim="local.nama"
                @input="clearError('nama')"
                @focus="focusedField = 'nama'"
                @blur="focusedField = ''"
                type="text"
                required
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.nama ? 'border-red-300' : 'border-gray-200'"
                placeholder="Masukkan nama lengkap"
              />
              
              <!-- Tooltip Nama -->
              <div v-if="showTooltip('nama')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.nama">Nama wajib diisi</span>
                <span v-else-if="local.nama.length < 3">Nama minimal 3 karakter ({{ local.nama.length }}/3)</span>
                <span v-else class="text-green-400">✓ Nama valid</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.nama" class="mt-1 text-sm text-red-600">{{ errors.nama }}</p>
          </div>

          <!-- Tempat Lahir -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
            <div class="relative">
              <input
                v-model.trim="local.tempatLahir"
                @input="clearError('tempatLahir')"
                @focus="focusedField = 'tempatLahir'"
                @blur="focusedField = ''"
                type="text"
                required
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.tempatLahir ? 'border-red-300' : 'border-gray-200'"
                placeholder="Masukkan tempat lahir"
              />
              
              <!-- Tooltip Tempat Lahir -->
              <div v-if="showTooltip('tempatLahir')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.tempatLahir">Tempat lahir wajib diisi</span>
                <span v-else class="text-green-400">✓ Tempat lahir valid</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.tempatLahir" class="mt-1 text-sm text-red-600">{{ errors.tempatLahir }}</p>
          </div>

          <!-- Tanggal Lahir -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
            <div class="relative">
              <input
                v-model="local.tanggalLahir"
                @change="clearError('tanggalLahir')"
                @focus="focusedField = 'tanggalLahir'"
                @blur="focusedField = ''"
                type="date"
                required
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.tanggalLahir ? 'border-red-300' : 'border-gray-200'"
              />
              
              <!-- Tooltip Tanggal Lahir -->
              <div v-if="showTooltip('tanggalLahir')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.tanggalLahir">Tanggal lahir wajib diisi</span>
                <span v-else-if="isFutureDate(local.tanggalLahir)">Tanggal tidak boleh di masa depan</span>
                <span v-else-if="!isValidDate(local.tanggalLahir)">Tanggal tidak valid</span>
                <span v-else class="text-green-400">✓ Tanggal lahir valid</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.tanggalLahir" class="mt-1 text-sm text-red-600">{{ errors.tanggalLahir }}</p>
          </div>

          <!-- Jenis Kelamin -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            <div class="relative">
              <select
                v-model="local.jenisKelamin"
                @change="clearError('jenisKelamin')"
                @focus="focusedField = 'jenisKelamin'"
                @blur="focusedField = ''"
                required
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.jenisKelamin ? 'border-red-300' : 'border-gray-200'"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              
              <!-- Tooltip Jenis Kelamin -->
              <div v-if="showTooltip('jenisKelamin')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.jenisKelamin">Pilih jenis kelamin</span>
                <span v-else class="text-green-400">✓ Jenis kelamin dipilih</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.jenisKelamin" class="mt-1 text-sm text-red-600">{{ errors.jenisKelamin }}</p>
          </div>

          <!-- Status -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Status dalam Keluarga</label>
            <div class="relative">
              <select
                v-model="local.status"
                @change="clearError('status')"
                @focus="focusedField = 'status'"
                @blur="focusedField = ''"
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
              
              <!-- Tooltip Status -->
              <div v-if="showTooltip('status')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.status">Pilih status dalam keluarga</span>
                <span v-else class="text-green-400">✓ Status dipilih</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
          </div>

          <!-- Agama -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Agama</label>
            <div class="relative">
              <select
                v-model="local.agama"
                @change="clearError('agama')"
                @focus="focusedField = 'agama'"
                @blur="focusedField = ''"
                required
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.agama ? 'border-red-300' : 'border-gray-200'"
              >
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              
              <!-- Tooltip Agama -->
              <div v-if="showTooltip('agama')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.agama">Pilih agama</span>
                <span v-else class="text-green-400">✓ Agama dipilih</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.agama" class="mt-1 text-sm text-red-600">{{ errors.agama }}</p>
          </div>

          <!-- Kode Pos -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
            <div class="relative">
              <input
                v-model.trim="local.kodePos"
                @input="sanitizeKodePos"
                @focus="focusedField = 'kodePos'"
                @blur="focusedField = ''"
                type="text"
                inputmode="numeric"
                pattern="\d*"
                required
                maxlength="5"
                class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :class="errors.kodePos ? 'border-red-300' : 'border-gray-200'"
                placeholder="Masukkan kode pos (5 digit)"
              />
              
              <!-- Tooltip Kode Pos -->
              <div v-if="showTooltip('kodePos')" 
                   class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
                <span v-if="!local.kodePos">Kode pos wajib diisi</span>
                <span v-else-if="local.kodePos.length < 5">Kode pos harus 5 digit ({{ local.kodePos.length }}/5)</span>
                <span v-else-if="!isKodePosValid(local.kodePos)">Kode pos hanya boleh berisi angka</span>
                <span v-else class="text-green-400">✓ Kode pos valid</span>
                <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <p v-if="errors.kodePos" class="mt-1 text-sm text-red-600">{{ errors.kodePos }}</p>
          </div>
        </div>

        <!-- Alamat -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
          <div class="relative">
            <textarea
              v-model.trim="local.alamat"
              @input="clearError('alamat')"
              @focus="focusedField = 'alamat'"
              @blur="focusedField = ''"
              required
              rows="3"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              :class="errors.alamat ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan alamat lengkap"
            ></textarea>
            
            <!-- Tooltip Alamat -->
            <div v-if="showTooltip('alamat')" 
                 class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
              <span v-if="!local.alamat">Alamat wajib diisi</span>
              <span v-else-if="local.alamat.length < 5">Alamat minimal 5 karakter ({{ local.alamat.length }}/5)</span>
              <span v-else class="text-green-400">✓ Alamat valid</span>
              <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
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
import { Toaster, toast } from 'vue-sonner'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Object, default: null },           // warga yang sedang diedit
  existingNiks: { type: Array, default: () => [] }, // untuk cek duplikasi
})
const emit = defineEmits(['update:modelValue', 'update'])

const formError = ref('')
const focusedField = ref('')

const errors = reactive({
  nik: '', nama: '', tempatLahir: '', tanggalLahir: '',
  jenisKelamin: '', status: '', alamat: '', agama: '', kodePos: ''
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
  alamat: props.value?.alamat ?? '',
  agama: props.value?.agama ?? '',
  kodePos: props.value?.kodePos ?? ''
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
    alamat: v?.alamat ?? '',
    agama: v?.agama ?? '',
    kodePos: v?.kodePos ?? ''
  })
  resetErrors()
}, { deep: true })

const resetErrors = () => {
  formError.value = ''
  Object.keys(errors).forEach(k => (errors[k] = ''))
}
const clearError = (field) => { errors[field] = ''; formError.value = '' }

const close = () => { 
  emit('update:modelValue', false)
  resetErrors()
  focusedField.value = ''
}

// Tooltip helpers
const showTooltip = (field) => {
  return focusedField.value === field && hasValidationIssue(field)
}

const hasValidationIssue = (field) => {
  switch (field) {
    case 'nik':
      return !local.nik || local.nik.length < 16 || !isNikValid(local.nik) || isDuplicateNik(local.nik)
    case 'nama':
      return !local.nama || local.nama.length < 3
    case 'tempatLahir':
      return !local.tempatLahir
    case 'tanggalLahir':
      return !local.tanggalLahir || isFutureDate(local.tanggalLahir) || !isValidDate(local.tanggalLahir)
    case 'jenisKelamin':
      return !local.jenisKelamin
    case 'status':
      return !local.status
    case 'alamat':
      return !local.alamat || local.alamat.length < 5
    case 'agama':
      return !local.agama
    case 'kodePos':
      return !local.kodePos || local.kodePos.length < 5 || !isKodePosValid(local.kodePos)
    default:
      return false
  }
}

// Validation helpers
const isNikValid = (nik) => /^\d{16}$/.test(nik)
const isDuplicateNik = (nik) => {
  const selfNik = props.value?.nik ?? ''
  return props.existingNiks.includes(nik) && nik !== selfNik
}
const isValidDate = (dateStr) => {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}
const isFutureDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date > today
}

const sanitizeNik = (e) => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 16)
  if (v !== local.nik) local.nik = v
  clearError('nik')
}

const sanitizeKodePos = (e) => {
  const v = e.target.value.replace(/\D/g, '').slice(0, 5)
  if (v !== local.kodePos) local.kodePos = v
  clearError('kodePos')
}

const isKodePosValid = (kodePos) => /^\d{5}$/.test(kodePos)

const validate = () => {
  resetErrors()

  // NIK
  if (!isNikValid(local.nik)) {
    errors.nik = 'NIK harus 16 digit angka.'
  } else if (isDuplicateNik(local.nik)) {
    errors.nik = 'NIK sudah digunakan oleh warga lain.'
  }

  // Nama
  if (!local.nama) {
    errors.nama = 'Nama wajib diisi.'
    toast.error('Periksa kembali nama Anda.')
  } else if (local.nama.length < 3) {
    errors.nama = 'Nama minimal 3 karakter.'
    toast.error('Nama minimal 3 karakter!')
  }

  // Tempat lahir
  if (!local.tempatLahir) {
    errors.tempatLahir = 'Tempat lahir wajib diisi.'
    toast.error('Periksa kembali tempat lahir Anda.')
  }

  // Tanggal lahir
  if (!local.tanggalLahir) {
    errors.tanggalLahir = 'Tanggal lahir wajib diisi.'
    toast.error('Periksa kembali tanggal lahir Anda.')
  } else if (isFutureDate(local.tanggalLahir)) {
    errors.tanggalLahir = 'Tanggal lahir tidak boleh di masa depan.'
    toast.error('Periksa kembali tanggal lahir Anda.')
  } else if (!isValidDate(local.tanggalLahir)) {
    errors.tanggalLahir = 'Tanggal lahir tidak valid.'
    toast.error('Periksa kembali tanggal lahir Anda.')
  }

  // Jenis Kelamin
  if (!local.jenisKelamin) {
    errors.jenisKelamin = 'Pilih jenis kelamin.'
    toast.error('Periksa kembali jenis kelamin Anda.')
  }

  // Status
  if (!local.status) {
    errors.status = 'Pilih status dalam keluarga.'
    toast.error('Periksa kembali status dalam keluarga Anda.')
  }

  // Alamat
  if (!local.alamat) {
    errors.alamat = 'Alamat wajib diisi.'
    toast.error('Periksa kembali alamat Anda.')
  } else if (local.alamat.length < 5) {
    errors.alamat = 'Alamat minimal 5 karakter.'
    toast.error('Alamat minimal 5 karakter!')
  }

  // Agama
  if (!local.agama) {
    errors.agama = 'Agama wajib dipilih.'
    toast.error('Pilih agama terlebih dahulu!')
  }

  // Kode Pos
  if (!local.kodePos) {
    errors.kodePos = 'Kode pos wajib diisi.'
    toast.error('Kode pos wajib diisi!')
  } else if (!isKodePosValid(local.kodePos)) {
    errors.kodePos = 'Kode pos harus 5 digit angka.'
    toast.error('Kode pos harus 5 digit angka!')
  }

  if (hasErrors.value) {
    formError.value = 'Ada data yang belum benar. Mohon lengkapi/benarkan isian.'
    toast.error(formError.value || 'Periksa kembali isian Anda.')
  }
  return !hasErrors.value
}

const onSubmit = () => {
  if (!validate()) return
  
  const payload = { 
    id: props.value?.id ?? local.id,
    nik: local.nik,
    nama: local.nama,
    tempatLahir: local.tempatLahir,
    tanggalLahir: local.tanggalLahir,
    jenisKelamin: local.jenisKelamin,
    status: local.status,
    alamat: local.alamat,
    agama: local.agama,
    kodePos: local.kodePos
  }
  emit('update', payload)
  emit('update:modelValue', false) 
  toast.success('Data warga diperbarui!')
  
  resetErrors()
  focusedField.value = ''
}
</script>