<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="close">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">{{ isEdit ? 'Edit Warga' : 'Tambah Warga Baru' }}</h3>
        <p class="text-gray-600 mt-1">{{ isEdit ? 'Perbarui informasi warga' : 'Masukkan data warga baru' }}</p>
      </div>

      <form @submit.prevent="onSubmit" class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NIK</label>
            <input v-model.trim="local.nik" type="text" required maxlength="16"
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                   placeholder="Masukkan NIK (16 digit)">
            <p v-if="nikError" class="mt-1 text-sm text-red-600">{{ nikError }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
            <input v-model.trim="local.nama" type="text" required
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                   placeholder="Masukkan nama lengkap">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
            <input v-model.trim="local.tempatLahir" type="text" required
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                   placeholder="Masukkan tempat lahir">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
            <input v-model="local.tanggalLahir" type="date" required
                   class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
            <select v-model="local.jenisKelamin" required
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="">Pilih Jenis Kelamin</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status dalam Keluarga</label>
            <select v-model="local.status" required
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="">Pilih Status</option>
              <option value="Kepala Keluarga">Kepala Keluarga</option>
              <option value="Istri">Istri</option>
              <option value="Anak">Anak</option>
              <option value="Orang Tua">Orang Tua</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
          <textarea v-model.trim="local.alamat" required rows="3"
                    class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Masukkan alamat lengkap"></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button type="button" @click="close"
                  class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
            Batal
          </button>
          <button type="submit"
                  class="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium">
            {{ isEdit ? 'Perbarui Data' : 'Tambah Warga' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from 'vue'

/**
 * Props & Emits
 * - modelValue: kontrol tampil/hidden modal (v-model)
 * - value: objek warga untuk edit (null = tambah)
 * - emit: update:modelValue (close), save(payload)
 */
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue','save'])

const isEdit = computed(() => !!props.value?.id)
const nikError = ref('')

// local state supaya aman dari mutasi langsung ke props.value
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

// sync ketika value berubah (mis. klik Edit warga lain)
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
  nikError.value = ''
}, { deep: true })

const close = () => {
  emit('update:modelValue', false)
  // optional reset saat close
  nikError.value = ''
}

// Validasi ringan: 16 digit angka
const validateNik = (nik) => /^\d{16}$/.test(nik)

const onSubmit = () => {
  if (!validateNik(local.nik)) {
    nikError.value = 'NIK harus 16 digit angka.'
    return
  }
  const payload = { ...local }
  // untuk create, parent bisa isi id di sana; atau kita siapkan default:
  if (!payload.id) payload.id = Date.now()

  emit('save', payload)
  emit('update:modelValue', false)
  nikError.value = ''
}
</script>
    