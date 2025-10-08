export interface Document {
  id: string;
  title: string;
  number: string;
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
  approval?: {
    id: string;
    status: string;
    approved_at: string | null;
    rejected_at: string | null;
    rejected_reason: string | null;
    approver: {
      id: string;
      name: string;
    };
  };
}

export const useDocuments = () => {
  // State
  const documents = ref<Document[]>([]);
  const isLoading = ref(false);
  const apiError = ref<string | null>(null);
  const searchQuery = ref('');
  const selectedCategory = ref('all');
  const selectedStatus = ref('all');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const viewMode = ref<'table' | 'card'>('table');

  // Stats
  const stats = ref({
    totalDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    pendingDocuments: 0
  });

  // Pagination
  const totalPages = computed(() => Math.ceil(filteredDocuments.value.length / itemsPerPage.value));
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
  const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, filteredDocuments.value.length));
  
  const paginatedDocuments = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredDocuments.value.slice(start, end);
  });

  // Filtered documents
  const filteredDocuments = computed(() => {
    let filtered = documents.value;

    // Search filter
    if (searchQuery.value) {
      filtered = filtered.filter((doc: Document) => 
        doc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        doc.number.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory.value !== 'all') {
      filtered = filtered.filter((doc: Document) => {
        const categoryMap: Record<string, string[]> = {
          'surat': ['SURAT_DOMISILI', 'SURAT_TIDAK_MAMPU'],
          'laporan': ['LAPORAN_KEUANGAN'],
          'keuangan': ['LAPORAN_KEUANGAN'],
          'lainnya': ['DOKUMEN_LAINNYA']
        };
        return categoryMap[selectedCategory.value]?.includes(doc.type) || false;
      });
    }

    // Status filter
    if (selectedStatus.value !== 'all') {
      filtered = filtered.filter((doc: Document) => {
        const status = getApprovalStatus(doc);
        return status.toLowerCase() === selectedStatus.value.toLowerCase();
      });
    }

    return filtered;
  });

  // Helper functions
  const getApprovalStatus = (document: Document): string => {
    if (document.approved_at) return 'DISETUJUI';
    if (document.rejected_at) return 'DITOLAK';
    return 'MENUNGGU';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const updateStats = () => {
    stats.value.totalDocuments = documents.value.length;
    stats.value.approvedDocuments = documents.value.filter((doc: Document) => doc.approved_at).length;
    stats.value.rejectedDocuments = documents.value.filter((doc: Document) => doc.rejected_at).length;
    stats.value.pendingDocuments = documents.value.filter((doc: Document) => !doc.approved_at && !doc.rejected_at).length;
  };

  // Pagination functions
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
    }
  };

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
    }
  };

  const goToPage = (page: number) => {
    currentPage.value = page;
  };

  const updatePagination = () => {
    currentPage.value = 1;
  };

  // Watchers
  watch([searchQuery, selectedCategory, selectedStatus], () => {
    updatePagination();
  });

  // API functions
  const fetchDocuments = async () => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      const response = await $fetch<any>('/api/documents');
      // Sesuaikan dengan response API yang berisi data.documents
      documents.value = response.data?.documents || [];
      updateStats();
    } catch (error) {
      console.error('Error fetching documents:', error);
      apiError.value = 'Gagal memuat dokumen';
    } finally {
      isLoading.value = false;
    }
  };

  const createDocument = async (data: any) => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      const response = await $fetch<any>('/api/documents', {
        method: 'post',
        body: data
      });
      
      documents.value.unshift(response.document);
      updateStats();
      return response;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateDocument = async (id: string, data: any) => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      const response = await $fetch<any>(`/api/documents/${id}`, {
        method: 'put',
        body: data
      });
      
      const index = documents.value.findIndex((doc: Document) => doc.id === id);
      if (index !== -1) {
        documents.value[index] = response.document;
      }
      return response;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteDocument = async (id: string) => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      await $fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      
      documents.value = documents.value.filter((doc: Document) => doc.id !== id);
      updateStats();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const approveDocument = async (id: string) => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      const response = await $fetch<any>(`/api/documents/${id}`, {
        method: 'put',
        body: { status: 'APPROVED' }
      });
      
      const index = documents.value.findIndex((doc: Document) => doc.id === id);
      if (index !== -1) {
        documents.value[index] = response.document;
      }
      updateStats();
      return response;
    } catch (error) {
      console.error('Error approving document:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const rejectDocument = async (id: string, reason: string) => {
    isLoading.value = true;
    apiError.value = null;
    
    try {
      const response = await $fetch<any>(`/api/documents/${id}`, {
        method: 'put',
        body: { status: 'REJECTED', rejected_reason: reason }
      });
      
      const index = documents.value.findIndex((doc: Document) => doc.id === id);
      if (index !== -1) {
        documents.value[index] = response.document;
      }
      updateStats();
      return response;
    } catch (error) {
      console.error('Error rejecting document:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    documents: readonly(documents),
    isLoading: readonly(isLoading),
    apiError: readonly(apiError),
    searchQuery: readonly(searchQuery),
    selectedCategory: readonly(selectedCategory),
    selectedStatus: readonly(selectedStatus),
    currentPage: readonly(currentPage),
    itemsPerPage: readonly(itemsPerPage),
    viewMode: readonly(viewMode),
    stats: readonly(stats),
    
    // Computed
    paginatedDocuments,
    totalPages,
    startIndex,
    endIndex,
    filteredDocuments,
    
    // Functions
    getApprovalStatus,
    formatDate,
    nextPage,
    previousPage,
    goToPage,
    updatePagination,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    approveDocument,
    rejectDocument,
    
    // Mutables (for v-model)
    searchQueryRef: searchQuery,
    selectedCategoryRef: selectedCategory,
    selectedStatusRef: selectedStatus,
    viewModeRef: viewMode
  };
};