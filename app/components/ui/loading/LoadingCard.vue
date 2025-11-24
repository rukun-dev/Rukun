<template>
  <div 
    class="animate-pulse bg-white rounded-lg shadow-md overflow-hidden"
    :class="containerClass"
  >
    <!-- Header with avatar and title -->
    <div v-if="showHeader" class="p-4 border-b border-gray-200">
      <div class="flex items-center space-x-3">
        <div 
          class="rounded-full bg-gray-300"
          :class="avatarSize"
        ></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Image placeholder -->
    <div v-if="showImage" class="bg-gray-300" :class="imageHeight"></div>

    <!-- Content area -->
    <div class="p-4 space-y-3">
      <!-- Title lines -->
      <div v-if="showTitle" class="space-y-2">
        <div class="h-5 bg-gray-300 rounded w-4/5"></div>
        <div v-if="titleLines > 1" class="h-5 bg-gray-300 rounded w-3/5"></div>
      </div>

      <!-- Content lines -->
      <div v-if="showContent" class="space-y-2">
        <div 
          v-for="i in contentLines" 
          :key="i"
          class="h-4 bg-gray-300 rounded"
          :class="getContentLineWidth(i)"
        ></div>
      </div>

      <!-- Stats/metrics -->
      <div v-if="showStats" class="flex space-x-4 pt-2">
        <div 
          v-for="i in statsCount" 
          :key="i"
          class="flex-1 space-y-1"
        >
          <div class="h-6 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      <!-- Action buttons -->
      <div v-if="showActions" class="flex space-x-2 pt-4">
        <div 
          v-for="i in actionCount" 
          :key="i"
          class="h-8 bg-gray-300 rounded"
          :class="i === 1 ? 'w-20' : 'w-16'"
        ></div>
      </div>
    </div>

    <!-- Footer -->
    <div v-if="showFooter" class="px-4 py-3 bg-gray-50 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="h-3 bg-gray-300 rounded w-1/4"></div>
        <div class="h-3 bg-gray-300 rounded w-1/6"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'card' | 'list' | 'profile' | 'post' | 'product'
  size?: 'sm' | 'md' | 'lg'
  showHeader?: boolean
  showImage?: boolean
  showTitle?: boolean
  showContent?: boolean
  showStats?: boolean
  showActions?: boolean
  showFooter?: boolean
  titleLines?: number
  contentLines?: number
  statsCount?: number
  actionCount?: number
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'card',
  size: 'md',
  showHeader: false,
  showImage: false,
  showTitle: true,
  showContent: true,
  showStats: false,
  showActions: false,
  showFooter: false,
  titleLines: 1,
  contentLines: 3,
  statsCount: 3,
  actionCount: 2,
  width: '',
  height: ''
})

// Computed classes based on variant and size
const containerClass = computed(() => {
  const classes = []
  
  // Size classes
  if (props.size === 'sm') {
    classes.push('max-w-sm')
  } else if (props.size === 'lg') {
    classes.push('max-w-lg')
  } else {
    classes.push('max-w-md')
  }
  
  // Custom width/height
  if (props.width) {
    classes.push(props.width)
  }
  if (props.height) {
    classes.push(props.height)
  }
  
  // Variant-specific classes
  switch (props.variant) {
    case 'list':
      classes.push('flex items-center p-4 space-x-4')
      break
    case 'profile':
      classes.push('text-center')
      break
    case 'post':
      classes.push('border border-gray-200')
      break
    case 'product':
      classes.push('hover:shadow-lg transition-shadow')
      break
  }
  
  return classes.join(' ')
})

const avatarSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8'
    case 'lg':
      return 'w-16 h-16'
    default:
      return 'w-12 h-12'
  }
})

const imageHeight = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-32'
    case 'lg':
      return 'h-64'
    default:
      return 'h-48'
  }
})

// Generate random widths for content lines
const getContentLineWidth = (lineNumber: number) => {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-3/5', 'w-1/2']
  
  // Last line is usually shorter
  if (lineNumber === props.contentLines) {
    return widths[Math.floor(Math.random() * 3) + 4] // w-2/3, w-3/5, w-1/2
  }
  
  return widths[Math.floor(Math.random() * 4)] // w-full to w-3/4
}
</script>

<style scoped>
/* Pulse animation with staggered timing */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Shimmer effect */
.shimmer {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>