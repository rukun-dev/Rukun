<script setup lang="ts">
// Redirect to main documents page
import { useRouter } from 'vue-router'

const router = useRouter()
router.push('/documents')
</script>

<template>
  <div>Redirecting to documents page...</div>
</template>