import { ref, computed, watch } from 'vue'
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
  houseNumber?: string | null
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
  // RT defaults (RT Profile)
  const rtDefaults = ref<{
    rtNumber: string
    rwNumber: string
    kelurahan: string
    kecamatan: string
    kabupaten: string
    provinsi: string
    postalCode?: string | null
  } | null>(null)
  const rtConfigured = computed(() => !!rtDefaults.value)
  // Family selection
  const familyQuery = ref('')
  const familyOptions = ref<Array<{ id: string; noKk: string; name: string; head_name?: string; rt?: string; rw?: string }>>([])
  const selectedFamilyId = ref<string | null>(null)
  const selectedFamily = ref<any | null>(null)

  const form = ref({
    houseNumber: '',
    rtNumber: '',
    rwNumber: '',
    headNik: '',
    familyId: undefined as string | undefined,
    familyCount: 0,
    memberCount: 0,
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    postalCode: '' as string | undefined,
  })

  // Edit state
  const editingHouseId = ref<string | null>(null)
  const isEditing = computed(() => !!editingHouseId.value)

  const canSubmit = computed(() => {
    return (
      !!form.value.rtNumber &&
      !!form.value.rwNumber &&
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
      const data = res?.data ?? res
      const metaPag = res?.meta?.pagination
      houses.value = data?.records || []
      pagination.value = {
        total: (data?.total ?? metaPag?.total ?? 0),
        page: (data?.page ?? metaPag?.current_page ?? page),
        per_page: (data?.per_page ?? metaPag?.per_page ?? limit.value),
        total_pages: (data?.total_pages ?? metaPag?.total_pages ?? 1),
      }
    } catch (e: any) {
      error.value = e?.data?.message || e?.message || 'Gagal memuat data rumah'
    } finally {
      loading.value = false
    }
  }

  async function loadRtProfile() {
    try {
      const res = await $fetch<any>('/api/rt-profile')
      const p = res?.data?.profile
      if (p) {
        rtDefaults.value = {
          rtNumber: p.rt_number,
          rwNumber: p.rw_number,
          kelurahan: p.kelurahan,
          kecamatan: p.kecamatan,
          kabupaten: p.kabupaten,
          provinsi: p.provinsi,
          postalCode: p.postal_code || undefined,
        }
        // Prefill form location if empty
        form.value.rtNumber = form.value.rtNumber || rtDefaults.value.rtNumber || ''
        form.value.rwNumber = form.value.rwNumber || rtDefaults.value.rwNumber || ''
        form.value.kelurahan = rtDefaults.value.kelurahan || ''
        form.value.kecamatan = rtDefaults.value.kecamatan || ''
        form.value.kabupaten = rtDefaults.value.kabupaten || ''
        form.value.provinsi = rtDefaults.value.provinsi || ''
        form.value.postalCode = rtDefaults.value.postalCode || ''
      } else {
        rtDefaults.value = null
      }
    } catch (_) {
      rtDefaults.value = null
    }
  }

  async function searchWargaHeads(query: string) {
    headQuery.value = query
    const q = query?.trim()
    if (!q || q.length < 2) {
      headOptions.value = []
      return
    }
    try {
      // Jika input adalah NIK 16 digit, gunakan endpoint spesifik untuk hasil akurat,
      // dan fallback ke pencarian contains jika tidak ditemukan
      if (/^\d{16}$/.test(q)) {
        try {
          const res = await $fetch<any>(`/api/warga/by-nik/${q}`)
          const w = res?.data?.warga
          if (w) {
            headOptions.value = [{ nik: w.nik, name: w.name, noKk: w.noKk ?? w.no_kk, address: w.address }]
            // Auto-select when exact NIK found
            form.value.headNik = w.nik
            // Prefill lokasi dari warga detail jika belum terisi
            form.value.rtNumber = form.value.rtNumber || w.rt_number || ''
            form.value.rwNumber = form.value.rwNumber || w.rw_number || ''
            form.value.kelurahan = form.value.kelurahan || w.kelurahan || form.value.kelurahan
            form.value.kecamatan = form.value.kecamatan || w.kecamatan || form.value.kecamatan
            form.value.kabupaten = form.value.kabupaten || w.kabupaten || form.value.kabupaten
            form.value.provinsi = form.value.provinsi || w.provinsi || form.value.provinsi
            form.value.postalCode = form.value.postalCode || w.postal_code || form.value.postalCode
            // Jika ada No KK, coba prefilling keluarga untuk kuantitas anggota
            const noKk = w.noKk ?? w.no_kk
            if (noKk) {
              try {
                const famRes = await $fetch<any>(`/api/families/by-nokk/${noKk}`)
                const fam = famRes?.data?.family
                if (fam?.id) {
                  selectedFamilyId.value = fam.id
                  form.value.familyId = fam.id
                  // Prefill RT/RW dari data keluarga jika belum ada
                  form.value.rtNumber = form.value.rtNumber || fam.rt_number || ''
                  form.value.rwNumber = form.value.rwNumber || fam.rw_number || ''
                  form.value.kelurahan = form.value.kelurahan || fam.kelurahan || form.value.kelurahan
                  form.value.kecamatan = form.value.kecamatan || fam.kecamatan || form.value.kecamatan
                  form.value.kabupaten = form.value.kabupaten || fam.kabupaten || form.value.kabupaten
                  form.value.provinsi = form.value.provinsi || fam.provinsi || form.value.provinsi
                  form.value.postalCode = form.value.postalCode || fam.postal_code || form.value.postalCode
                  // Atur kuantitas default
                  form.value.familyCount = form.value.familyCount || 1
                  form.value.memberCount = form.value.memberCount || fam.members_count || 0
                }
              } catch (_) {
                // abaikan jika tidak ditemukan keluarga
              }
            }
            return
          }
        } catch (_) {
          // ignore and fallback
        }
        const resNik = await $fetch<any>(`/api/warga/search?nik=${encodeURIComponent(q)}&limit=10&page=1`)
        const itemsNik = resNik?.data?.records || []
        headOptions.value = itemsNik.map((w: any) => ({ nik: w.nik, name: w.name, noKk: w.noKk ?? w.no_kk, address: w.address }))
        // If only one match, auto-select
        if (itemsNik.length === 1) {
          form.value.headNik = itemsNik[0].nik
          const w = itemsNik[0]
          // Prefill lokasi dari hasil search jika belum terisi
          form.value.rtNumber = form.value.rtNumber || w.rtNumber || ''
          form.value.rwNumber = form.value.rwNumber || w.rwNumber || ''
          form.value.kelurahan = form.value.kelurahan || w.kelurahan || form.value.kelurahan
          form.value.kecamatan = form.value.kecamatan || w.kecamatan || form.value.kecamatan
          form.value.kabupaten = form.value.kabupaten || w.kabupaten || form.value.kabupaten
          form.value.provinsi = form.value.provinsi || w.provinsi || form.value.provinsi
          form.value.postalCode = form.value.postalCode || w.postalCode || form.value.postalCode
          const noKk = w.noKk ?? w.no_kk
          if (noKk) {
            try {
              const famRes = await $fetch<any>(`/api/families/by-nokk/${noKk}`)
              const fam = famRes?.data?.family
              if (fam?.id) {
                selectedFamilyId.value = fam.id
                form.value.familyId = fam.id
                form.value.familyCount = form.value.familyCount || 1
                form.value.memberCount = form.value.memberCount || fam.members_count || 0
              }
            } catch (_) {}
          }
        }
        return
      }

      // Jika input numerik tapi bukan 16 digit, prioritaskan filter di field nik
      const isNumeric = /^\d+$/.test(q)
      const url = isNumeric
        ? `/api/warga/search?nik=${encodeURIComponent(q)}&limit=10&page=1`
        : `/api/warga/search?q=${encodeURIComponent(q)}&limit=10&page=1`
      const res = await $fetch<any>(url)
      const items = res?.data?.records || []
      headOptions.value = items.map((w: any) => ({ nik: w.nik, name: w.name, noKk: w.noKk, address: w.address }))
    } catch (e) {
      headOptions.value = []
    }
  }

  // Watch perubahan headNik dari dropdown untuk autofill otomatis
  watch(
    () => form.value.headNik,
    async (newNik) => {
      if (!newNik) return
      try {
        const res = await $fetch<any>(`/api/warga/by-nik/${newNik}`)
        const w = res?.data?.warga
        if (!w) return
        form.value.rtNumber = form.value.rtNumber || w.rt_number || ''
        form.value.rwNumber = form.value.rwNumber || w.rw_number || ''
        form.value.kelurahan = form.value.kelurahan || w.kelurahan || form.value.kelurahan
        form.value.kecamatan = form.value.kecamatan || w.kecamatan || form.value.kecamatan
        form.value.kabupaten = form.value.kabupaten || w.kabupaten || form.value.kabupaten
        form.value.provinsi = form.value.provinsi || w.provinsi || form.value.provinsi
        form.value.postalCode = form.value.postalCode || w.postal_code || form.value.postalCode
        const noKk = w.noKk ?? w.no_kk
        if (noKk) {
          try {
            const famRes = await $fetch<any>(`/api/families/by-nokk/${noKk}`)
            const fam = famRes?.data?.family
            if (fam?.id) {
              selectedFamilyId.value = fam.id
              form.value.familyId = fam.id
              // Utamakan RT Profile untuk RT/RW jika ada; jika tidak, gunakan dari keluarga
              if (!rtDefaults.value?.rtNumber) form.value.rtNumber = form.value.rtNumber || fam.rt_number || ''
              if (!rtDefaults.value?.rwNumber) form.value.rwNumber = form.value.rwNumber || fam.rw_number || ''
              form.value.kelurahan = form.value.kelurahan || fam.kelurahan || form.value.kelurahan
              form.value.kecamatan = form.value.kecamatan || fam.kecamatan || form.value.kecamatan
              form.value.kabupaten = form.value.kabupaten || fam.kabupaten || form.value.kabupaten
              form.value.provinsi = form.value.provinsi || fam.provinsi || form.value.provinsi
              form.value.postalCode = form.value.postalCode || fam.postal_code || form.value.postalCode
              form.value.familyCount = form.value.familyCount || 1
              form.value.memberCount = form.value.memberCount || fam.members_count || 0
            }
          } catch (_) {}
        }
      } catch (_) {}
    },
    { flush: 'post' }
  )

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
    // ensure create mode
    editingHouseId.value = null
  }

  function closeForm() {
    showForm.value = false
    formError.value = null
  }

  function resetForm() {
    form.value = {
      houseNumber: '',
      rtNumber: '',
      rwNumber: '',
      headNik: '',
      familyId: undefined,
      familyCount: 0,
      memberCount: 0,
      kelurahan: rtDefaults.value?.kelurahan || '',
      kecamatan: rtDefaults.value?.kecamatan || '',
      kabupaten: rtDefaults.value?.kabupaten || '',
      provinsi: rtDefaults.value?.provinsi || '',
      postalCode: rtDefaults.value?.postalCode || '',
    }
    headQuery.value = ''
    headOptions.value = []
    familyQuery.value = ''
    familyOptions.value = []
    selectedFamilyId.value = null
    selectedFamily.value = null
    editingHouseId.value = null
  }

  function startEdit(h: HouseItem) {
    showForm.value = true
    formError.value = null
    editingHouseId.value = h.id
    // Prefill form from house record
    form.value.houseNumber = h.houseNumber || ''
    form.value.rtNumber = h.rtNumber || ''
    form.value.rwNumber = h.rwNumber || ''
    form.value.headNik = h.headNik || ''
    form.value.familyId = undefined
    form.value.familyCount = h.familyCount ?? 0
    form.value.memberCount = h.memberCount ?? 0
    form.value.kelurahan = h.kelurahan || ''
    form.value.kecamatan = h.kecamatan || ''
    form.value.kabupaten = h.kabupaten || ''
    form.value.provinsi = h.provinsi || ''
    form.value.postalCode = h.postalCode || ''
    headQuery.value = ''
    headOptions.value = h.head
      ? [{ nik: h.head.nik, name: h.head.name, noKk: h.head.noKk ?? undefined, address: h.head.address ?? undefined }]
      : []
    selectedFamilyId.value = null
    selectedFamily.value = null
  }

  async function submitForm() {
    formLoading.value = true
    formError.value = null
    try {
      if (editingHouseId.value) {
        // Update mode: only send allowed fields
        const payload: any = {}
        if (form.value.houseNumber) payload.houseNumber = form.value.houseNumber
        if (form.value.headNik) payload.headNik = form.value.headNik
        payload.familyCount = form.value.familyCount
        payload.memberCount = form.value.memberCount
        await $fetch(`/api/houses/${editingHouseId.value}`, { method: 'PUT', body: payload })
        success('Rumah berhasil diperbarui')
        closeForm()
        resetForm()
        await loadHouses(currentPage.value)
      } else {
        const payload = { ...form.value }
        // Jangan kirim houseNumber jika kosong agar lolos validasi server (opsional)
        if (typeof payload.houseNumber === 'string' && payload.houseNumber.trim() === '') {
          delete (payload as any).houseNumber
        }
        // Jangan kirim familyId jika kosong atau bukan cuid
        if (!payload.familyId || typeof payload.familyId !== 'string' || payload.familyId.trim() === '') {
          delete (payload as any).familyId
        }
        // Lengkapi lokasi dari RT Profile jika ada dan belum diisi
        if (!payload.kelurahan && rtDefaults.value?.kelurahan) payload.kelurahan = rtDefaults.value.kelurahan
        if (!payload.kecamatan && rtDefaults.value?.kecamatan) payload.kecamatan = rtDefaults.value.kecamatan
        if (!payload.kabupaten && rtDefaults.value?.kabupaten) payload.kabupaten = rtDefaults.value.kabupaten
        if (!payload.provinsi && rtDefaults.value?.provinsi) payload.provinsi = rtDefaults.value.provinsi
        if (!payload.postalCode && rtDefaults.value?.postalCode) payload.postalCode = rtDefaults.value.postalCode

        if (selectedFamilyId.value && !payload.familyId) {
          payload.familyId = selectedFamilyId.value
        }
        await $fetch('/api/houses', { method: 'POST', body: payload })
        success('Rumah berhasil ditambahkan')
        closeForm()
        resetForm()
        await loadHouses(currentPage.value)
      }
    } catch (e: any) {
      formError.value = e?.data?.message || e?.message || 'Gagal menyimpan rumah'
      // Pastikan selalu mengirim string ke toastError (bukan null)
      toastError(formError.value || 'Gagal menyimpan rumah')
    } finally {
      formLoading.value = false
    }
  }

  async function deleteHouse(id: string) {
    try {
      // Gunakan cast untuk melewati batasan tipe sementara hingga types di-refresh
      await ($fetch as any)(`/api/houses/${id}`, { method: 'DELETE' })
      success('Rumah berhasil dihapus')
      await loadHouses(currentPage.value)
    } catch (e: any) {
      toastError(e?.data?.message || e?.message || 'Gagal menghapus rumah')
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
    rtDefaults,
    rtConfigured,
    loadRtProfile,
    familyQuery,
    familyOptions,
    selectedFamily,
    searchFamilies,
    chooseFamily,
    openForm,
    startEdit,
    closeForm,
    resetForm,
    submitForm,
    canSubmit,
    editingHouseId,
    isEditing,
    deleteHouse,
  }
}
