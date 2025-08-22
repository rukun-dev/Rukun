<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar overlay -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 lg:hidden"
      @click="sidebarOpen = false"
    >
      <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
    </div>

    <!-- Mobile sidebar -->
    <div 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <DashboardSidebar :is-mobile="true" @close="sidebarOpen = false" />
    </div>

    <!-- Desktop sidebar -->
    <div class="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:shadow-lg">
      <DashboardSidebar :is-mobile="false" />
    </div>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Header -->
      <DashboardHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <!-- Breadcrumb -->
      <DashboardBreadcrumb />
      
      <!-- Page content -->
      <main class="py-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import DashboardBreadcrumb from '@/components/dashboard/DashboardBreadcrumb.vue'

// Mobile sidebar state
const sidebarOpen = ref(false)

// Close sidebar on route change (mobile)
watch(() => useRoute().path, () => {
  sidebarOpen.value = false
})
</script>