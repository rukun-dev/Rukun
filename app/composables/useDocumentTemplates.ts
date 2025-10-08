import { ref, computed } from 'vue';
import { useToast } from '@/composables/useToast'; // 假设已经有这个composable
import type { DocumentType } from '@prisma/client';

export interface DocumentTemplate {
  id: string;
  type: DocumentType;
  content: string;
  variables?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariables {
  name: string;
  description: string;
}

export const useDocumentTemplates = () => {
  // State
  const templates = ref<DocumentTemplate[]>([]);
  const isLoading = ref(false);
  const apiError = ref<string | null>(null);
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const searchQuery = ref('');
  const selectedType = ref<DocumentType | ''>('');

  // Toast notification
  const { toast } = useToast();

  // Computed
  const filteredTemplates = computed(() => {
    let filtered = templates.value;

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(template => 
        template.type.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (selectedType.value) {
      filtered = filtered.filter(template => template.type === selectedType.value);
    }

    return filtered;
  });

  const paginatedTemplates = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredTemplates.value.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredTemplates.value.length / itemsPerPage.value);
  });

  const startIndex = computed(() => {
    return (currentPage.value - 1) * itemsPerPage.value + 1;
  });

  const endIndex = computed(() => {
    return Math.min(startIndex.value + itemsPerPage.value - 1, filteredTemplates.value.length);
  });

  // Functions
  const fetchTemplates = async () => {
    isLoading.value = true;
    apiError.value = null;

    try {
      const response = await $fetch<DocumentTemplate[]>('/api/documents-templates', {
        method: 'GET'
      });
      templates.value = response;
    } catch (error: any) {
      apiError.value = error.message || 'Gagal memuat data template dokumen';
      console.error('Error fetching templates:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const createTemplate = async (data: Partial<DocumentTemplate>) => {
    isLoading.value = true;
    apiError.value = null;

    try {
      const response = await $fetch<DocumentTemplate>('/api/documents-templates', {
        method: 'POST',
        body: data
      });
      templates.value.push(response);
      toast?.success?.('Template dokumen berhasil dibuat!');
      return response;
    } catch (error: any) {
      apiError.value = error.message || 'Gagal membuat template dokumen';
      console.error('Error creating template:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const updateTemplate = async (id: string, data: Partial<DocumentTemplate>) => {
    // Note: Since there's no PUT endpoint, we'll use a placeholder implementation
    // This might need to be updated when the PUT endpoint is available
    isLoading.value = true;
    apiError.value = null;

    try {
      // For now, we'll just update the local data
      // When PUT endpoint is available, replace with actual API call
      const index = templates.value.findIndex(t => t.id === id);
      if (index !== -1) {
        templates.value[index] = { ...templates.value[index], ...data };
        toast?.success?.('Template dokumen berhasil diperbarui!');
        return templates.value[index];
      }
      throw new Error('Template tidak ditemukan');
    } catch (error: any) {
      apiError.value = error.message || 'Gagal memperbarui template dokumen';
      console.error('Error updating template:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteTemplate = async (id: string) => {
    isLoading.value = true;
    apiError.value = null;

    try {
      await $fetch(`/api/documents-templates/${id}`, {
        method: 'DELETE'
      });
      templates.value = templates.value.filter(template => template.id !== id);
      toast?.success?.('Template dokumen berhasil dihapus!');
    } catch (error: any) {
      apiError.value = error.message || 'Gagal menghapus template dokumen';
      console.error('Error deleting template:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const toggleTemplateStatus = async (id: string) => {
    const template = templates.value.find(t => t.id === id);
    if (template) {
      await updateTemplate(id, { isActive: !template.isActive });
    }
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
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // Reset filters
  const resetFilters = () => {
    searchQuery.value = '';
    selectedType.value = '';
    currentPage.value = 1;
  };

  return {
    // State
    templates,
    isLoading,
    apiError,
    currentPage,
    itemsPerPage,
    searchQuery,
    selectedType,

    // Computed
    filteredTemplates,
    paginatedTemplates,
    totalPages,
    startIndex,
    endIndex,

    // Functions
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateStatus,
    nextPage,
    previousPage,
    goToPage,
    resetFilters
  };
};