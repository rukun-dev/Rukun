<template>
  <div 
    class="flex items-center justify-center"
    :class="containerClass"
  >
    <!-- Spinner -->
    <div v-if="type === 'spinner'" class="relative">
      <div 
        class="animate-spin rounded-full border-solid border-t-transparent"
        :class="spinnerClass"
      ></div>
      <div 
        v-if="showInnerSpinner"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-solid border-t-transparent"
        :class="innerSpinnerClass"
      ></div>
    </div>

    <!-- Dots -->
    <div v-else-if="type === 'dots'" class="flex space-x-1">
      <div 
        v-for="i in 3" 
        :key="i"
        class="rounded-full animate-pulse"
        :class="dotClass"
        :style="{ animationDelay: `${(i - 1) * 0.2}s` }"
      ></div>
    </div>

    <!-- Bars -->
    <div v-else-if="type === 'bars'" class="flex items-end space-x-1">
      <div 
        v-for="i in 4" 
        :key="i"
        class="bg-current animate-pulse"
        :class="barClass"
        :style="{ 
          animationDelay: `${(i - 1) * 0.15}s`,
          height: `${Math.random() * 20 + 10}px`
        }"
      ></div>
    </div>

    <!-- Pulse -->
    <div v-else-if="type === 'pulse'" class="relative">
      <div 
        class="rounded-full animate-ping absolute"
        :class="pulseClass"
      ></div>
      <div 
        class="rounded-full"
        :class="pulseInnerClass"
      ></div>
    </div>

    <!-- Skeleton -->
    <div v-else-if="type === 'skeleton'" class="animate-pulse space-y-3 w-full">
      <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      <div class="h-4 bg-gray-300 rounded w-5/6"></div>
    </div>

    <!-- Progress -->
    <div v-else-if="type === 'progress'" class="w-full">
      <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          class="h-full bg-current rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
      <div v-if="showPercentage" class="text-center mt-2 text-sm text-gray-600">
        {{ Math.round(progress) }}%
      </div>
    </div>

    <!-- Text -->
    <div v-if="text && type !== 'skeleton'" class="ml-3">
      <p :class="textClass">{{ text }}</p>
      <p v-if="subtext" :class="subtextClass">{{ subtext }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'dots' | 'bars' | 'pulse' | 'skeleton' | 'progress'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'white'
  text?: string
  subtext?: string
  fullscreen?: boolean
  overlay?: boolean
  progress?: number
  showPercentage?: boolean
  showInnerSpinner?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: 'md',
  color: 'blue',
  text: '',
  subtext: '',
  fullscreen: false,
  overlay: false,
  progress: 0,
  showPercentage: false,
  showInnerSpinner: false
})

// Size mappings
const sizeMap = {
  xs: { spinner: 'w-4 h-4 border-2', dot: 'w-1 h-1', bar: 'w-1', text: 'text-xs' },
  sm: { spinner: 'w-6 h-6 border-2', dot: 'w-2 h-2', bar: 'w-1.5', text: 'text-sm' },
  md: { spinner: 'w-8 h-8 border-2', dot: 'w-3 h-3', bar: 'w-2', text: 'text-base' },
  lg: { spinner: 'w-12 h-12 border-4', dot: 'w-4 h-4', bar: 'w-3', text: 'text-lg' },
  xl: { spinner: 'w-16 h-16 border-4', dot: 'w-5 h-5', bar: 'w-4', text: 'text-xl' }
}

// Color mappings
const colorMap = {
  blue: 'text-blue-600 border-blue-600',
  green: 'text-green-600 border-green-600',
  red: 'text-red-600 border-red-600',
  yellow: 'text-yellow-600 border-yellow-600',
  purple: 'text-purple-600 border-purple-600',
  gray: 'text-gray-600 border-gray-600',
  white: 'text-white border-white'
}

// Computed classes
const containerClass = computed(() => {
  const classes = []
  
  if (props.fullscreen) {
    classes.push('fixed inset-0 z-50')
  }
  
  if (props.overlay) {
    classes.push('bg-black bg-opacity-50')
  }
  
  if (props.fullscreen || props.overlay) {
    classes.push('min-h-screen')
  }
  
  return classes.join(' ')
})

const spinnerClass = computed(() => {
  return [
    sizeMap[props.size].spinner,
    colorMap[props.color]
  ].join(' ')
})

const innerSpinnerClass = computed(() => {
  const size = props.size === 'xl' ? 'lg' : props.size === 'lg' ? 'md' : props.size === 'md' ? 'sm' : 'xs'
  return [
    sizeMap[size].spinner,
    colorMap[props.color],
    'animate-spin-reverse'
  ].join(' ')
})

const dotClass = computed(() => {
  return [
    sizeMap[props.size].dot,
    `bg-${props.color}-600`
  ].join(' ')
})

const barClass = computed(() => {
  return [
    sizeMap[props.size].bar,
    `text-${props.color}-600`
  ].join(' ')
})

const pulseClass = computed(() => {
  return [
    sizeMap[props.size].dot,
    `bg-${props.color}-400`
  ].join(' ')
})

const pulseInnerClass = computed(() => {
  return [
    sizeMap[props.size].dot,
    `bg-${props.color}-600`
  ].join(' ')
})

const textClass = computed(() => {
  return [
    sizeMap[props.size].text,
    `text-${props.color}-600`,
    'font-medium'
  ].join(' ')
})

const subtextClass = computed(() => {
  const textSize = props.size === 'xl' ? 'text-base' : props.size === 'lg' ? 'text-sm' : 'text-xs'
  return [
    textSize,
    'text-gray-500'
  ].join(' ')
})
</script>

<style scoped>
/* Custom animations */
@keyframes spin-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.animate-spin-reverse {
  animation: spin-reverse 1s linear infinite;
}

/* Staggered animation for dots */
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* Bars animation */
@keyframes bars {
  0%, 100% {
    height: 10px;
  }
  50% {
    height: 30px;
  }
}

.animate-bars {
  animation: bars 1.2s ease-in-out infinite;
}
</style>