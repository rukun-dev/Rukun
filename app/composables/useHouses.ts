import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'

interface HouseHead {
  nik: string
  name: string
  noKk?: string | null
  address?: string | null
}

interface HouseItem {
  id: string
  rtNumber: string
  rwNumber: string
  kelurahan: string
  kecamatan: string
  kabupaten: string
  provinsi: string
  postalCode?: string | null
  headNik: string
  familyCount: number
  memberCount: number
  createdAt: string
  updatedAt: string
  head?: HouseHead
}

interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export function useHouses() {
  const houses = ref<HouseItem[]>([])
  const pagination = ref<PaginationMeta | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { success, error: toastError } = useToast()

  // Filters
  const searchTerm = ref('')
  const currentPage = ref(1)
  const limit = ref(10)

  // Form state
  const showForm = ref(false)
  const formLoading = ref(false)
  const formError = ref<string | null>(null)
  const headQuery = ref('')
  const headOptions = ref<HouseHead[]>([])
  // Family selection
  const familyQuery = ref('')
  const familyOptions = ref<Array<{ id: string; noKk: string; name: string; head_name?: string; rt?: string; rw?: string }>>([])
  const selectedFamilyId = ref<string | null>(null)
  const selectedFamily = ref<any | null>(null)

  const form = ref({
    rtNumber: '',
    rwNumber: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    postalCode: '',
    headNik: '',
    familyId: '' as string | undefined,
    familyCount: 0,
    memberCount: 0,
  })

  const canSubmit = computed(() => {
    return (
      !!form.value.rtNumber &&
      !!form.value.rwNumber &&
      !!form.value.kelurahan &&
      !!form.value.kecamatan &&
      !!form.value.kabupaten &&
      !!form.value.provinsi &&
      (!!form.value.headNik || !!form.value.familyId || !!selectedFamilyId.value) &&
      form.value.familyCount >= 0 &&
      form.value.memberCount >= 0
    )
  })

  async function loadHouses(page = 1) {
    loading.value = true
    error.value = null
    currentPage.value = page
    try {
      const q = searchTerm.value?.trim()
      const url = `/api/houses?page=${page}&limit=${limit.value}` + (q ? `&q=${encodeURIComponent(q)}` : '')
      const res = await $fetch<any>(url)
      houses.value = res?.records || []
      pagination.value = {
        total: res?.total || 0,
        page: res?.page || page,
        per_page: res?.per_page || limit.value,
        total_pages: res?.total_pages || 1,
      }
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Gagal memuat data rumah'
    } finally {
      loading.value = false
    }
  }

  async function searchWargaHeads(query: string) {
    headQuery.value = query
    if (!query || query.trim().length < 2) {
      headOptions.value = []
      return
    }
    try {
      const res = await $fetch<any>(`/api/warga/search?q=${encodeURIComponent(query)}&limit=10&page=1`)
      const items = res?.data || res?.records || []
      headOptions.value = items.map((w: any) => ({ nik: w.nik, name: w.name, noKk: w.noKk, address: w.address }))
    } catch (e) {
      headOptions.value = []
    }
  }

  async function searchFamilies(query: string) {
    familyQuery.value = query
    if (!query || query.trim().length < 2) {
      familyOptions.value = []
      return
    }
    try {
      const res = await $fetch<any>(`/api/families?search=${encodeURIComponent(query)}&limit=10&page=1`)
      const items = res?.families || []
      familyOptions.value = items.map((f: any) => ({ id: f.id, noKk: f.no_kk, name: f.name, head_name: f.head_name, rt: f.rt_number, rw: f.rw_number }))
    } catch (e) {
      familyOptions.value = []
    }
  }

  async function chooseFamily(id: string) {
    selectedFamilyId.value = id
    form.value.familyId = id
    try {
      const res = await $fetch<any>(`/api/families/${id}`)
      selectedFamily.value = res?.family || null
      // Prefill lokasi jika kosong
      if (selectedFamily.value) {
        form.value.rtNumber = form.value.rtNumber || selectedFamily.value.rt_number || ''
        form.value.rwNumber = form.value.rwNumber || selectedFamily.value.rw_number || ''
        form.value.kelurahan = form.value.kelurahan || selectedFamily.value.kelurahan || ''
        form.value.kecamatan = form.value.kecamatan || selectedFamily.value.kecamatan || ''
        form.value.kabupaten = form.value.kabupaten || selectedFamily.value.kabupaten || ''
        form.value.provinsi = form.value.provinsi || selectedFamily.value.provinsi || ''
        form.value.postalCode = form.value.postalCode || selectedFamily.value.postal_code || ''
        // Attempt set head NIK from members
        const head = selectedFamily.value.members?.find((m: any) => m.relationship === 'HEAD')
        if (head?.warga?.nik) {
          form.value.headNik = head.warga.nik
        }
      }
    } catch (e) {
      selectedFamily.value = null
    }
  }

  function openForm() {
    showForm.value = true
    formError.value = null
  }

  function closeForm() {
    showForm.value = false
    formError.value = null
  }

  function resetForm() {
    form.value = {
      rtNumber: '',
      rwNumber: '',
      kelurahan: '',
      kecamatan: '',
      kabupaten: '',
      provinsi: '',
      postalCode: '',
      headNik: '',
      familyId: undefined,
      familyCount: 0,
      memberCount: 0,
    }
    headQuery.value = ''
    headOptions.value = []
    familyQuery.value = ''
    familyOptions.value = []
    selectedFamilyId.value = null
    selectedFamily.value = null
  }

  async function submitForm() {
    formLoading.value = true
    formError.value = null
    try {
      const payload = { ...form.value }
      if (selectedFamilyId.value && !payload.familyId) {
        payload.familyId = selectedFamilyId.value
      }
      await $fetch('/api/houses', { method: 'POST', body: payload })
      success('Rumah berhasil ditambahkan')
      closeForm()
      resetForm()
      await loadHouses(currentPage.value)
    } catch (e: any) {
      formError.value = e?.data?.message || e?.message || 'Gagal menyimpan rumah'
      toastError(formError.value)
    } finally {
      formLoading.value = false
    }
  }

  return {
    houses,
    pagination,
    loading,
    error,
    searchTerm,
    currentPage,
    limit,
    loadHouses,
    // form
    showForm,
    form,
    formLoading,
    formError,
    headQuery,
    headOptions,
    searchWargaHeads,
    familyQuery,
    familyOptions,
    selectedFamily,
    searchFamilies,
    chooseFamily,
    openForm,
    closeForm,
    resetForm,
    submitForm,
    canSubmit,
  }
}
