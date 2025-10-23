import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
// Use direct toast notifications for consistency with the project
import { toast } from 'vue-sonner';
// Define types since @/types/announcement was removed

export interface AnnouncementFormData {
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EVENT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPublished: boolean;
  expiresAt: string | null;
  recipients?: Array<{ recipientType: 'ALL' | 'ROLE' | 'SPECIFIC'; recipientId: string | null; }>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EVENT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isPublished: boolean;
  expiresAt: string | null;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name: string;
    role: string;
  };
  recipients?: Array<{
    id: string;
    announcementId: string;
    recipientType: string;
    recipientId: string | null;
    isRead: boolean;
    readAt: string | null;
  }>;
}

export interface AnnouncementMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_prev_page: boolean;
  has_next_page: boolean;
}

export const useAnnouncements = () => {
  const { user, canAccess } = useAuth();
  
  // State
  const announcements = ref<Announcement[]>([]);
  const loading = ref(false);
  const error = ref('');
  const meta = ref<AnnouncementMeta>({
    total: 0,
    page: 1,
    limit: 10,
    total_pages: 0,
    has_prev_page: false,
    has_next_page: false
  });
  
  const filters = ref({
    search: '',
    type: '',
    status: '',
    priorities: [] as string[]
  });
  
  const canEditAnnouncement = computed(() => {
    // Same permissions as creating
    return canAccess(['SUPER_ADMIN', 'KETUA_RT', 'SEKRETARIS']);
  });
  
  // Methods
  const fetchAnnouncements = async (page = 1, limit = 10) => {
    loading.value = true;
    error.value = '';
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (filters.value.search) {
        queryParams.append('search', filters.value.search);
      }
      
      if (filters.value.type) {
        queryParams.append('type', filters.value.type);
      }
      
      if (filters.value.status) {
        queryParams.append('isPublished', filters.value.status === 'active' ? 'true' : 'false');
      }
      
      if (filters.value.priorities.length > 0) {
        filters.value.priorities.forEach(priority => {
          queryParams.append('priority', priority);
        });
      }
      
  
      console.log('Fetching announcements with params:', queryParams.toString());
      
      const response = await $fetch(`/api/announcements?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response structure:', Object.keys(response));
      console.log('Full response:', response);
      
      // Handle multiple possible response structures
      let announcementsData: Announcement[] = [];
      let paginationData: any = null;
      
      // Case 1: Response has data.announcements and pagination structure
      if (response && response.data && response.data.announcements && Array.isArray(response.data.announcements)) {
        announcementsData = response.data.announcements as Announcement[];
        paginationData = response.pagination;
      }
      // Case 2: Response has data property with announcements array
      else if (response && response.data && Array.isArray(response.data)) {
        announcementsData = response.data as Announcement[];
        paginationData = response.pagination || response.meta;
      }
      // Case 3: Response is directly an array
      else if (Array.isArray(response)) {
        announcementsData = response as Announcement[];
      }
      // Case 4: Response has announcements property at root level
      else if (response && response.announcements && Array.isArray(response.announcements)) {
        announcementsData = response.announcements as Announcement[];
        paginationData = response.pagination || response.meta;
      }
      // Case 5: Try to find any array in the response
      else {
        console.warn('Unexpected API response structure, searching for array data...');
        for (const key in response) {
          if (Array.isArray(response[key])) {
            announcementsData = response[key] as Announcement[];
            console.log(`Found announcements data in response.${key}`);
            break;
          }
        }
      }
      
      // Set announcements data
      if (announcementsData.length > 0) {
        announcements.value = announcementsData;
        console.log('Announcements loaded successfully:', announcements.value.length);
        console.log('First announcement data sample:', announcements.value[0]);
      } else {
        announcements.value = [];
        console.warn('No announcements data found in response');
      }
      
      // Set pagination data if available
      if (paginationData) {
        meta.value = {
          total: paginationData.total || paginationData.total_count || announcementsData.length || 0,
          page: paginationData.current_page || paginationData.page || page,
          limit: paginationData.per_page || paginationData.limit || limit,
          total_pages: paginationData.total_pages || paginationData.last_page || Math.ceil((paginationData.total || announcementsData.length) / limit),
          has_prev_page: paginationData.has_prev || paginationData.has_previous || page > 1,
          has_next_page: paginationData.has_next || page < (paginationData.total_pages || Math.ceil((paginationData.total || announcementsData.length) / limit))
        };
        console.log('Pagination data:', meta.value);
      } else {
        // Default pagination if no pagination data provided
        meta.value = {
          total: announcementsData.length,
          page: page,
          limit: limit,
          total_pages: Math.ceil(announcementsData.length / limit),
          has_prev_page: page > 1,
          has_next_page: false
        };
      }
    } catch (err) {
      error.value = 'Gagal memuat data pengumuman. Silakan coba lagi.';
      console.error('Error fetching announcements:', err);
      toast.error('Gagal memuat data pengumuman. Silakan coba lagi.');
    } finally {
      loading.value = false;
    }
  };
  
  const createAnnouncement = async (data: AnnouncementFormData) => {
    loading.value = true;
    error.value = '';
    
    try {
      // Prepare data with recipients if not provided
      const requestData = {
        ...data,
        recipients: data.recipients || [{ recipientType: 'ALL', recipientId: null }]
      };
      
      // Call actual API
      const response = await $fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestData
      });
      
      if (response && response.success && response.data) {
        // Add the new announcement to the list
        announcements.value.unshift(response.data as Announcement);
        
        // Update pagination meta
        meta.value.total += 1;
        meta.value.total_pages = Math.ceil(meta.value.total / meta.value.limit);
        
        toast.success(response.message || 'Pengumuman berhasil dibuat!');
        return response.data;
      } else {
        throw new Error(response?.message || 'Gagal membuat pengumuman');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal membuat pengumuman';
      error.value = errorMessage;
      toast.error(errorMessage);
      console.error('Error creating announcement:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const updateAnnouncement = async (id: string, data: AnnouncementFormData) => {
    loading.value = true;
    error.value = '';
    
    try {
      // Prepare data with recipients if not provided
      const requestData = {
        ...data,
        recipients: data.recipients || [{ recipientType: 'ALL', recipientId: null }]
      };
      
      // Call actual API
      const response = await $fetch(`/api/announcements/${id}`, {
        method: 'PUT' as const,
        headers: {
          'Content-Type': 'application/json'
        },
        body: requestData
      });
      
      if (response && response.success && response.data) {
        // Update the announcement in the list
        const index = announcements.value.findIndex(a => a.id === id);
        if (index !== -1) {
          announcements.value[index] = response.data as Announcement;
        }
        
        toast.success(response.message || 'Pengumuman berhasil diperbarui!');
        return response.data;
      } else {
        throw new Error(response?.message || 'Gagal memperbarui pengumuman');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memperbarui pengumuman';
      error.value = errorMessage;
      toast.error(errorMessage);
      console.error('Error updating announcement:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };
  

  
  const setFilters = (newFilters: typeof filters.value) => {
    filters.value = { ...newFilters };
    fetchAnnouncements(1, meta.value.limit); // Reset to first page when filters change
  };
  
  const clearFilters = () => {
    filters.value = {
      search: '',
      type: '',
      status: '',
      priorities: []
    };
    fetchAnnouncements(1, meta.value.limit);
  };
  
  const changePage = (page: number) => {
    if (page >= 1 && page <= meta.value.total_pages) {
      fetchAnnouncements(page, meta.value.limit);
    }
  };
  
  const changeLimit = (limit: number) => {
    meta.value.limit = limit;
    fetchAnnouncements(1, limit);
  };
  
  // Lifecycle
  onMounted(() => {
    fetchAnnouncements();
  });
  
  return {
    // State
    announcements,
    loading,
    error,
    meta,
    filters,
    
    // Computed
    canEditAnnouncement,
    
    // Methods
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    setFilters,
    clearFilters,
    changePage,
    changeLimit
  };
};