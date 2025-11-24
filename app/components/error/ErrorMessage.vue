<template>
  <div 
    v-if="message" 
    class="error-message"
    :class="[
      sizeClasses,
      variantClasses,
      { 'with-icon': showIcon }
    ]"
  >
    <div v-if="showIcon" class="error-icon">
      <svg v-if="variant === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <svg v-else-if="variant === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <svg v-else-if="variant === 'info'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </div>
    <div class="error-content">
      <p class="error-text">{{ message }}</p>
      <p v-if="details" class="error-details">{{ details }}</p>
      <div v-if="$slots.actions" class="error-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <button 
      v-if="dismissible" 
      @click="dismiss"
      class="error-dismiss"
      aria-label="Dismiss"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  message?: string
  details?: string
  variant?: 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  dismissible?: boolean
  autoDismiss?: boolean
  autoDismissTimeout?: number
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  details: '',
  variant: 'error',
  size: 'md',
  showIcon: true,
  dismissible: false,
  autoDismiss: false,
  autoDismissTimeout: 5000
})

const emit = defineEmits(['dismiss'])

// Computed classes
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xs py-1 px-2'
    case 'lg':
      return 'text-base py-3 px-4'
    default:
      return 'text-sm py-2 px-3'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200'
    case 'info':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    default:
      return 'bg-red-50 text-red-800 border-red-200'
  }
})

// Auto dismiss functionality
if (props.autoDismiss && props.message) {
  setTimeout(() => {
    dismiss()
  }, props.autoDismissTimeout)
}

// Methods
function dismiss() {
  emit('dismiss')
}
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: flex-start;
  border-radius: 0.375rem;
  border-width: 1px;
  margin-bottom: 0.75rem;
  animation: fadeIn 0.3s ease-out;
}

.with-icon {
  padding-left: 0.5rem;
}

.error-icon {
  flex-shrink: 0;
  margin-top: 0.25rem;
  margin-right: 0.5rem;
}

.error-icon svg {
  width: 1rem;
  height: 1rem;
}

.error-content {
  flex: 1;
}

.error-text {
  font-weight: 500;
  line-height: 1.5;
}

.error-details {
  margin-top: 0.25rem;
  opacity: 0.8;
  font-size: 0.875em;
}

.error-actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.error-dismiss {
  flex-shrink: 0;
  background: transparent;
  border: none;
  color: currentColor;
  opacity: 0.5;
  cursor: pointer;
  padding: 0.25rem;
  margin: -0.25rem;
  border-radius: 0.25rem;
}

.error-dismiss:hover {
  opacity: 0.75;
}

.error-dismiss svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Size-specific styles */
.text-xs .error-icon svg {
  width: 0.875rem;
  height: 0.875rem;
}

.text-base .error-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Variant-specific styles */
.bg-red-50 .error-icon {
  color: #dc2626;
}

.bg-yellow-50 .error-icon {
  color: #d97706;
}

.bg-blue-50 .error-icon {
  color: #2563eb;
}
</style>