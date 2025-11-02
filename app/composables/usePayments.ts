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

// Dummy seed data following prisma schema structure
const dummyPayments: Payment[] = [
  {
    id: 'pay_1',
    type: 'IURAN_BULANAN',
    amount: 50000,
    description: 'Iuran bulan Januari 2024',
    dueDate: new Date('2024-01-31'),
    paidDate: new Date('2024-01-25'),
    status: 'PAID',
    wargaName: 'Budi Hartono'
  },
  {
    id: 'pay_2',
    type: 'IURAN_BULANAN',
    amount: 50000,
    description: 'Iuran bulan Februari 2024',
    dueDate: new Date('2024-02-29'),
    paidDate: null,
    status: 'PENDING',
    wargaName: 'Siti Aminah'
  },
  {
    id: 'pay_3',
    type: 'DENDA',
    amount: 10000,
    description: 'Denda keterlambatan pembayaran',
    dueDate: new Date('2024-02-10'),
    paidDate: null,
    status: 'OVERDUE',
    wargaName: 'Joko Widodo'
  },
  {
    id: 'pay_4',
    type: 'SUMBANGAN',
    amount: 150000,
    description: 'Sumbangan acara 17 Agustusan',
    dueDate: new Date('2024-08-10'),
    paidDate: new Date('2024-08-05'),
    status: 'PAID',
    wargaName: 'Karang Taruna'
  }
]

export function usePayments() {
  const payments = ref<Payment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPayments = async () => {
    try {
      loading.value = true
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      payments.value = [...dummyPayments]
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  const addPayment = async (data: Payment) => {
    payments.value.unshift({ ...data, id: `pay_${Date.now()}` })
  }

  const updatePayment = async (id: string, payload: Partial<Payment>) => {
    const idx = payments.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      payments.value[idx] = { ...payments.value[idx], ...payload }
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