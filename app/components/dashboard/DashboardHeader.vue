<template>
  <header class="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between items-center">
        <!-- Mobile menu button -->
        <div class="flex items-center lg:hidden">
          <button
            @click="$emit('toggleSidebar')"
            class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span class="sr-only">Open sidebar</span>
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>

        <!-- Page title (hidden on mobile) -->
        <div class="hidden lg:flex lg:items-center">
          <h1 class="text-2xl font-semibold text-gray-900">{{ pageTitle }}</h1>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="relative p-2">
                <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <!-- Notification badge -->
                <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ notificationCount > 9 ? '9+' : notificationCount }}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-80">
              <div class="px-4 py-3 border-b border-gray-200">
                <h3 class="text-sm font-medium text-gray-900">Notifikasi</h3>
              </div>
              <div class="max-h-64 overflow-y-auto">
                <div v-if="notifications.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
                  Tidak ada notifikasi baru
                </div>
                <div v-else>
                  <div 
                    v-for="notification in notifications" 
                    :key="notification.id"
                    class="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex items-start space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900">{{ notification.title }}</p>
                        <p class="text-sm text-gray-500">{{ notification.message }}</p>
                        <p class="text-xs text-gray-400 mt-1">{{ formatTime(notification.createdAt) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-3 border-t border-gray-200">
                <NuxtLink to="/dashboard/notifications" class="text-sm text-blue-600 hover:text-blue-500">
                  Lihat semua notifikasi
                </NuxtLink>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- User menu -->
          <DropdownMenu v-if="isAuthenticated && user">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="flex items-center space-x-3 p-2">
                <Avatar class="h-8 w-8">
                  <AvatarImage v-if="user.avatar" :src="user.avatar" :alt="user.name" />
                  <AvatarFallback>{{ getInitials(user.name) }}</AvatarFallback>
                </Avatar>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ getRoleLabel(user.role) }}</p>
                </div>
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <div class="px-4 py-3 border-b border-gray-200">
                <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-sm text-gray-500">{{ user.email }}</p>
              </div>
              
              <DropdownMenuItem as-child>
                <NuxtLink to="/dashboard/profile" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <svg class="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Profil Saya
                </NuxtLink>
              </DropdownMenuItem>
              
              <DropdownMenuItem as-child>
                <NuxtLink to="/dashboard/settings" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <svg class="mr-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  Pengaturan
                </NuxtLink>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem @click="handleLogout" class="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50">
                <svg class="mr-3 h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()

// Use authentication composable to get current user data
const { user, userRole, isAuthenticated, logout } = useAuth()

// TODO: Replace with actual notifications from API
const notifications = ref([
  {
    id: '1',
    title: 'Pembayaran Baru',
    message: 'Warga RT 01 telah melakukan pembayaran iuran bulanan',
    createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
  },
  {
    id: '2',
    title: 'Dokumen Baru',
    message: 'Surat keterangan domisili telah diupload',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
  }
])

const notificationCount = computed(() => notifications.value.length)

// Get page title based on current route
const pageTitle = computed(() => {
  const path = route.path
  
  if (path === '/dashboard') return 'Dashboard'
  if (path.startsWith('/dashboard/users')) return 'Manajemen Pengguna'
  if (path.startsWith('/dashboard/warga')) return 'Data Warga'
  if (path.startsWith('/dashboard/families')) return 'Data Keluarga'
  if (path.startsWith('/dashboard/transactions')) return 'Transaksi'
  if (path.startsWith('/dashboard/payments')) return 'Pembayaran'
  if (path.startsWith('/dashboard/announcements')) return 'Pengumuman'
  if (path.startsWith('/dashboard/documents')) return 'Dokumen'
  if (path.startsWith('/dashboard/reports')) return 'Laporan'
  if (path.startsWith('/dashboard/profile')) return 'Profil'
  if (path.startsWith('/dashboard/settings')) return 'Pengaturan'
  if (path.startsWith('/register')) return 'Registrasi Pengguna'
  
  return 'Dashboard'
})

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    'ADMIN': 'Administrator',
    'KETUA_RT': 'Ketua RT',
    'SEKRETARIS': 'Sekretaris',
    'BENDAHARA': 'Bendahara',
    'WARGA': 'Warga'
  }
  return roleLabels[role] || role
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes} menit yang lalu`
  } else if (hours < 24) {
    return `${hours} jam yang lalu`
  } else {
    return `${days} hari yang lalu`
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>