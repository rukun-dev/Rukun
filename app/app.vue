<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  
  <!-- Global Loading -->
  <GlobalLoading 
    :show="isLoading" 
    :title="loadingTitle" 
    :message="loadingMessage" 
  />
</template>

<script setup>
const { isLoading, loadingTitle, loadingMessage } = useGlobalLoading()
</script>
