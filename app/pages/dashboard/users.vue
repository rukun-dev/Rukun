<template>
  <div class="min-h-screen bg-white">
    <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Kelola Pengguna</h1>
        <p class="text-gray-500 mt-1">Tambah, edit, dan kelola akun pengguna sistem</p>
      </div>
      <button
        @click="showCreate = true"
        class="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Tambah Pengguna
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Total Pengguna</p>
            <h3 class="text-3xl font-bold text-gray-900 mb-2">{{ totalUsers }}</h3>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Active Users -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Pengguna Aktif</p>
            <h3 class="text-3xl font-bold text-gray-900 mb-2">{{ activeUsers }}</h3>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Inactive Users -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Pengguna Nonaktif</p>
            <h3 class="text-3xl font-bold text-gray-900 mb-2">{{ inactiveUsers }}</h3>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Admin Users -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 mb-1">Peran Admin</p>
            <h3 class="text-3xl font-bold text-gray-900 mb-2">{{ adminUsers }}</h3>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm0 2c-2.671 0-8 1.336-8 4v3h16v-3c0-2.664-5.329-4-8-4z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
     <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
       <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
         <!-- Search Input -->
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Cari Pengguna</label>
           <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
               </svg>
             </div>
             <input
               v-model="search"
               type="text"
               placeholder="Cari nama atau email..."
               class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
             />
           </div>
         </div>
 
         <!-- Role Filter -->
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Peran</label>
           <select
             v-model="roleFilter"
             class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
           >
             <option value="">Semua Peran</option>
             <option value="SUPER_ADMIN">Super Admin</option>
             <option value="KETUA_RT">Ketua RT</option>
             <option value="SEKRETARIS">Sekretaris</option>
             <option value="BENDAHARA">Bendahara</option>
             <option value="STAFF">Staff</option>
             <option value="WARGA">Warga</option>
           </select>
         </div>
 
         <!-- Status Filter -->
         <div>
           <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
           <select
             v-model="statusFilter"
             class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white appearance-none"
           >
             <option value="">Semua Status</option>
             <option value="ACTIVE">Aktif</option>
             <option value="INACTIVE">Nonaktif</option>
           </select>
         </div>
       </div>
     </div>

    <!-- Users Table -->
    <div v-if="filteredUsers.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 11c2.761 0 5-2.239 5-5S14.761 1 12 1 7 3.239 7 6s2.239 5 5 5zm0 2c-2.671 0-8 1.336-8 4v3h16v-3c0-2.664-5.329-4-8-4z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-700">Belum ada pengguna</h3>
      <p class="text-gray-500 mt-2">Tambahkan pengguna baru untuk mulai mengelola akses sistem</p>
      <button
        @click="showCreate = true"
        class="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Tambah Pengguna Pertama
      </button>
    </div>

    <div v-else class="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getRoleLabel(user.role) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'inline-flex px-2 text-xs leading-5 font-semibold rounded-full',
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex space-x-2">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Edit"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  @click="askDelete(user)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  title="Hapus"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862A2 2 0 015.995 19.142L5 7m5 4v6m4-6v6m1-10V5a1 1 0 00-1-1h-4a1 1 0 00-1 1v2M4 7h16"
                    />
                  </svg>
                  <ConfirmDelete
                    v-model="showDelete"
                    title="Hapus Pengguna?"
                    message="Apakah Anda yakin ingin menghapus pengguna ini?"
                    :details="toDelete ? `${toDelete.name} • ${toDelete.email}` : ''"
                    @confirm="confirmDelete"
                    @cancel="showDelete = false"
                  />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
          </div>
    </div>
  </div>
  <UserCreate v-model="showCreate" @save="addUser" />
  <UserEdit v-model="showEdit" :user="selectedUser" @save="updateUser" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsers, type User } from '@/composables/useUsers'
import UserCreate from '@/components/form/user/UserCreate.vue'
import UserEdit from '@/components/form/user/UserEdit.vue'
import ConfirmDelete from '@/components/form/warga/ConfirmDelete.vue'

// State & composable
const {
  users,
  fetchUsers,
  createUser,
  updateUser: updateUserApi,
  deleteUser: deleteUserApi,
} = useUsers()

const { showLoading, hideLoading } = useGlobalLoading()

// Tampilkan loading secepat mungkin sebelum komponen dirender sepenuhnya
showLoading('Memuat data pengguna...', 'Mohon tunggu sebentar')

onMounted(async () => {
  await fetchUsers()
  hideLoading()
})

// Filters
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

// Computed: filtered list & stats
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchesSearch = `${u.name} ${u.email}`.toLowerCase().includes(search.value.toLowerCase())
    const matchesRole = roleFilter.value ? u.role === roleFilter.value : true
    const matchesStatus = statusFilter.value
      ? statusFilter.value === 'ACTIVE'
        ? u.isActive
        : !u.isActive
      : true
    return matchesSearch && matchesRole && matchesStatus
  })
})

const totalUsers = computed(() => filteredUsers.value.length)
const activeUsers = computed(() => filteredUsers.value.filter((u) => u.isActive).length)
const inactiveUsers = computed(() => filteredUsers.value.filter((u) => !u.isActive).length)
const adminUsers = computed(() => filteredUsers.value.filter((u) => u.role !== 'WARGA').length)

// Helper
const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    KETUA_RT: 'Ketua RT',
    SEKRETARIS: 'Sekretaris',
    BENDAHARA: 'Bendahara',
    STAFF: 'Staff',
    WARGA: 'Warga',
  }
  return roleLabels[role] || role
}

// Modal states
const showCreate = ref(false)
const showEdit = ref(false)
const selectedUser = ref<User | null>(null)

// Actions
const editUser = (user: User) => {
  selectedUser.value = { ...user }
  showEdit.value = true
}

const updateUser = async (updated: Partial<User>) => {
  if (!selectedUser.value) return
  try {
    await updateUserApi(selectedUser.value.id, updated)
    showEdit.value = false
  } catch (error) {
    console.error(error)
  }
}

// Delete with confirmation
const showDelete = ref(false)
const toDelete = ref<User | null>(null)

const askDelete = (user: User) => {
  toDelete.value = user
  showDelete.value = true
}

const confirmDelete = async () => {
  if (!toDelete.value) return
  try {
    await deleteUserApi(toDelete.value.id)
    showDelete.value = false
    toDelete.value = null
  } catch (error) {
    console.error(error)
  }
}

const addUser = async (newUser: Partial<User> & { password: string }) => {
  try {
    await createUser(newUser)
    showCreate.value = false
  } catch (error) {
    console.error(error)
  }
}

// Page metadata
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
</script>