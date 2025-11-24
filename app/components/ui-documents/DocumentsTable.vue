<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

    <!-- Table Content -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  @change="handleSelectAll"
                  :checked="isAllSelected"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Dokumen</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pengirim</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <template v-if="props.loading">
            <!-- Skeleton loader -->
            <tr v-for="i in 5" :key="i">
              <td class="px-6 py-4"><div class="animate-pulse bg-gray-200 rounded h-6 w-64"></div></td>
              <td class="px-6 py-4"><div class="animate-pulse bg-gray-200 rounded h-6 w-32"></div></td>
              <td class="px-6 py-4"><div class="animate-pulse bg-gray-200 rounded h-6 w-24"></div></td>
              <td class="px-6 py-4"><div class="animate-pulse bg-gray-200 rounded h-6 w-32"></div></td>
              <td class="px-6 py-4"><div class="animate-pulse bg-gray-200 rounded h-6 w-32"></div></td>
              <td class="px-6 py-4 text-right"><div class="animate-pulse bg-gray-200 rounded h-8 w-24"></div></td>
            </tr>
          </template>
          <template v-else-if="props.error">
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-red-500">
                {{ props.error }}
              </td>
            </tr>
          </template>
          <template v-else-if="props.documents.length === 0">
            <tr>
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                Tidak ada dokumen yang ditemukan
              </td>
            </tr>
          </template>
          <tr v-for="document in props.documents" :key="document.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input 
                type="checkbox" 
                :checked="props.selectedDocuments?.includes(document.id)"
                @change="$emit(props.selectedDocuments?.includes(document.id) ? 'deselect-document' : 'select-document', document.id)"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="font-medium text-gray-900">{{ document.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ getTypeDisplay(document.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getApprovalClass(getApprovalStatus(document))" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                {{ getApprovalStatus(document) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(document.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ document.requester?.name || document.warga?.id || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="$emit('show-detail', document)" class="text-blue-600 hover:text-blue-900 mr-3">Detail</button>
              <button @click="$emit('edit', document)" class="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
              <button @click="$emit('delete', document)" class="text-red-600 hover:text-red-900">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="$emit('previous-page')" :disabled="props.currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Previous
        </button>
        <button @click="$emit('next-page')" :disabled="props.currentPage === props.totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Showing
            <span class="font-medium">{{ props.startIndex }}</span>
            to
            <span class="font-medium">{{ props.endIndex }}</span>
            of
            <span class="font-medium">{{ props.totalItems }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button @click="$emit('previous-page')" :disabled="props.currentPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span class="sr-only">Previous</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button v-for="page in Math.min(5, props.totalPages || 1)" :key="page" @click="$emit('go-to-page', page)" :class="['relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium', props.currentPage === page ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-500 hover:bg-gray-50']">
              {{ page }}
            </button>
            <button v-if="props.totalPages && props.totalPages > 5" @click="$emit('go-to-page', props.totalPages)" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
              {{ props.totalPages }}
            </button>
            <button @click="$emit('next-page')" :disabled="props.currentPage === props.totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <span class="sr-only">Next</span>
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Document {
  id: string;
  title: string;
  type: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejected_reason: string | null;
  requester?: {
    id: string;
    name: string;
  };
  warga?: {
    id: string;
    name: string;
  };
}

interface Props {
  documents?: Document[];
  loading?: boolean;
  error?: string | null;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
  viewMode?: string;
  selectedDocuments?: string[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'refresh': [];
  'toggle-view': [];
  'show-detail': [document: Document];
  'edit': [document: Document];
  'delete': [document: Document];
  'previous-page': [];
  'next-page': [];
  'go-to-page': [page: number];
  'select-document': [documentId: string];
  'deselect-document': [documentId: string];
  'select-all-documents': [];
  'deselect-all-documents': [];
}>();

// Computed properties for template
const currentViewMode = computed(() => props.viewMode || 'table');

const isAllSelected = computed(() => {
  if (!props.documents?.length) return false;
  return props.documents.every(doc => props.selectedDocuments?.includes(doc.id));
});

const isSelected = (documentId: string): boolean => {
  return props.selectedDocuments?.includes(documentId) || false;
};

// Helper functions
const getTypeDisplay = (type: string): string => {
  const typeMap: Record<string, string> = {
    'SURAT_DOMISILI': 'Surat Domisili',
    'SURAT_TIDAK_MAMPU': 'Surat Keterangan Tidak Mampu',
    'LAPORAN_KEUANGAN': 'Laporan Keuangan',
    'PROGRAM_KERJA': 'Program Kerja',
    'DOKUMEN_LAINNYA': 'Dokumen Lainnya'
  };
  return typeMap[type] || type;
};

const getApprovalStatus = (document: Document): string => {
  // Map backend status to display names
  const statusMap: Record<string, string> = {
    'DRAFT': 'DRAFT',
    'SUBMITTED': 'DIAJUKAN',
    'IN_REVIEW': 'DITINJAU',
    'APPROVED': 'DISETUJUI',
    'REJECTED': 'DITOLAK',
    'COMPLETED': 'SELESAI'
  };
  return statusMap[document.status] || document.status;
};

const getStatusClass = (document: Document): string => {
  // Map status to CSS classes based on backend DocumentStatus enum
  switch (document.status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'SUBMITTED':
      return 'bg-blue-100 text-blue-800';
    case 'IN_REVIEW':
      return 'bg-purple-100 text-purple-800';
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getApprovalClass = (status: string): string => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'DIAJUKAN':
      return 'bg-blue-100 text-blue-800';
    case 'DITINJAU':
      return 'bg-purple-100 text-purple-800';
    case 'DISETUJUI':
      return 'bg-green-100 text-green-800';
    case 'DITOLAK':
      return 'bg-red-100 text-red-800';
    case 'SELESAI':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Selection handlers
const handleSelect = (documentId: string) => {
  if (props.selectedDocuments?.includes(documentId)) {
    emit('deselect-document', documentId);
  } else {
    emit('select-document', documentId);
  }
};

const handleSelectAll = () => {
  if (isAllSelected.value) {
    emit('deselect-all-documents');
  } else {
    emit('select-all-documents');
  }
};
</script>