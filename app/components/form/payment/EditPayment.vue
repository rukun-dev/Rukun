<template>
  <AddPayment
    v-model="modelValueInternal"
    :isSubmitting="isSubmitting"
    @save="onSave"
  />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import AddPayment from './AddPayment.vue'
import type { Payment } from '@/composables/usePayments'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  payment: {
    type: Object as () => Payment,
    required: true,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const modelValueInternal = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val),
})

const onSave = (payload: Payment) => {
  emit('save', payload)
}
</script>