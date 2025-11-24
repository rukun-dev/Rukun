import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

export type NotificationItem = {
  id: string // use announcement id as stable identifier
  recipientId?: string // announcement recipient row id, if available
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'URGENT' | 'EVENT'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  createdAt: string
  isRead: boolean
}

export const useNotifications = () => {
  const { user } = useAuth()
  const { success, error: toastError } = useToast()

  const notifications = ref<NotificationItem[]>([])
  const loading = ref(false)
  const err = ref<string | null>(null)

  const storageKey = computed(() => {
    const uid = user.value?.id || 'anonymous'
    return `notifications_seen_${uid}`
  })

  const loadSeen = (): Set<string> => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const raw = localStorage.getItem(storageKey.value)
      const arr: string[] = raw ? JSON.parse(raw) : []
      return new Set(arr)
    } catch {
      return new Set<string>()
    }
  }

  const saveSeen = (ids: Set<string>) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(storageKey.value, JSON.stringify(Array.from(ids)))
    } catch {/* ignore */}
  }

  const fetchNotifications = async () => {
    loading.value = true
    err.value = null
    try {
      const res = await $fetch<{
        success: boolean
        data: { announcements: Array<any> }
        message: string
      }>(`/api/announcements`, {
        method: 'GET',
        query: { forMe: true, isPublished: true, limit: 20 },
        credentials: 'include'
      })

      const seen = loadSeen()
      const items: NotificationItem[] = (res.data?.announcements || []).map((a: any) => {
        const recipientRow = Array.isArray(a.recipients) ? a.recipients.find((r: any) => r.recipientType === 'SPECIFIC' || r.recipientId === user.value?.role) || a.recipients[0] : undefined
        const id = a.id as string
        const createdAt = (a.publishedAt || a.createdAt) as string
        return {
          id,
          recipientId: recipientRow?.id,
          title: a.title,
          message: a.content,
          type: a.type,
          priority: a.priority,
          createdAt,
          isRead: seen.has(id)
        }
      })
      notifications.value = items
    } catch (e: any) {
      err.value = e?.data?.message || e?.message || 'Gagal memuat notifikasi'
      toastError(err.value || 'Gagal memuat notifikasi')
    } finally {
      loading.value = false
    }
  }

  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

  const markAsRead = (id: string) => {
    const seen = loadSeen()
    seen.add(id)
    saveSeen(seen)
    notifications.value = notifications.value.map(n => n.id === id ? { ...n, isRead: true } : n)
  }

  const markAllAsRead = () => {
    const seen = loadSeen()
    notifications.value.forEach(n => seen.add(n.id))
    saveSeen(seen)
    notifications.value = notifications.value.map(n => ({ ...n, isRead: true }))
    success('Semua notifikasi telah ditandai dibaca')
  }

  return {
    notifications,
    loading,
    error: err,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}