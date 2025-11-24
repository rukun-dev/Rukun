<template>
  <AddTransaction
    v-bind="{ modelValue, isSubmitting, transaction }"
    @update:modelValue="$emit('update:modelValue', $event)"
    @save="$emit('save', $event)"
  />
</template>

<script setup lang="ts">
import AddTransaction from './AddTransaction.vue'
import type { Transaction } from '@/composables/useTransactions'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  transaction: {
    type: Object as () => Transaction | null,
    default: null,
  },
})

defineEmits(['update:modelValue', 'save'])
</script>