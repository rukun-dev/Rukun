import { ref, computed, watch } from 'vue';

export interface KeluargaData {
  id: string;
  noKk: string;
  kepalaKeluarga: string;
  nikKepala: string;
  jumlahAnggota: number;
  alamat: string;
  rt: string;
  rw: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  namaKeluarga: string;
  kodePos: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeluargaFilters {
  searchTerm: string;
  rt: string;
  status: string;
}

export const useKeluarga = () => {
  // State
  const keluargaList = ref<KeluargaData[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchTerm = ref('');
  const filterRt = ref('');
  const filterStatus = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  
  // Pagination state from API
  const apiPagination = ref({
    total_pages: 0,
    total_count: 0,
    per_page: 10,
    has_next: false,
    has_previous: false,
    next_page: null,
    previous_page: null
  });

  // Computed properties
  const filteredKeluarga = computed(() => {
    return keluargaList.value.filter(keluarga => {
      const matchesSearch = 
        keluarga.noKk.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        keluarga.kepalaKeluarga.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        keluarga.nikKepala.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        keluarga.alamat.toLowerCase().includes(searchTerm.value.toLowerCase());
      
      const matchesRt = !filterRt.value || keluarga.rt === filterRt.value;
      const matchesStatus = !filterStatus.value || keluarga.status === filterStatus.value;
      
      return matchesSearch && matchesRt && matchesStatus;
    });
  });

  // For server-side pagination, we just return the current page's data
  const paginatedKeluarga = computed(() => {
    return keluargaList.value;
  });

  // Use API's total_pages for pagination control with null safety
  const totalPages = computed(() => {
    return apiPagination.value?.total_pages || 1;
  });

  const stats = computed(() => {
    const total = keluargaList.value.length;
    const aktif = keluargaList.value.filter(k => k.status === 'Aktif').length;
    const tidakAktif = keluargaList.value.filter(k => k.status === 'Tidak Aktif').length;
    const totalAnggota = keluargaList.value.reduce((sum, k) => sum + k.jumlahAnggota, 0);
    
    return {
      totalKartuKeluarga: total,
      totalAnggotaKeluarga: totalAnggota,
      keluargaAktif: aktif,
      keluargaTidakAktif: tidakAktif
    };
  });

  // Methods
  const loadKeluarga = async (page: number = currentPage.value) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Call API with page parameter
      const response = await fetch(`/api/families?page=${page}&limit=${itemsPerPage.value}`);
      if (!response.ok) {
        throw new Error('Gagal memuat data dari server');
      }
      const result = await response.json();
      
      // Map API response format to our expected KeluargaData interface
      // Handle both single family and array of families response
      if (result.data?.families && Array.isArray(result.data.families)) {
        keluargaList.value = result.data.families.map((family: any) => ({
          id: family.id,
          noKk: family.no_kk,
          kepalaKeluarga: family.head_name,
          nikKepala: '', // Not available in API response
          jumlahAnggota: 0, // Not available in API response
          alamat: family.address,
          rt: family.rt_number,
          rw: family.rw_number,
          provinsi: family.provinsi,
          kabupaten: family.kabupaten,
          kecamatan: family.kecamatan,
          kelurahan: family.kelurahan,
          namaKeluarga: family.name,
          kodePos: family.postal_code,
          status: 'Aktif', // Default status since not available in API
          createdAt: family.created_at,
          updatedAt: family.updated_at
        }));
      } else {
        keluargaList.value = [];
      }
      
      // Save pagination information from API
      if (result.pagination) {
        apiPagination.value = result.pagination;
      }
      
      // Update current page
      currentPage.value = page;
    } catch (err) {
      error.value = 'Gagal memuat data kartu keluarga';
      console.error('Error loading keluarga data:', err);
    } finally {
      loading.value = false;
    }
  };
  
  // Pagination control methods
  const nextPage = () => {
    if (apiPagination.value.has_next && apiPagination.value.next_page !== null) {
      loadKeluarga(apiPagination.value.next_page);
    }
  };
  
  const previousPage = () => {
    if (apiPagination.value.has_previous && apiPagination.value.previous_page !== null) {
      loadKeluarga(apiPagination.value.previous_page);
    }
  };
  
  const goToPage = (page: number) => {
    const totalPages = apiPagination.value?.total_pages || 1;
    if (page >= 1 && page <= totalPages) {
      loadKeluarga(page);
    }
  };

  const addKeluarga = async (data: Omit<KeluargaData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Validate and convert data to ensure all required fields are strings
      const validateString = (value: any, defaultValue: string = ''): string => {
        if (value === null || value === undefined) return defaultValue;
        return String(value);
      };

      // Convert our data format to API expected format with proper validation
      // Using camelCase field names as expected by the API (based on error message)
      const apiData = {
        noKk: validateString(data.noKk),
        name: validateString(data.namaKeluarga),
        headName: validateString(data.kepalaKeluarga),
        address: validateString(data.alamat),
        rtNumber: validateString(data.rt, '00'),
        rwNumber: validateString(data.rw, '00'),
        kelurahan: validateString(data.kelurahan),
        kecamatan: validateString(data.kecamatan),
        kabupaten: validateString(data.kabupaten),
        provinsi: validateString(data.provinsi),
        postalCode: validateString(data.kodePos)
      };

      const response = await fetch('/api/families', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        // Parse the error response to provide more detailed information
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || errorResponse.error?.message || 'Gagal menambahkan data');
      }
      
      const result = await response.json();
      
      // Handle API response based on the provided success structure
      if (result.success && result.data?.family) {
        const newFamily: KeluargaData = {
          id: validateString(result.data.family.id),
          noKk: validateString(result.data.family.no_kk),
          kepalaKeluarga: validateString(result.data.family.head_name),
          nikKepala: '', // Not available in API response
          jumlahAnggota: 0, // Not available in API response
          alamat: validateString(result.data.family.address),
          rt: validateString(result.data.family.rt_number),
          rw: validateString(result.data.family.rw_number),
          provinsi: validateString(result.data.family.provinsi),
          kabupaten: validateString(result.data.family.kabupaten),
          kecamatan: validateString(result.data.family.kecamatan),
          kelurahan: validateString(result.data.family.kelurahan),
          namaKeluarga: validateString(result.data.family.name),
          kodePos: validateString(result.data.family.postal_code),
          status: 'Aktif', // Default status since not available in API
          createdAt: result.data.family.created_at || new Date().toISOString(),
          updatedAt: result.data.family.updated_at || new Date().toISOString()
        };
        
        keluargaList.value = [newFamily, ...keluargaList.value];
        return newFamily;
      } else {
        throw new Error('Invalid response structure from API');
      }
    } catch (err) {
      console.error('Error adding keluarga:', err);
      throw err;
    }
  };

  const updateKeluarga = async (id: string, data: Partial<KeluargaData>) => {
    try {
      // Convert our data format to API expected format
      const apiData: any = {};
      if (data.noKk !== undefined) apiData.noKk = data.noKk;
      if (data.namaKeluarga !== undefined) apiData.name = data.namaKeluarga;
      if (data.kepalaKeluarga !== undefined) apiData.headName = data.kepalaKeluarga;
      if (data.alamat !== undefined) apiData.address = data.alamat;
      if (data.rt !== undefined) apiData.rtNumber = data.rt;
      if (data.rw !== undefined) apiData.rwNumber = data.rw;
      if (data.kelurahan !== undefined) apiData.kelurahan = data.kelurahan;
      if (data.kecamatan !== undefined) apiData.kecamatan = data.kecamatan;
      if (data.kabupaten !== undefined) apiData.kabupaten = data.kabupaten;
      if (data.provinsi !== undefined) apiData.provinsi = data.provinsi;
      if (data.kodePos !== undefined) apiData.postalCode = data.kodePos;

      const response = await fetch(`/api/families/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      });
      
      if (!response.ok) {
        throw new Error('Gagal memperbarui data');
      }
      
      const result = await response.json();
      
      // Convert API response back to our format
      // Server returns data in result.family, not result.data
      const familyData = result.family;
      if (!familyData) {
        throw new Error('Invalid response structure from API');
      }
      
      const updatedFamily: KeluargaData = {
        id: familyData.id,
        noKk: familyData.no_kk,
        kepalaKeluarga: familyData.head_name,
        nikKepala: '',
        jumlahAnggota: 0,
        alamat: familyData.address,
        rt: familyData.rt_number,
        rw: familyData.rw_number,
        provinsi: familyData.provinsi,
        kabupaten: familyData.kabupaten,
        kecamatan: familyData.kecamatan,
        kelurahan: familyData.kelurahan,
        namaKeluarga: familyData.name,
        kodePos: familyData.postal_code,
        status: 'Aktif',
        createdAt: familyData.created_at,
        updatedAt: familyData.updated_at
      };
      
      const index = keluargaList.value.findIndex(k => k.id === id);
      if (index !== -1) {
        keluargaList.value[index] = updatedFamily;
      }
    } catch (err) {
      console.error('Error updating keluarga:', err);
      throw err;
    }
  };

  const deleteKeluarga = async (id: string) => {
    try {
      const response = await fetch(`/api/families/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }
      
      const index = keluargaList.value.findIndex(k => k.id === id);
      if (index !== -1) {
        keluargaList.value.splice(index, 1);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting keluarga:', err);
      throw err;
    }
  };

  const resetFilters = () => {
    searchTerm.value = '';
    filterRt.value = '';
    filterStatus.value = '';
    loadKeluarga(1); // Reset to first page
  };

  // Watch for filter changes and reset to first page
  watch([searchTerm, filterRt, filterStatus], () => {
    currentPage.value = 1;
  });

  return {
    // State
    keluargaList,
    loading,
    error,
    searchTerm,
    filterRt,
    filterStatus,
    currentPage,
    itemsPerPage,
    apiPagination,
    
    // Computed
    filteredKeluarga,
    paginatedKeluarga,
    totalPages,
    stats,
    
    // Methods
    loadKeluarga,
    addKeluarga,
    updateKeluarga,
    deleteKeluarga,
    resetFilters,
    nextPage,
    previousPage,
    goToPage
  };
}