<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Selamat Datang, {{ user?.name || 'User' }}!</h1>
          <p class="text-blue-100 mt-1">{{ user?.role ? getRoleLabel(user.role) : 'User' }} - RT Management System</p>
        </div>
        <div class="hidden md:block">
          <svg class="h-16 w-16 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Warga</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalWarga }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Keluarga</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalFamilies }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Iuran Bulan Ini</p>
              <p class="text-2xl font-semibold text-gray-900">Rp {{ formatCurrency(stats.monthlyPayments) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Pengumuman Aktif</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.activeAnnouncements }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activities -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Payments -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>Pembayaran Terbaru</span>
            <NuxtLink to="/dashboard/payments" class="text-sm text-blue-600 hover:text-blue-500">
              Lihat Semua
            </NuxtLink>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="recentPayments.length === 0" class="text-center py-6 text-gray-500">
              Belum ada pembayaran terbaru
            </div>
            <div v-else>
              <div 
                v-for="payment in recentPayments" 
                :key="payment.id"
                class="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-center space-x-3">
                  <Avatar class="h-8 w-8">
                    <AvatarFallback>{{ getInitials(payment.wargaName) }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ payment.wargaName }}</p>
                    <p class="text-xs text-gray-500">{{ payment.type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">Rp {{ formatCurrency(payment.amount) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(payment.date) }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Announcements -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            <span>Pengumuman Terbaru</span>
            <NuxtLink to="/dashboard/announcements" class="text-sm text-blue-600 hover:text-blue-500">
              Lihat Semua
            </NuxtLink>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="recentAnnouncements.length === 0" class="text-center py-6 text-gray-500">
              Belum ada pengumuman terbaru
            </div>
            <div v-else>
              <div 
                v-for="announcement in recentAnnouncements" 
                :key="announcement.id"
                class="py-3 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="text-sm font-medium text-gray-900">{{ announcement.title }}</h4>
                    <p class="text-xs text-gray-500 mt-1">{{ announcement.excerpt }}</p>
                    <div class="flex items-center mt-2 space-x-2">
                      <Badge :variant="announcement.priority === 'HIGH' ? 'destructive' : announcement.priority === 'MEDIUM' ? 'default' : 'secondary'" class="text-xs">
                        {{ getPriorityLabel(announcement.priority) }}
                      </Badge>
                      <span class="text-xs text-gray-400">{{ formatDate(announcement.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <Button as-child variant="outline" class="h-20 flex-col space-y-2">
            <NuxtLink to="/dashboard/profile">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-xs">Profil Saya</span>
            </NuxtLink>
          </Button>
          
          <Button v-if="canAccessUserManagement" as-child variant="outline" class="h-20 flex-col space-y-2">
            <NuxtLink to="/register">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
              <span class="text-xs">Tambah Pengguna</span>
            </NuxtLink>
          </Button>
          
          <Button as-child variant="outline" class="h-20 flex-col space-y-2">
            <NuxtLink to="/dashboard/warga/create">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              <span class="text-xs">Tambah Warga</span>
            </NuxtLink>
          </Button>
          
          <Button as-child variant="outline" class="h-20 flex-col space-y-2">
            <NuxtLink to="/dashboard/announcements/create">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
              </svg>
              <span class="text-xs">Buat Pengumuman</span>
            </NuxtLink>
          </Button>
          
          <Button v-if="canAccessReports" as-child variant="outline" class="h-20 flex-col space-y-2">
            <NuxtLink to="/dashboard/reports">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <span class="text-xs">Lihat Laporan</span>
            </NuxtLink>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// Meta
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard - RT Management System',
  description: 'Dashboard sistem manajemen RT digital'
})

// Menggunakan composable useAuth untuk mendapatkan data user yang sedang login
const { user, isAuthenticated, fetchUser } = useAuth()

// Mengambil data user saat komponen dimount
onMounted(async () => {
  if (!isAuthenticated.value) {
    await fetchUser()
  }
})

// TODO: Replace with actual data from API
const stats = ref({
  totalWarga: 156,
  totalFamilies: 45,
  monthlyPayments: 7800000,
  activeAnnouncements: 3
})

const recentPayments = ref([
  {
    id: '1',
    wargaName: 'Budi Santoso',
    type: 'Iuran Bulanan',
    amount: 50000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: '2',
    wargaName: 'Siti Aminah',
    type: 'Iuran Keamanan',
    amount: 25000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: '3',
    wargaName: 'Ahmad Wijaya',
    type: 'Iuran Kebersihan',
    amount: 30000,
    date: new Date(Date.now() - 1000 * 60 * 60 * 12)
  }
])

const recentAnnouncements = ref([
  {
    id: '1',
    title: 'Gotong Royong Minggu Depan',
    excerpt: 'Kegiatan gotong royong akan dilaksanakan pada hari Minggu...',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4)
  },
  {
    id: '2',
    title: 'Pembayaran Iuran Bulan Ini',
    excerpt: 'Reminder untuk pembayaran iuran bulan ini...',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  }
])

// Role-based access control dari useAuth
const { canAccessUserManagement, canAccessReports } = useAuth()

// Helper functions
const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    'SUPER_ADMIN': 'Super Administrator',
    'KETUA_RT': 'Ketua RT',
    'SEKRETARIS': 'Sekretaris',
    'BENDAHARA': 'Bendahara',
    'STAFF': 'Staff',
    'WARGA': 'Warga'
  }
  return roleLabels[role] || role
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'HIGH': 'Penting',
    'MEDIUM': 'Sedang',
    'LOW': 'Rendah'
  }
  return labels[priority] || priority
}
</script>