<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { toast } from "vue-sonner";

// Props interface
interface Document {
  id?: string;
  title: string;
  type: string;
  content: string;
  wargaId: string;
  number: string;
  _approvalStatus?: string;
  createdAt?: string;
}

// Props
const props = defineProps<{
  visible: boolean;
  editingDocument?: Document | null;
}>();

// Emits
const emit = defineEmits<{
  close: [];
  submit: [document: Document];
  approve: [document: Document];
  reject: [document: Document];
}>();

// Form data - only fields that can be edited as specified
const formData = reactive<{
  title: string;
  type: string;
  content: string;
  wargaId: string;
  number: string;
  _approvalStatus?: string;
}>({
  title: '',
  type: 'SURAT_TIDAK_MAMPU',
  content: '',
  wargaId: '',
  number: '',
  _approvalStatus: undefined
});

// Close modal
const closeModal = () => {
  emit('close');
};

// Submit form
const submitForm = () => {
  // Validate all required fields
  if (!formData.title) {
    toast.error('Judul dokumen harus diisi!');
    return;
  }
  
  if (!formData.type) {
    toast.error('Tipe dokumen harus diisi!');
    return;
  }
  
  if (!formData.content) {
    toast.error('Konten dokumen harus diisi!');
    return;
  }
  
  if (!formData.wargaId) {
    toast.error('ID Warga harus diisi!');
    return;
  }
  
  if (!formData.number) {
    toast.error('Nomor dokumen harus diisi!');
    return;
  }
  
  // Prepare document data with id
  const documentData: Document = {
    id: props.editingDocument?.id,
    title: formData.title,
    type: formData.type,
    content: formData.content,
    wargaId: formData.wargaId,
    number: formData.number,
    _approvalStatus: formData._approvalStatus,
    createdAt: props.editingDocument?.createdAt
  };
  
  // Emit submit event with form data
  emit('submit', documentData);
};

// Approve document
const approveDocument = () => {
  formData._approvalStatus = 'Disetujui';
  const documentData: Document = {
    id: props.editingDocument?.id,
    title: formData.title,
    type: formData.type,
    content: formData.content,
    wargaId: formData.wargaId,
    number: formData.number,
    _approvalStatus: 'Disetujui',
    createdAt: props.editingDocument?.createdAt
  };
  emit('approve', documentData);
  toast.success('Dokumen telah disetujui!');
};

// Reject document
const rejectDocument = () => {
  formData._approvalStatus = 'Ditolak';
  const documentData: Document = {
    id: props.editingDocument?.id,
    title: formData.title,
    type: formData.type,
    content: formData.content,
    wargaId: formData.wargaId,
    number: formData.number,
    _approvalStatus: 'Ditolak',
    createdAt: props.editingDocument?.createdAt
  };
  emit('reject', documentData);
  toast.success('Dokumen telah ditolak!');
};

// Reset form
const resetForm = () => {
  formData.title = '';
  formData.type = 'SURAT_TIDAK_MAMPU';
  formData.content = '';
  formData.wargaId = '';
  formData.number = '';
  formData._approvalStatus = undefined;
};

// Watch for visible changes to populate form
watch(() => props.visible, (newVal) => {
  if (newVal && props.editingDocument) {
    // Populate form with editing document data
    formData.title = props.editingDocument.title || '';
    formData.type = props.editingDocument.type || 'SURAT_TIDAK_MAMPU';
    formData.content = props.editingDocument.content || '';
    formData.wargaId = props.editingDocument.wargaId || '';
    formData.number = props.editingDocument.number || '';
    formData._approvalStatus = props.editingDocument._approvalStatus;
  } else if (!newVal) {
    // Reset form when modal is closed
    resetForm();
  }
});

// Watch for changes in editing document
watch(() => props.editingDocument, (newDocument) => {
  if (props.visible && newDocument) {
    formData.title = newDocument.title || '';
    formData.type = newDocument.type || 'SURAT_TIDAK_MAMPU';
    formData.content = newDocument.content || '';
    formData.wargaId = newDocument.wargaId || '';
    formData.number = newDocument.number || '';
    formData._approvalStatus = newDocument._approvalStatus;
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-900">Edit Dokumen</h3>
          <button @click="closeModal" class="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Modal Body -->
        <div class="px-6 py-5">
          <form @submit.prevent="submitForm" id="document-edit-form">
            <!-- Document Title -->
            <div class="mb-4">
              <label for="document-edit-title" class="block text-sm font-medium text-gray-700 mb-1">
                Judul Dokumen <span class="text-red-500">*</span>
              </label>
              <input
                id="document-edit-title"
                v-model="formData.title"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan judul dokumen"
                required
              />
            </div>
            
            <!-- Document Type -->
            <div class="mb-4">
              <label for="document-edit-type" class="block text-sm font-medium text-gray-700 mb-1">
                Tipe Dokumen <span class="text-red-500">*</span>
              </label>
              <select
                id="document-edit-type"
                v-model="formData.type"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              >
                <option value="SURAT_TIDAK_MAMPU">Surat Keterangan Tidak Mampu</option>
                <option value="SURAT_KETERANGAN_USAHA">Surat Keterangan Usaha</option>
                <option value="SURAT_KETERANGAN_TINGGAL">Surat Keterangan Tinggal</option>
                <option value="LAPORAN_KEUANGAN">Laporan Keuangan</option>
                <option value="DOKUMEN_LAINNYA">Dokumen Lainnya</option>
              </select>
            </div>
            
            <!-- Document Number -->
            <div class="mb-4">
              <label for="document-edit-number" class="block text-sm font-medium text-gray-700 mb-1">
                Nomor Dokumen <span class="text-red-500">*</span>
              </label>
              <input
                id="document-edit-number"
                v-model="formData.number"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Contoh: 001/SKTM/IX/2025"
                required
              />
            </div>
            
            <!-- Document Content -->
            <div class="mb-4">
              <label for="document-edit-content" class="block text-sm font-medium text-gray-700 mb-1">
                Konten Dokumen <span class="text-red-500">*</span>
              </label>
              <textarea
                id="document-edit-content"
                v-model="formData.content"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows="3"
                placeholder="Masukkan konten dokumen"
                required
              ></textarea>
            </div>
            
            <!-- Warga ID -->
            <div class="mb-6">
              <label for="document-edit-warga-id" class="block text-sm font-medium text-gray-700 mb-1">
                ID Warga <span class="text-red-500">*</span>
              </label>
              <input
                id="document-edit-warga-id"
                v-model="formData.wargaId"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Masukkan ID warga"
                required
              />
            </div>
            
            <!-- Approval Section -->
            <div class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 class="text-md font-medium text-gray-900 mb-3">Status Persetujuan</h4>
              <div class="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status Saat Ini:</label>
                  <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    :class="formData._approvalStatus === 'Disetujui' ? 'bg-green-100 text-green-800' : 
                           formData._approvalStatus === 'Ditolak' ? 'bg-red-100 text-red-800' : 
                           'bg-yellow-100 text-yellow-800'">
                    {{ formData._approvalStatus || 'Menunggu Persetujuan' }}
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <button
                  type="button"
                  id="document-approve-btn"
                  class="flex-1 px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  @click="approveDocument"
                >
                  Disetujui
                </button>
                <button
                  type="button"
                  id="document-reject-btn"
                  class="flex-1 px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  @click="rejectDocument"
                >
                  Ditolak
                </button>
              </div>
            </div>
            
            <!-- Buttons -->
            <div class="flex justify-end space-x-3">
              <button
                id="document-edit-cancel-btn"
                type="button"
                class="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                @click="closeModal"
              >
                Batal
              </button>
              <button
                id="document-edit-submit-btn"
                type="submit"
                class="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Simpan Perubahan
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

/* Responsive adjustments */
@media (max-width: 640px) {
  .max-w-lg {
    max-width: 100%;
    margin: 0 1rem;
  }
}
</style>