<template>
  <div 
    class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
    :class="{
      'border-amber-200 bg-amber-50': announcement.type === 'WARNING',
      'border-red-200 bg-red-50': announcement.type === 'URGENT',
      'border-green-200 bg-green-50': announcement.type === 'EVENT'
    }"
  >
    <!-- Header with Type Badge and Title -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
      <div class="flex-1">
        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2"
          :class="getBadgeClass(announcement.type)">
          {{ getTypeLabel(announcement.type) }}
        </div>
        <h3 class="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {{ announcement.title }}
        </h3>
        <p class="text-sm text-gray-600 line-clamp-3">
          {{ announcement.content }}
        </p>
      </div>
      <div class="text-right whitespace-nowrap">
        <span class="text-xs text-gray-500">Dibuat pada</span>
        <div class="text-sm font-medium text-gray-700">
          {{ formatDate(announcement.createdAt) }}
        </div>
      </div>
    </div>

    <!-- Footer with Creator and Actions -->
    <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <div 
          class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs"
        >
          {{ announcement.createdBy.name.charAt(0).toUpperCase() }}
        </div>
        <div>
          <div class="text-sm font-medium text-gray-700">{{ announcement.createdBy.name }}</div>
          <div class="text-xs text-gray-500">{{ announcement.createdBy.role }}</div>
        </div>
      </div>

      <!-- Action Buttons (Only visible to admin/editors) -->
      <div v-if="canEdit" class="flex items-center gap-2">
        <button 
          @click="handleEdit"
          class="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button 
          @click="handleDelete"
          class="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Announcement } from '../../../app/composables/useAnnouncements';

// Props
const props = defineProps<{
  announcement: Announcement;
  canEdit?: boolean;
}>();

// Emits
const emit = defineEmits<{
  edit: [announcement: Announcement];
  delete: [announcementId: string];
}>();

// Methods
const handleEdit = () => {
  emit('edit', props.announcement);
};

const handleDelete = () => {
  emit('delete', props.announcement.id);
};

// Helper functions
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'INFO': 'Informasi',
    'WARNING': 'Peringatan',
    'URGENT': 'Darurat',
    'EVENT': 'Acara'
  };
  return labels[type] || type;
};

const getBadgeClass = (type: string): string => {
  const classes: Record<string, string> = {
    'INFO': 'bg-blue-100 text-blue-800',
    'WARNING': 'bg-amber-100 text-amber-800',
    'URGENT': 'bg-red-100 text-red-800',
    'EVENT': 'bg-green-100 text-green-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('id-ID', options);
};
</script>