import { ref, computed, watch } from 'vue';

export interface KeluargaData {
  id: number;
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

  // Sample data for development
  const sampleKeluarga: KeluargaData[] = [
    {
      id: 1,
      noKk: '1234567890123456',
      kepalaKeluarga: 'Budi Santoso',
      nikKepala: '1234567890123456',
      jumlahAnggota: 4,
      alamat: 'Jl. Merdeka No. 123',
      rt: '01',
      rw: '05',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Coblong',
      kelurahan: 'Dago',
      namaKeluarga: 'Santoso',
      kodePos: '12345',
      status: 'Aktif',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      noKk: '2345678901234567',
      kepalaKeluarga: 'Siti Rahayu',
      nikKepala: '2345678901234567',
      jumlahAnggota: 3,
      alamat: 'Jl. Pahlawan No. 45',
      rt: '02',
      rw: '05',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Coblong',
      kelurahan: 'Dago',
      namaKeluarga: 'Rahayu',
      kodePos: '12345',
      status: 'Aktif',
      createdAt: '2024-01-16T09:30:00Z',
      updatedAt: '2024-01-16T09:30:00Z'
    },
    {
      id: 3,
      noKk: '3456789012345678',
      kepalaKeluarga: 'Ahmad Rizki',
      nikKepala: '3456789012345678',
      jumlahAnggota: 5,
      alamat: 'Jl. Sejahtera No. 78',
      rt: '03',
      rw: '05',
      provinsi: 'Jawa Barat',
      kabupaten: 'Bandung',
      kecamatan: 'Coblong',
      kelurahan: 'Dago',
      namaKeluarga: 'Rizki',
      kodePos: '12345',
      status: 'Tidak Aktif',
      createdAt: '2024-01-17T10:15:00Z',
      updatedAt: '2024-01-17T10:15:00Z'
    }
  ];

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

  const paginatedKeluarga = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredKeluarga.value.slice(start, end);
  });

  const totalPages = computed(() => {
    return Math.ceil(filteredKeluarga.value.length / itemsPerPage.value);
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
  const loadKeluarga = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For development, use sample data
      keluargaList.value = sampleKeluarga;
    } catch (err) {
      error.value = 'Gagal memuat data kartu keluarga';
      console.error('Error loading keluarga data:', err);
    } finally {
      loading.value = false;
    }
  };

  const addKeluarga = (data: Omit<KeluargaData, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newKeluarga: KeluargaData = {
      ...data,
      id: Math.max(0, ...keluargaList.value.map(k => k.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    keluargaList.value = [newKeluarga, ...keluargaList.value];
    return newKeluarga;
  };

  const updateKeluarga = (id: number, data: Partial<KeluargaData>) => {
    const index = keluargaList.value.findIndex(k => k.id === id)
    if (index !== -1) {
      const updatedData = {
        ...keluargaList.value[index],
        ...data,
        updatedAt: new Date().toISOString()
      } as KeluargaData
      keluargaList.value[index] = updatedData
    }
  };

  const deleteKeluarga = (id: number) => {
    const index = keluargaList.value.findIndex(k => k.id === id);
    if (index !== -1) {
      keluargaList.value.splice(index, 1);
      return true;
    }
    return false;
  };

  const resetFilters = () => {
    searchTerm.value = '';
    filterRt.value = '';
    filterStatus.value = '';
    currentPage.value = 1;
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
    resetFilters
  };
}