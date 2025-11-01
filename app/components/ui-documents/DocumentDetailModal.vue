<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black opacity-50" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Detail Dokumen</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span class="ml-2 text-gray-600">Memuat detail dokumen...</span>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <div class="text-red-600 mb-2">{{ error }}</div>
            <button @click="fetchDocumentDetail" class="text-blue-600 hover:text-blue-800 text-sm">
              Coba lagi
            </button>
          </div>

          <!-- Document Details -->
          <div v-else-if="document" class="space-y-4">
            <!-- Document Info -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Informasi Dokumen</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Judul</label>
                  <p class="text-sm text-gray-900">{{ document.title }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Tipe</label>
                  <p class="text-sm text-gray-900">{{ getTypeDisplay(document.type) || 'Tidak diketahui' }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Status</label>
                  <span :class="getStatusClass(document.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getStatusDisplay(document.status) }}
                  </span>
                </div>
                <div v-if="document.number">
                  <label class="block text-sm font-medium text-gray-500">Nomor Dokumen</label>
                  <p class="text-sm text-gray-900">{{ document.number }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Dibuat Pada</label>
                  <p class="text-sm text-gray-900">{{ formatDate(document.created_at) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">Diperbarui Pada</label>
                  <p class="text-sm text-gray-900">{{ formatDate(document.updated_at) }}</p>
                </div>
              </div>
            </div>

            <!-- Requester Info -->
            <div v-if="document.requester" class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Pemohon</h4>
              <div class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Nama</label>
                  <p class="text-sm text-gray-900">{{ document.requester.name }}</p>
                </div>
                <div v-if="document.requester.email">
                  <label class="block text-sm font-medium text-gray-500">Email</label>
                  <p class="text-sm text-gray-900">{{ document.requester.email }}</p>
                </div>
              </div>
            </div>

            <!-- Warga Info -->
            <div v-if="document.warga" class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Data Warga</h4>
              <div class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Nama</label>
                  <p class="text-sm text-gray-900">{{ document.warga.name }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-500">NIK</label>
                  <p class="text-sm text-gray-900">{{ document.warga.nik }}</p>
                </div>
              </div>
            </div>

            <!-- Template Info -->
            <div v-if="document.template" class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Template</h4>
              <div>
                <label class="block text-sm font-medium text-gray-500">Nama Template</label>
                <p class="text-sm text-gray-900">{{ document.template.name }}</p>
              </div>
            </div>

            <!-- No Template Info -->
            <div v-else class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">Template</h4>
              <div>
                <p class="text-sm text-gray-500">Tidak menggunakan template</p>
              </div>
            </div>

            <!-- File Info -->
            <div v-if="document.file_path" class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">File</h4>
              <div class="space-y-2">
                <div>
                  <label class="block text-sm font-medium text-gray-500">Nama File</label>
                  <p class="text-sm text-gray-900">{{ getFileName(document.file_path) }}</p>
                </div>
                <div v-if="document.file_size">
                  <label class="block text-sm font-medium text-gray-500">Ukuran</label>
                  <p class="text-sm text-gray-900">{{ formatFileSize(document.file_size) }}</p>
                </div>
                <div v-if="document.mime_type">
                  <label class="block text-sm font-medium text-gray-500">Tipe</label>
                  <p class="text-sm text-gray-900">{{ document.mime_type }}</p>
                </div>
              </div>
            </div>

            <!-- No File Info -->
            <div v-else class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-3">File</h4>
              <div>
                <p class="text-sm text-gray-500">Tidak ada file</p>
              </div>
            </div>

            <!-- Rejection Reason -->
            <div v-if="document.status === 'REJECTED' && document.rejected_reason" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 class="font-medium text-red-900 mb-2">Alasan Penolakan</h4>
              <p class="text-sm text-red-800">{{ document.rejected_reason }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button @click="closeModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Document {
  id: string
  title: string
  type: string
  status: string
  number: string | null
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  created_at: string
  updated_at: string
  rejected_reason: string | null
  requester?: {
    id: string
    name: string
    email?: string
    role?: string
  }
  warga?: {
    id: string
    name: string
    nik?: string
  }
  template?: {
    id: string
    name: string
  }
}

interface Props {
  isOpen: boolean
  documentId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const document = ref<Document | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch document detail
const fetchDocumentDetail = async () => {
  if (!props.documentId) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await $fetch(`/api/documents/${props.documentId}`)
    // Handle response structure based on your example
    if (response.data && response.data.document) {
      document.value = response.data.document
    } else {
      document.value = response.data?.document || response
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Gagal memuat detail dokumen'
  } finally {
    loading.value = false
  }
}

// Helper functions
const getTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'SURAT_DOMISILI': 'Surat Domisili',
    'SURAT_TIDAK_MAMPU': 'Surat Keterangan Tidak Mampu',
    'LAPORAN_KEUANGAN': 'Laporan Keuangan',
    'PROGRAM_KERJA': 'Program Kerja',
    'DOKUMEN_LAINNYA': 'Dokumen Lainnya',
    'SURAT_KETERANGAN_DOMISILI': 'Surat Keterangan Domisili',
    'SURAT_KETERANGAN_USAHA': 'Surat Keterangan Usaha',
    'SURAT_KETERANGAN_KELAHIRAN': 'Surat Keterangan Kelahiran',
    'SURAT_KETERANGAN_KEMATIAN': 'Surat Keterangan Kematian',
    'SURAT_KETERANGAN_BELUM_MENIKAH': 'Surat Keterangan Belum Menikah',
    'SURAT_KETERANGAN_TIDAK_MAMPU': 'Surat Keterangan Tidak Mampu',
    'SURAT_PENGANTAR_SKCK': 'Surat Pengantar SKCK',
    'SURAT_KETERANGAN_LAINNYA': 'Surat Keterangan Lainnya'
  }
  return typeMap[type] || type
}

const getStatusDisplay = (status: string): string => {
  const statusMap: Record<string, string> = {
    'DRAFT': 'Draft',
    'PENDING': 'Menunggu',
    'APPROVED': 'Disetujui',
    'REJECTED': 'Ditolak',
    'COMPLETED': 'Selesai'
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800'
    case 'APPROVED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Format date
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return dateString // Return original if parsing fails
  }
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Get file name from path
const getFileName = (filePath: string): string => {
  return filePath.split('/').pop() || filePath
}

// Close modal
const closeModal = () => {
  emit('close')
  document.value = null
  error.value = null
}

// Watch for documentId changes
watch(() => props.documentId, (newId) => {
  if (newId && props.isOpen) {
    fetchDocumentDetail()
  }
}, { immediate: true })
</script>