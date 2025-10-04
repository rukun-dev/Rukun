<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { toast } from "vue-sonner";

// Props
const props = defineProps<{
  visible: boolean;
  editingDocument?: any;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  submit: [data: any];
}>();

// Local state to control modal visibility
const isVisible = ref(false);

// Form data - using ref instead of reactive for better compatibility
const formData = ref({
  title: '',
  type: '',
  number: '',
  content: '',
  wargaId: '',
});

const isSubmitting = ref(false);
const progress = ref(0);

// Search functionality for warga
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const isSearching = ref(false);
const showResults = ref(false);
const selectedWarga = ref<any>(null);

// Search warga function
const searchWarga = async (query: string) => {
  if (!query.trim()) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  try {
    isSearching.value = true;
    const response = await fetch(`/api/documents/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('Gagal mencari data warga');
    }
    
    const data = await response.json();
    searchResults.value = data.data?.citizens || [];
    showResults.value = true;
  } catch (error) {
    console.error('Error searching warga:', error);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
};

// Select warga from search results
const selectWarga = (warga: any) => {
  formData.value.wargaId = warga.id;
  searchQuery.value = `${warga.nik} - ${warga.name}`;
  selectedWarga.value = warga;
  showResults.value = false;
};

// Clear selected warga
const clearSelectedWarga = () => {
  formData.value.wargaId = '';
  searchQuery.value = '';
  selectedWarga.value = null;
  searchResults.value = [];
  showResults.value = false;
};

// Computed
const isEdit = computed(() => !!props.editingDocument);

// Reset form function
const resetForm = () => {
  formData.value.title = '';
  formData.value.type = 'SURAT_TIDAK_MAMPU';
  formData.value.number = '';
  formData.value.content = '';
  formData.value.wargaId = '';
  progress.value = 0;
  
  // Reset search state
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
  selectedWarga.value = null;
};

// Close modal
const closeModal = () => {
  if (!isSubmitting.value) {
    emit('close');
  }
};

// Submit form with API integration
const submitForm = async () => {
  // Validate form
  if (!formData.value.title) {
    toast.error('Judul dokumen harus diisi!');
    return;
  }
  
  if (!formData.value.type) {
    toast.error('Tipe dokumen harus diisi!');
    return;
  }
  
  if (!formData.value.number) {
    toast.error('Nomor dokumen harus diisi!');
    return;
  }

  try {
    isSubmitting.value = true;
    progress.value = 20;

    progress.value = 50;
    
    // Prepare data for API according to required schema and backend expectations
    const apiData = {
      title: formData.value.title,
      type: formData.value.type,
      content: formData.value.content || '', // Ensure empty string instead of undefined
      number: formData.value.number,
      wargaId: formData.value.wargaId || undefined
    };

    // Send request to API endpoint
    progress.value = 70;
    
    // Determine method and URL based on edit mode
    const method = isEdit.value ? 'PUT' : 'POST';
    const url = isEdit.value && props.editingDocument 
      ? `/api/documents/${props.editingDocument.id}` 
      : '/api/documents';
      
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiData)
    });

    progress.value = 90;
    
    // Parse the response only once
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal menyimpan dokumen');
    }
    progress.value = 100;
    
    // Show success message
    toast.success('Dokumen berhasil disimpan! Status: Menunggu');
    
    // Emit submit event with the document data from the response
    // Backend returns data in result.document structure
    const documentData = {
      id: result.document?.id,
      title: result.document?.title,
      type: result.document?.type,
      content: result.document?.content,
      number: result.document?.number,
      status: result.document?.status || 'MENUNGGU', // Default to MENUNGGU if not provided
      wargaId: result.document?.wargaId,
      createdAt: result.document?.created_at,
      updatedAt: result.document?.updated_at
    };
    
    emit('submit', documentData);
    
    // Close modal after successful submission
    setTimeout(() => {
      closeModal();
    }, 1000);
    
  } catch (error: any) {
    // Handle specific errors
    if (error.message?.includes('Document number already exists')) {
      toast.error('Nomor dokumen sudah ada! Silakan gunakan nomor lain.');
    } else if (error.message?.includes('Permission denied')) {
      toast.error('Anda tidak memiliki izin untuk membuat dokumen!');
    } else {
      toast.error(error.message || 'Terjadi kesalahan saat menyimpan dokumen');
    }
  } finally {
    isSubmitting.value = false;
    progress.value = 0;
  }
};

// Update local visibility state when prop changes
watch(() => props.visible, (newVal) => {
  isVisible.value = newVal;
  
  if (newVal) {
    // Reset form when opening
    if (isEdit.value && props.editingDocument) {
      // Populate form with editing document data
      formData.value.title = props.editingDocument.title || '';
      formData.value.type = props.editingDocument.type || 'SURAT_TIDAK_MAMPU';
      formData.value.number = props.editingDocument.number || '';
      formData.value.content = props.editingDocument.content || '';
      formData.value.wargaId = props.editingDocument.wargaId || '';
      
      // If wargaId exists, we might want to fetch and display the warga info
      // For simplicity, we'll just set the searchQuery with placeholder
      if (formData.value.wargaId) {
        searchQuery.value = 'Memuat data warga...';
        selectedWarga.value = null;
        // In a real app, you might want to fetch the full warga details here
      }
    } else {
      // Reset form for new document
      resetForm();
    }
  }
}, { immediate: true });

// Ensure modal shows correctly when mounted
onMounted(() => {
  isVisible.value = props.visible;
});
</script>

<template>
  <!-- Always render the component and control visibility with local state -->
  <Transition name="modal">
    <div v-if="isVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">
            {{ isEdit ? 'Edit Dokumen' : 'Tambah Dokumen' }}
          </h3>
        </div>
        
        <!-- Modal Body -->
        <div class="px-6 py-5">
          <form @submit.prevent="submitForm" id="document-form">
            <!-- Document Title -->
            <div class="mb-4">
              <label for="document-title" class="block text-sm font-medium text-gray-700 mb-1">
                Judul Dokumen <span class="text-red-500">*</span>
              </label>
              <input
                id="document-title"
                v-model="formData.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan judul dokumen"
                required
              />
            </div>
            
            <!-- Document Type -->
            <div class="mb-4">
              <label for="document-type" class="block text-sm font-medium text-gray-700 mb-1">
                Tipe Dokumen <span class="text-red-500">*</span>
              </label>
              <select
                id="document-type"
                v-model="formData.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="SURAT_TIDAK_MAMPU">Surat Keterangan Tidak Mampu</option>
                <option value="SURAT_KETERANGAN">Surat Keterangan</option>
                <option value="SURAT_DOMISILI">Surat Keterangan Domisili</option>
                <option value="SURAT_PENGANTAR">Surat Pengantar</option>
                <option value="LAPORAN_KEUANGAN">Laporan Keuangan</option>
                <option value="OTHER">Dokumen Lainnya</option>
              </select>
            </div>
            
            <!-- Document Number -->
            <div class="mb-4">
              <label for="document-number" class="block text-sm font-medium text-gray-700 mb-1">
                Nomor Dokumen <span class="text-red-500">*</span>
              </label>
              <input
                id="document-number"
                v-model="formData.number"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: 001/SKTM/IX/2025"
                required
              />
            </div>
            
            <!-- Document Content -->
            <div class="mb-4">
              <label for="document-content" class="block text-sm font-medium text-gray-700 mb-1">
                Konten Dokumen (Opsional)
              </label>
              <textarea
                id="document-content"
                v-model="formData.content"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows="3"
                placeholder="Masukkan deskripsi atau konten dokumen"
              ></textarea>
            </div>
            

            
            <!-- Warga Search (Optional) -->
            <div class="mb-4">
              <label for="warga-search" class="block text-sm font-medium text-gray-700 mb-1">
                Pilih Warga (Opsional)
              </label>
              <div class="relative">
                <input
                  id="warga-search"
                  v-model="searchQuery"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-10"
                  placeholder="Cari warga berdasarkan nama..."
                  @input="searchWarga(searchQuery)"
                  @focus="searchQuery.trim() && searchWarga(searchQuery)"
                />
                <button
                  v-if="selectedWarga"
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  @click="clearSelectedWarga"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div v-if="isSearching" class="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                
                <!-- Search Results Dropdown -->
                <div v-if="showResults && searchResults.length > 0" class="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div
                    v-for="warga in searchResults"
                    :key="warga.id"
                    class="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                    @mousedown="selectWarga(warga)"
                  >
                    <div class="font-medium">{{ warga.nik }} - {{ warga.name }}</div>
                    <div class="text-xs text-gray-500">{{ warga.address }} | RT {{ warga.rt }}/RW {{ warga.rw }}</div>
                  </div>
                </div>
                
                <!-- No Results -->
                <div v-if="showResults && !isSearching && searchResults.length === 0" class="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-10">
                  <div class="px-4 py-2 text-sm text-gray-500">Tidak ditemukan warga dengan nama tersebut</div>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-1">*Diperlukan untuk dokumen terkait warga</p>
            </div>
            

            
            <!-- Progress Bar -->
            <div v-if="progress > 0" class="mb-4">
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 mt-1 text-right">{{ progress }}%</p>
            </div>
            
            <!-- Buttons -->
            <div class="flex justify-end space-x-3">
              <button
                id="document-cancel-btn"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                @click="closeModal"
                :disabled="isSubmitting"
              >
                Batal
              </button>
              <button
                id="document-submit-btn"
                type="submit"
                class="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyimpan...
                </span>
                <span v-else>{{ isEdit ? 'Simpan Perubahan' : 'Simpan' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: scale(0.95);
}

.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>