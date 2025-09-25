<template>
  <div class="bg-white border-b border-gray-200">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink as-child>
                <NuxtLink to="/dashboard" class="text-gray-500 hover:text-gray-700">
                  <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"></path>
                  </svg>
                  Dashboard
                </NuxtLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            <template v-for="(crumb, index) in breadcrumbs" :key="index">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink v-if="crumb.href" as-child>
                  <NuxtLink :to="crumb.href" class="text-gray-500 hover:text-gray-700">
                    {{ crumb.label }}
                  </NuxtLink>
                </BreadcrumbLink>
                <BreadcrumbPage v-else class="text-gray-900 font-medium">
                  {{ crumb.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface BreadcrumbItem {
  label: string
  href?: string
}

const route = useRoute()

// Generate breadcrumbs based on current route
const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const path = route.path
  const segments = path.split('/').filter(Boolean)
  
  // Remove 'dashboard' from segments since it's already in the root
  const pathSegments = segments.slice(1)
  
  if (pathSegments.length === 0) {
    return []
  }
  
  const crumbs: BreadcrumbItem[] = []
  let currentPath = '/dashboard'
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === pathSegments.length - 1
    
    // Handle dynamic routes
    if (segment.startsWith('[') && segment.endsWith(']')) {
      // For dynamic routes, use the actual parameter value
      const paramName = segment.slice(1, -1)
      const paramValue = route.params[paramName] as string
      
      crumbs.push({
        label: getSegmentLabel(paramValue || segment),
        href: isLast ? undefined : currentPath
      })
    } else {
      crumbs.push({
        label: getSegmentLabel(segment),
        href: isLast ? undefined : currentPath
      })
    }
  })
  
  return crumbs
})

// Convert path segment to readable label
const getSegmentLabel = (segment: string): string => {
  const labels: Record<string, string> = {
    // User Management
    'users': 'Pengguna',
    'register': 'Registrasi',
    
    // Data Warga
    'warga': 'Data Warga',
    'families': 'Data Keluarga',
    
    // Finance
    'transactions': 'Transaksi',
    'payments': 'Pembayaran',
    
    // Communication
    'announcements': 'Pengumuman',
    'documents': 'Dokumen',
    'notifications': 'Notifikasi',
    
    // Reports
    'reports': 'Laporan',
    
    // Settings
    'profile': 'Profil',
    'settings': 'Pengaturan',
    
    // Actions
    'create': 'Tambah',
    'edit': 'Edit',
    'view': 'Detail',
    'new': 'Baru',
    
    // Reset password
    'reset-password': 'Reset Password'
  }
  
  // If it's a known segment, return the label
  if (labels[segment]) {
    return labels[segment]
  }
  
  // If it looks like an ID (all numbers or alphanumeric), return "Detail"
  if (/^[a-zA-Z0-9]+$/.test(segment) && segment.length > 5) {
    return 'Detail'
  }
  
  // Otherwise, capitalize the first letter and replace hyphens with spaces
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>