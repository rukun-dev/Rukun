import { ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  role: string
  isActive: boolean
}

export const useUsers = () => {
  const users = ref<User[]>([])
  const isLoading = ref(false)
  const apiError = ref<string | null>(null)

  // Fetch all users
  const fetchUsers = async () => {
    isLoading.value = true
    apiError.value = null
    try {
      const res = await $fetch<any>('/api/users')
      const rawUsers = res.data?.users || res.users || []
      users.value = rawUsers.map((u: any) => ({
        ...u,
        isActive: u.isActive ?? u.is_active ?? false,
      }))
    } catch (err: any) {
      console.error('Failed fetch users', err)
      apiError.value = 'Gagal memuat pengguna'
    } finally {
      isLoading.value = false
    }
  }

  // Create user
  const createUser = async (payload: Partial<User> & { password: string }) => {
    try {
      const res = await $fetch<any>('/api/users', {
        method: 'post',
        body: payload,
      })
      const newUser = res.data?.user || res.user
      if (newUser) users.value.unshift(newUser)
      return newUser
    } catch (err) {
      console.error('Create user error', err)
      throw err
    }
  }

  // Update user
  const updateUser = async (id: number, payload: Partial<User> & { password?: string }) => {
    try {
      const res = await $fetch<any>(`/api/users/${id}`, {
        method: 'put',
        body: payload,
      })
      const updated = res.data?.user || res.user
      const idx = users.value.findIndex(u => u.id === id)
      if (idx !== -1 && updated) users.value[idx] = updated
      return updated
    } catch (err) {
      console.error('Update user error', err)
      throw err
    }
  }

  // Delete user
  const deleteUserApi = async (id: number) => {
    try {
      await $fetch(`/api/users/${id}`, { method: 'delete' })
      users.value = users.value.filter(u => u.id !== id)
    } catch (err) {
      console.error('Delete user error', err)
      throw err
    }
  }

  return {
    users,
    isLoading,
    apiError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser: deleteUserApi,
  }
}