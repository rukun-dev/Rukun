<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold text-gray-900">Notifikasi</h2>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="loading"
          @click="fetchNotifications"
        >
          Muat ulang
        </Button>
        <Button
          variant="secondary"
          size="sm"
          :disabled="unreadCount === 0 || loading"
          @click="markAllAsRead"
        >
          Tandai semua dibaca
        </Button>
      </div>
    </div>

    <div v-if="loading" class="text-sm text-gray-500">Memuat notifikasi...</div>
    <div v-else-if="error" class="text-sm text-red-600">{{ error }}</div>

    <div v-else class="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div v-if="notifications.length === 0" class="px-4 py-10 text-center text-sm text-gray-500">
        Tidak ada notifikasi.
      </div>
      <ul v-else class="divide-y divide-gray-100">
        <li
          v-for="n in notifications"
          :key="n.id"
          class="px-4 py-3 hover:bg-gray-50 cursor-pointer"
          @click="openNotification(n.id)"
        >
          <div class="flex items-start gap-3">
            <div class="mt-2">
              <span v-if="!n.isRead" class="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-gray-900">{{ n.title }}</p>
                <span class="text-[11px] px-2 py-0.5 rounded-full border"
                  :class="badgeClass(n.priority)">{{ n.priority }}</span>
                <span class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{{ n.type }}</span>
              </div>
              <p class="text-sm text-gray-600">{{ n.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatTime(new Date(n.createdAt)) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/composables/useNotifications'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const { notifications, loading, error, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications()

onMounted(() => {
  fetchNotifications()
})

const router = useRouter()
const openNotification = (id: string) => {
  markAsRead(id)
  router.push(`/announcements/${id}`)
}

const badgeClass = (priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT') => {
  switch (priority) {
    case 'URGENT': return 'border-red-300 bg-red-50 text-red-700'
    case 'HIGH': return 'border-orange-300 bg-orange-50 text-orange-700'
    case 'NORMAL': return 'border-blue-300 bg-blue-50 text-blue-700'
    default: return 'border-gray-300 bg-gray-50 text-gray-700'
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
}
</script>

<style scoped>
</style>