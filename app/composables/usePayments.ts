import { ref } from 'vue'

export interface Payment {
  id: string
  type: 'IURAN_BULANAN' | 'IURAN_KEBERSIHAN' | 'SUMBANGAN' | 'DENDA' | 'OTHER'
  amount: number
  description: string
  dueDate: Date
  paidDate?: Date | null
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  wargaName?: string
}

export function usePayments() {
  const payments = ref<Payment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPayments = async () => {
    try {
      loading.value = true
      const resp = await $fetch<any>('/api/finances/payments')
      const items = resp?.data?.payments || []
      payments.value = items.map((p: any) => ({
        id: p.id,
        type: p.type,
        amount: Number(p.amount ?? 0),
        description: p.description,
        dueDate: new Date(p.dueDate),
        paidDate: p.paidDate ? new Date(p.paidDate) : null,
        status: p.status,
        wargaName: p.wargaName
      }))
    } catch (err) {
      error.value = (err as Error)?.message || 'Gagal memuat pembayaran'
    } finally {
      loading.value = false
    }
  }

  const addPayment = async (data: Payment) => {
    payments.value.unshift({ ...data, id: `pay_${Date.now()}` })
  }

  const updatePayment = async (
    id: string,
    payload: Omit<Partial<Payment>, 'id'>
  ) => {
    const idx = payments.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      // Gunakan fallback per-properti agar tidak ada nilai undefined pada tipe wajib
      const current = payments.value[idx]!
      const updated: Payment = {
        id: current.id,
        type: payload.type !== undefined ? payload.type : current.type,
        amount: payload.amount !== undefined ? payload.amount : current.amount,
        description: payload.description !== undefined ? payload.description : current.description,
        dueDate: payload.dueDate !== undefined ? payload.dueDate : current.dueDate,
        paidDate: payload.paidDate !== undefined ? payload.paidDate : current.paidDate,
        status: payload.status !== undefined ? payload.status : current.status,
        wargaName: payload.wargaName !== undefined ? payload.wargaName : current.wargaName
      }
      payments.value[idx] = updated
    }
  }

  const deletePayment = async (id: string) => {
    payments.value = payments.value.filter(p => p.id !== id)
  }

  return {
    payments,
    loading,
    error,
    fetchPayments,
    addPayment,
    updatePayment,
    deletePayment
  }
}