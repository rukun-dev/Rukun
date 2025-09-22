<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" @click.self="close">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-xl font-semibold text-gray-900">{{ isEdit ? 'Edit Warga' : 'Tambah Warga Baru' }}</h3>
        <p class="text-gray-600 mt-1">{{ isEdit ? 'Perbarui informasi warga' : 'Masukkan data warga baru' }}</p>
      </div>

      <form @submit.prevent="onSubmit" class="p-6 space-y-6">


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
                :class="nikError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="nikError" class="mt-1 text-sm text-red-600">{{ nikError }}</p>
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
                :class="agamaError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="agamaError" class="mt-1 text-sm text-red-600">{{ agamaError }}</p>
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
              :class="kodePosError ? 'border-red-300' : 'border-gray-200'"
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
          <p v-if="kodePosError" class="mt-1 text-sm text-red-600">{{ kodePosError }}</p>
        </div>

        <!-- Pekerjaan -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Pekerjaan</label>
          <div class="relative">
            <input
              v-model.trim="local.pekerjaan"
              @input="clearError('pekerjaan')"
              @focus="focusedField = 'pekerjaan'"
              @blur="focusedField = ''"
              type="text"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="pekerjaanError ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan pekerjaan"
            />
            
            <!-- Tooltip Pekerjaan -->
            <div v-if="showTooltip('pekerjaan')" 
                 class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
              <span v-if="!local.pekerjaan">Pekerjaan (opsional)</span>
              <span v-else class="text-green-400">✓ Pekerjaan valid</span>
              <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <p v-if="pekerjaanError" class="mt-1 text-sm text-red-600">{{ pekerjaanError }}</p>
        </div>

        <!-- No Telepon -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">No Telepon</label>
          <div class="relative">
            <input
              v-model.trim="local.noTelpon"
              @input="sanitizeNoTelpon"
              @focus="focusedField = 'noTelpon'"
              @blur="focusedField = ''"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="noTelponError ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan nomor telepon"
            />
            
            <!-- Tooltip No Telepon -->
            <div v-if="showTooltip('noTelpon')" 
                 class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
              <span v-if="!local.noTelpon">No telepon (opsional)</span>
              <span v-else-if="!isNoTelponValid(local.noTelpon)">Format nomor telepon tidak valid</span>
              <span v-else class="text-green-400">✓ No telepon valid</span>
              <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <p v-if="noTelponError" class="mt-1 text-sm text-red-600">{{ noTelponError }}</p>
        </div>

        <!-- Email -->
        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div class="relative">
            <input
              v-model.trim="local.email"
              @input="clearError('email')"
              @focus="focusedField = 'email'"
              @blur="focusedField = ''"
              type="email"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              :class="emailError ? 'border-red-300' : 'border-gray-200'"
              placeholder="Masukkan email"
            />
            
            <!-- Tooltip Email -->
            <div v-if="showTooltip('email')" 
                 class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
              <span v-if="!local.email">Email (opsional)</span>
              <span v-else-if="!isEmailValid(local.email)">Format email tidak valid</span>
              <span v-else class="text-green-400">✓ Email valid</span>
              <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
      </div>

      <!-- Nama Ibu -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Nama Ibu</label>
        <div class="relative">
          <input
            v-model.trim="local.namaIbu"
            @input="clearError('namaIbu')"
            @focus="focusedField = 'namaIbu'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="namaIbuError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan nama ibu"
          />
          
          <!-- Tooltip Nama Ibu -->
          <div v-if="showTooltip('namaIbu')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.namaIbu">Nama ibu (opsional)</span>
            <span v-else class="text-green-400">✓ Nama ibu valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="namaIbuError" class="mt-1 text-sm text-red-600">{{ namaIbuError }}</p>
      </div>

      <!-- Nama Ayah -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Nama Ayah</label>
        <div class="relative">
          <input
            v-model.trim="local.namaAyah"
            @input="clearError('namaAyah')"
            @focus="focusedField = 'namaAyah'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="namaAyahError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan nama ayah"
          />
          
          <!-- Tooltip Nama Ayah -->
          <div v-if="showTooltip('namaAyah')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.namaAyah">Nama ayah (opsional)</span>
            <span v-else class="text-green-400">✓ Nama ayah valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="namaAyahError" class="mt-1 text-sm text-red-600">{{ namaAyahError }}</p>
      </div>

      <!-- Provinsi -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
        <div class="relative">
          <input
            v-model.trim="local.provinsi"
            @input="clearError('provinsi')"
            @focus="focusedField = 'provinsi'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="provinsiError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan provinsi"
          />
          
          <!-- Tooltip Provinsi -->
          <div v-if="showTooltip('provinsi')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.provinsi">Provinsi (opsional)</span>
            <span v-else class="text-green-400">✓ Provinsi valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="provinsiError" class="mt-1 text-sm text-red-600">{{ provinsiError }}</p>
      </div>

      <!-- Kabupaten -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Kabupaten</label>
        <div class="relative">
          <input
            v-model.trim="local.kabupaten"
            @input="clearError('kabupaten')"
            @focus="focusedField = 'kabupaten'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="kabupatenError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan kabupaten"
          />
          
          <!-- Tooltip Kabupaten -->
          <div v-if="showTooltip('kabupaten')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.kabupaten">Kabupaten (opsional)</span>
            <span v-else class="text-green-400">✓ Kabupaten valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="kabupatenError" class="mt-1 text-sm text-red-600">{{ kabupatenError }}</p>
      </div>

      <!-- Kecamatan -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Kecamatan</label>
        <div class="relative">
          <input
            v-model.trim="local.kecamatan"
            @input="clearError('kecamatan')"
            @focus="focusedField = 'kecamatan'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="kecamatanError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan kecamatan"
          />
          
          <!-- Tooltip Kecamatan -->
          <div v-if="showTooltip('kecamatan')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.kecamatan">Kecamatan (opsional)</span>
            <span v-else class="text-green-400">✓ Kecamatan valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="kecamatanError" class="mt-1 text-sm text-red-600">{{ kecamatanError }}</p>
      </div>

      <!-- Kelurahan -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Kelurahan</label>
        <div class="relative">
          <input
            v-model.trim="local.kelurahan"
            @input="clearError('kelurahan')"
            @focus="focusedField = 'kelurahan'"
            @blur="focusedField = ''"
            type="text"
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="kelurahanError ? 'border-red-300' : 'border-gray-200'"
            placeholder="Masukkan kelurahan"
          />
          
          <!-- Tooltip Kelurahan -->
          <div v-if="showTooltip('kelurahan')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.kelurahan">Kelurahan (opsional)</span>
            <span v-else class="text-green-400">✓ Kelurahan valid</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="kelurahanError" class="mt-1 text-sm text-red-600">{{ kelurahanError }}</p>
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
                :class="namaError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="namaError" class="mt-1 text-sm text-red-600">{{ namaError }}</p>
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
                :class="tempatLahirError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="tempatLahirError" class="mt-1 text-sm text-red-600">{{ tempatLahirError }}</p>
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
                :class="tanggalLahirError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="tanggalLahirError" class="mt-1 text-sm text-red-600">{{ tanggalLahirError }}</p>
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
                :class="jenisKelaminError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="jenisKelaminError" class="mt-1 text-sm text-red-600">{{ jenisKelaminError }}</p>
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
                :class="statusError ? 'border-red-300' : 'border-gray-200'"
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
            <p v-if="statusError" class="mt-1 text-sm text-red-600">{{ statusError }}</p>
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
              :class="alamatError ? 'border-red-300' : 'border-gray-200'"
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
          <p v-if="alamatError" class="mt-1 text-sm text-red-600">{{ alamatError }}</p>
      </div>

      <!-- Status Pernikahan -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Status Pernikahan</label>
        <div class="relative">
          <select
            v-model="local.maritalStatus"
            @change="clearError('maritalStatus')"
            @focus="focusedField = 'maritalStatus'"
            @blur="focusedField = ''"
            required
            class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            :class="maritalStatusError ? 'border-red-300' : 'border-gray-200'"
          >
            <option value="">Pilih Status Pernikahan</option>
            <option value="SINGLE">Belum Menikah</option>
            <option value="MARRIED">Menikah</option>
            <option value="DIVORCED">Cerai Hidup</option>
            <option value="WIDOWED">Cerai Mati</option>
          </select>
          
          <!-- Tooltip Status Pernikahan -->
          <div v-if="showTooltip('maritalStatus')" 
               class="absolute z-10 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -top-10 left-0 whitespace-nowrap">
            <span v-if="!local.maritalStatus">Pilih status pernikahan</span>
            <span v-else class="text-green-400">✓ Status pernikahan dipilih</span>
            <div class="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
        <p v-if="maritalStatusError" class="mt-1 text-sm text-red-600">{{ maritalStatusError }}</p>
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
import { reactive, watch, ref, computed } from 'vue'
import { Toaster, toast } from 'vue-sonner'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  value: { type: Object, default: null },           // warga yang sedang diedit (null = tambah baru)
  existingNiks: { type: Array, default: () => [] }, // untuk cek duplikasi
})
const emit = defineEmits(['update:modelValue', 'save'])

const isEdit = computed(() => !!props.value?.id)
const focusedField = ref('')

// Individual error refs
const nikError = ref('')
const namaError = ref('')
const tempatLahirError = ref('')
const tanggalLahirError = ref('')
const jenisKelaminError = ref('')
const statusError = ref('')
const alamatError = ref('')
const agamaError = ref('')
const kodePosError = ref('')
const pekerjaanError = ref('')
const noTelponError = ref('')
const emailError = ref('')
const namaIbuError = ref('')
const namaAyahError = ref('')
const provinsiError = ref('')
const kabupatenError = ref('')
const kecamatanError = ref('')
const kelurahanError = ref('')
const maritalStatusError = ref('')

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
  kodePos: props.value?.kodePos ?? '',
  pekerjaan: props.value?.pekerjaan ?? '',
  noTelpon: props.value?.noTelpon ?? '',
  email: props.value?.email ?? '',
  namaIbu: props.value?.namaIbu ?? '',
  namaAyah: props.value?.namaAyah ?? '',
  provinsi: props.value?.provinsi ?? '',
  kabupaten: props.value?.kabupaten ?? '',
  kecamatan: props.value?.kecamatan ?? '',
  kelurahan: props.value?.kelurahan ?? '',
  maritalStatus: props.value?.maritalStatus ?? ''
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
    kodePos: v?.kodePos ?? '',
    pekerjaan: v?.pekerjaan ?? '',
    noTelpon: v?.noTelpon ?? '',
    email: v?.email ?? '',
  namaIbu: v?.namaIbu ?? '',
  namaAyah: v?.namaAyah ?? '',
  provinsi: v?.provinsi ?? '',
  kabupaten: v?.kabupaten ?? '',
  kecamatan: v?.kecamatan ?? '',
  kelurahan: v?.kelurahan ?? '',
  maritalStatus: v?.maritalStatus ?? ''
  })
  resetErrors()
}, { deep: true })

const resetErrors = () => {
  nikError.value = ''
  namaError.value = ''
  tempatLahirError.value = ''
  tanggalLahirError.value = ''
  jenisKelaminError.value = ''
  statusError.value = ''
  alamatError.value = ''
  agamaError.value = ''
  kodePosError.value = ''
  pekerjaanError.value = ''
  noTelponError.value = ''
  emailError.value = ''
  namaIbuError.value = ''
  namaAyahError.value = ''
  provinsiError.value = ''
  kabupatenError.value = ''
  kecamatanError.value = ''
  kelurahanError.value = ''
  maritalStatusError.value = ''
}

const clearError = (field) => {
  switch (field) {
    case 'nik': nikError.value = ''; break
    case 'nama': namaError.value = ''; break
    case 'tempatLahir': tempatLahirError.value = ''; break
    case 'tanggalLahir': tanggalLahirError.value = ''; break
    case 'jenisKelamin': jenisKelaminError.value = ''; break
    case 'status': statusError.value = ''; break
    case 'alamat': alamatError.value = ''; break
    case 'agama': agamaError.value = ''; break
    case 'kodePos': kodePosError.value = ''; break
    case 'pekerjaan': pekerjaanError.value = ''; break
    case 'noTelpon': noTelponError.value = ''; break
    case 'email': emailError.value = ''; break
    case 'namaIbu': namaIbuError.value = ''; break
    case 'namaAyah': namaAyahError.value = ''; break
    case 'provinsi': provinsiError.value = ''; break
    case 'kabupaten': kabupatenError.value = ''; break
    case 'kecamatan': kecamatanError.value = ''; break
    case 'kelurahan': kelurahanError.value = ''; break
    case 'maritalStatus': maritalStatusError.value = ''; break
  }
}

const formError = ref('')
const hasErrors = computed(() => [
  nikError.value,
  namaError.value,
  tempatLahirError.value,
  tanggalLahirError.value,
  jenisKelaminError.value,
  statusError.value,
  alamatError.value,
  agamaError.value,
  kodePosError.value,
  pekerjaanError.value,
  noTelponError.value,
  emailError.value,
  namaIbuError.value,
  namaAyahError.value,
  provinsiError.value,
  kabupatenError.value,
  kecamatanError.value,
  kelurahanError.value,
  maritalStatusError.value
].some(Boolean))

const close = () => { 
  emit('update:modelValue', false)
  resetErrors()
  focusedField.value = ''
  toast.info('Form ditutup.')
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
    case 'noTelpon':
      return local.noTelpon && !isNoTelponValid(local.noTelpon)
    case 'email':
      return local.email && !isEmailValid(local.email)
    case 'namaIbu':
      return !local.namaIbu
    case 'namaAyah':
      return !local.namaAyah
    case 'provinsi':
      return !local.provinsi
    case 'kabupaten':
      return !local.kabupaten
    case 'kecamatan':
      return !local.kecamatan
    case 'kelurahan':
      return !local.kelurahan
    case 'maritalStatus':
      return !local.maritalStatus
    default:
      return false
  }
}

// Validation helpers
const isNikValid = (nik) => /^\d{16}$/.test(nik)
const isKodePosValid = (kodePos) => /^\d{5}$/.test(kodePos)
const isNoTelponValid = (noTelpon) => !noTelpon || /^[0-9+\-\s()]{10,15}$/.test(noTelpon)
const isEmailValid = (email) => !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
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

const sanitizeNoTelpon = (e) => {
  const v = e.target.value.replace(/[^0-9+\-\s()]/g, '').slice(0, 15)
  if (v !== local.noTelpon) local.noTelpon = v
  clearError('noTelpon')
}

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
  } else if (local.alamat.length < 5) {
    errors.alamat = 'Alamat minimal 5 karakter.'
  }

  // Agama
  if (!local.agama) {
    errors.agama = 'Pilih agama.'
    toast.error('Periksa kembali agama Anda.')
  }

  // Kode Pos
  if (!local.kodePos) {
    errors.kodePos = 'Kode pos wajib diisi.'
    toast.error('Periksa kembali kode pos Anda.')
  } else if (!isKodePosValid(local.kodePos)) {
    errors.kodePos = 'Kode pos harus 5 digit angka.'
    toast.error('Periksa kembali kode pos Anda.')
  }

  // No Telepon
  if (local.noTelpon && !isNoTelponValid(local.noTelpon)) {
    errors.noTelpon = 'Format nomor telepon tidak valid.'
    toast.error('Periksa kembali nomor telepon Anda.')
  }

  // Email
  if (local.email && !isEmailValid(local.email)) {
    errors.email = 'Format email tidak valid.'
    toast.error('Periksa kembali email Anda.')
  }

  // Nama Ibu
  if (!local.namaIbu) {
    errors.namaIbu = 'Nama ibu wajib diisi.'
    toast.error('Periksa kembali nama ibu Anda.')
  }

  // Nama Ayah
  if (!local.namaAyah) {
    errors.namaAyah = 'Nama ayah wajib diisi.'
    toast.error('Periksa kembali nama ayah Anda.')
  }

  // Provinsi
  if (!local.provinsi) {
    errors.provinsi = 'Provinsi wajib diisi.'
    toast.error('Periksa kembali provinsi Anda.')
  }

  // Kabupaten
  if (!local.kabupaten) {
    errors.kabupaten = 'Kabupaten wajib diisi.'
    toast.error('Periksa kembali kabupaten Anda.')
  }

  // Kecamatan
  if (!local.kecamatan) {
    errors.kecamatan = 'Kecamatan wajib diisi.'
    toast.error('Periksa kembali kecamatan Anda.')
  }

  // Kelurahan
  if (!local.kelurahan) {
    errors.kelurahan = 'Kelurahan wajib diisi.'
    toast.error('Periksa kembali kelurahan Anda.')
  }

  // Status Pernikahan
  if (!local.maritalStatus) {
    errors.maritalStatus = 'Status pernikahan wajib diisi.'
    toast.error('Periksa kembali status pernikahan Anda.')
  }

  if (hasErrors.value) {
    formError.value = 'Ada data yang belum benar. Mohon lengkapi/benarkan isian.'
    toast.error(formError.value || 'Periksa kembali isian Anda.')
  }
  return !hasErrors.value
}

const onSubmit = () => {
  if (!validate()) return
  
  const payload = { ...local, id: props.value?.id ?? local.id }
  emit('save', payload)
  emit('update:modelValue', false) 
  toast.success(isEdit.value ? 'Data warga diperbarui!' : 'Warga baru ditambahkan!')
  
  resetErrors()
  focusedField.value = ''
}
</script>