import { ref } from 'vue'

export interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description: string
  date: Date
  wargaName?: string
}

// Dummy seed data that follows backend schema
const dummyTransactions: Transaction[] = [
  {
    id: 'txn_1',
    type: 'INCOME',
    category: 'IURAN_BULANAN',
    amount: 50000,
    description: 'Iuran bulan Januari 2024',
    date: new Date('2024-01-10'),
    wargaName: 'Budi Hartono'
  },
  {
    id: 'txn_2',
    type: 'INCOME',
    category: 'IURAN_BULANAN',
    amount: 50000,
    description: 'Iuran bulan Februari 2024',
    date: new Date('2024-02-12'),
    wargaName: 'Siti Aminah'
  },
  {
    id: 'txn_3',
    type: 'EXPENSE',
    category: 'KEBERSIHAN_LINGKUNGAN',
    amount: 150000,
    description: 'Pembelian alat kebersihan lingkungan',
    date: new Date('2024-02-20')
  },
  {
    id: 'txn_4',
    type: 'INCOME',
    category: 'DONASI',
    amount: 200000,
    description: 'Donasi kegiatan 17 Agustusan',
    date: new Date('2024-03-01'),
    wargaName: 'Karang Taruna'
  },
  {
    id: 'txn_5',
    type: 'EXPENSE',
    category: 'KEGIATAN',
    amount: 100000,
    description: 'Pembelian hadiah lomba 17 Agustusan',
    date: new Date('2024-03-15')
  }
]

export function useTransactions() {
  const transactions = ref<Transaction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTransactions = async () => {
    try {
      loading.value = true
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      transactions.value = [...dummyTransactions]
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  const addTransaction = async (data: Transaction) => {
    transactions.value.unshift({ ...data, id: `txn_${Date.now()}` })
  }

  const updateTransaction = async (id: string, payload: Partial<Transaction>) => {
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      transactions.value[idx] = { ...transactions.value[idx], ...payload }
    }
  }

  const deleteTransaction = async (id: string) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction
  }
}