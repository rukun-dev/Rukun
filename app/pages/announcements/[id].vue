<template>
  <div class="mx-auto max-w-3xl px-4 py-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-gray-900">Pengumuman</h1>
      <div class="flex items-center gap-2">
        <NuxtLink to="/announcements" class="text-sm text-blue-600 hover:text-blue-500">Kembali ke daftar</NuxtLink>
      </div>
    </div>

    <div v-if="pending" class="text-sm text-gray-500">Memuat pengumuman…</div>
    <div v-else-if="error" class="text-sm text-red-600">{{ errorMessage }}</div>
    <div v-else-if="!announcement" class="text-sm text-gray-500">Pengumuman tidak ditemukan.</div>
    <div v-else class="bg-white shadow-sm border border-gray-200 rounded-md overflow-hidden">
      <div class="px-4 py-4 border-b border-gray-100">
        <h2 class="text-xl font-semibold text-gray-900">{{ announcement.title }}</h2>
        <div class="mt-2 flex items-center gap-2 text-xs text-gray-600">
          <span class="px-2 py-0.5 rounded-full border" :class="priorityBadgeClass(announcement.priority)">{{ announcement.priority }}</span>
          <span class="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{{ announcement.type }}</span>
          <span class="text-gray-400">Dipublikasikan {{ formatTime(new Date(announcement.createdAt)) }}</span>
        </div>
      </div>
      <div class="px-4 py-6 prose prose-sm max-w-none">
        <div v-if="isHtml(announcement.content)" v-html="announcement.content"></div>
        <p v-else class="whitespace-pre-line text-gray-800">{{ announcement.content }}</p>
      </div>
      <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div class="text-xs text-gray-500">Dibuat oleh: {{ announcement.createdBy?.name }} ({{ getRoleLabel(announcement.createdBy?.role) }})</div>
        <Button size="sm" variant="secondary" @click="markReadAndBack">Tandai dibaca</Button>
      </div>
    </div>
  </div>
  
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Announcement } from '~/types/announcement'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/composables/useNotifications'

definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

const { data, pending, error } = await useAsyncData(`announcement:${id}` , async () => {
  const resp = await $fetch<any>(`/api/announcements/${id}`, { credentials: 'include' })
  return resp?.data ?? resp
})

const announcement = computed(() => (data.value ?? null) as Announcement | null)
const errorMessage = computed(() => {
  const e = error.value as any
  return e?.data?.message || e?.message || 'Gagal memuat pengumuman'
})

const { markAsRead } = useNotifications()

const markReadAndBack = () => {
  if (id) markAsRead(id)
  router.push('/announcements')
}

const priorityBadgeClass = (priority: Announcement['priority']) => {
  switch (priority) {
    case 'URGENT': return 'border-red-300 bg-red-50 text-red-700'
    case 'HIGH': return 'border-orange-300 bg-orange-50 text-orange-700'
    case 'NORMAL': return 'border-blue-300 bg-blue-50 text-blue-700'
    default: return 'border-gray-300 bg-gray-50 text-gray-700'
  }
}

const getRoleLabel = (role?: string) => {
  switch (role) {
    case 'SUPER_ADMIN': return 'Super Admin'
    case 'KETUA_RT': return 'Ketua RT'
    case 'SEKRETARIS': return 'Sekretaris'
    case 'BENDAHARA': return 'Bendahara'
    case 'STAFF': return 'Staf'
    case 'WARGA': return 'Warga'
    default: return role || 'N/A'
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

const isHtml = (content: string) => /<\w+[^>]*>/.test(content)
</script>

<style scoped>
</style>