<template>
  <div class="flex h-full flex-col">
    <!-- Logo and close button -->
    <div class="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-bold text-gray-900">RT Management</h1>
        </div>
      </div>
      
      <!-- Close button for mobile -->
      <button 
        v-if="isMobile" 
        @click="$emit('close')"
        class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
      <!-- Dashboard -->
      <NuxtLink
        to="/dashboard"
        class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
        :class="isActiveRoute('/dashboard') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
        </svg>
        Dashboard
      </NuxtLink>

      <!-- User Management (Admin/Ketua RT only) -->
      <div v-if="canAccessUserManagement">
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Manajemen Pengguna</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/users"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/users') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/users') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
          </svg>
          Kelola Pengguna
        </NuxtLink>
        
        <NuxtLink
          to="/register"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/register') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/register') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
          </svg>
          Tambah Pengguna
        </NuxtLink>
      </div>

      <!-- Data Warga -->
      <div>
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data Warga</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/warga"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/warga') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/warga') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          Data Warga
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/families"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/families') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/families') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Data Keluarga
        </NuxtLink>
      </div>

      <!-- Keuangan (Admin/Bendahara only) -->
      <div v-if="canAccessFinance">
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Keuangan</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/transactions"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/transactions') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/transactions') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Transaksi
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/payments"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/payments') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/payments') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
          </svg>
          Pembayaran
        </NuxtLink>
      </div>

      <!-- Komunikasi -->
      <div>
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Komunikasi</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/announcements"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/announcements') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/announcements') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
          </svg>
          Pengumuman
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/documents"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/documents') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/documents') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Dokumen
        </NuxtLink>
      </div>

      <!-- Laporan (Admin/Ketua RT/Sekretaris only) -->
      <div v-if="canAccessReports">
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Laporan</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/reports"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/reports') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/reports') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          Laporan
        </NuxtLink>
      </div>

      <!-- Settings -->
      <div>
        <div class="mt-6 mb-2">
          <h3 class="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengaturan</h3>
        </div>
        
        <NuxtLink
          to="/dashboard/profile"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/profile') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/profile') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          Profil
        </NuxtLink>
        
        <NuxtLink
          to="/dashboard/settings"
          class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
          :class="isActiveRoute('/dashboard/settings') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
        >
          <svg class="mr-3 h-5 w-5" :class="isActiveRoute('/dashboard/settings') ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Pengaturan
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isMobile: boolean
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

const route = useRoute()

// TODO: Replace with actual user role from authentication
const userRole = ref('ADMIN') // Placeholder

// Role-based access control
const canAccessUserManagement = computed(() => {
  return ['ADMIN', 'KETUA_RT'].includes(userRole.value)
})

const canAccessFinance = computed(() => {
  return ['ADMIN', 'BENDAHARA'].includes(userRole.value)
})

const canAccessReports = computed(() => {
  return ['ADMIN', 'KETUA_RT', 'SEKRETARIS'].includes(userRole.value)
})

// Check if route is ace
const isActiveRoute = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(path)
}
</script>