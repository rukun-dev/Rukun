<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Table Header -->
    <div v-if="showHeader" class="bg-gray-50 px-6 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="animate-pulse">
          <div class="h-5 bg-gray-300 rounded w-32"></div>
        </div>
        <div v-if="showHeaderActions" class="flex space-x-2 animate-pulse">
          <div class="h-8 bg-gray-300 rounded w-20"></div>
          <div class="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <!-- Table Head -->
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="i in columns" 
              :key="i"
              class="px-6 py-3 text-left"
            >
              <div class="animate-pulse">
                <div 
                  class="h-4 bg-gray-300 rounded"
                  :class="getColumnWidth(i)"
                ></div>
              </div>
            </th>
            <th v-if="showActions" class="px-6 py-3 text-right">
              <div class="animate-pulse">
                <div class="h-4 bg-gray-300 rounded w-16 ml-auto"></div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="row in rows" 
            :key="row"
            class="hover:bg-gray-50"
          >
            <td 
              v-for="col in columns" 
              :key="col"
              class="px-6 py-4 whitespace-nowrap"
            >
              <div class="animate-pulse">
                <!-- Avatar column -->
                <div v-if="col === 1 && showAvatars" class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div class="space-y-1">
                    <div class="h-4 bg-gray-300 rounded w-24"></div>
                    <div class="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                
                <!-- Status column -->
                <div v-else-if="isStatusColumn(col)" class="flex items-center">
                  <div class="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                  <div class="h-4 bg-gray-300 rounded w-16"></div>
                </div>
                
                <!-- Number column -->
                <div v-else-if="isNumberColumn(col)">
                  <div class="h-4 bg-gray-300 rounded w-12"></div>
                </div>
                
                <!-- Date column -->
                <div v-else-if="isDateColumn(col)">
                  <div class="h-4 bg-gray-300 rounded w-20"></div>
                </div>
                
                <!-- Regular text column -->
                <div v-else>
                  <div 
                    class="h-4 bg-gray-300 rounded"
                    :class="getColumnContentWidth(col)"
                  ></div>
                </div>
              </div>
            </td>
            
            <!-- Actions column -->
            <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right">
              <div class="animate-pulse flex justify-end space-x-2">
                <div class="w-6 h-6 bg-gray-300 rounded"></div>
                <div class="w-6 h-6 bg-gray-300 rounded"></div>
                <div class="w-6 h-6 bg-gray-300 rounded"></div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div v-if="showFooter" class="bg-gray-50 px-6 py-3 border-t border-gray-200">
      <div class="flex items-center justify-between">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div class="animate-pulse flex space-x-2">
          <div class="h-8 bg-gray-300 rounded w-8"></div>
          <div class="h-8 bg-gray-300 rounded w-8"></div>
          <div class="h-8 bg-gray-300 rounded w-8"></div>
          <div class="h-8 bg-gray-300 rounded w-8"></div>
          <div class="h-8 bg-gray-300 rounded w-8"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  rows?: number
  columns?: number
  showHeader?: boolean
  showHeaderActions?: boolean
  showActions?: boolean
  showFooter?: boolean
  showAvatars?: boolean
  statusColumns?: number[]
  numberColumns?: number[]
  dateColumns?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 4,
  showHeader: true,
  showHeaderActions: true,
  showActions: true,
  showFooter: true,
  showAvatars: true,
  statusColumns: () => [3],
  numberColumns: () => [4],
  dateColumns: () => [5]
})

// Helper functions to determine column types
const isStatusColumn = (colIndex: number) => {
  return props.statusColumns.includes(colIndex)
}

const isNumberColumn = (colIndex: number) => {
  return props.numberColumns.includes(colIndex)
}

const isDateColumn = (colIndex: number) => {
  return props.dateColumns.includes(colIndex)
}

// Generate column header widths
const getColumnWidth = (colIndex: number) => {
  const widths = ['w-20', 'w-24', 'w-28', 'w-32', 'w-16']
  return widths[colIndex % widths.length]
}

// Generate column content widths
const getColumnContentWidth = (colIndex: number) => {
  if (colIndex === 1 && props.showAvatars) {
    return 'w-32' // Wider for name column
  }
  
  const widths = ['w-16', 'w-20', 'w-24', 'w-28', 'w-32', 'w-36']
  return widths[colIndex % widths.length]
}
</script>

<style scoped>
/* Staggered animation for table rows */
tbody tr {
  animation: fadeIn 0.5s ease-in-out;
  animation-fill-mode: both;
}

tbody tr:nth-child(1) { animation-delay: 0.1s; }
tbody tr:nth-child(2) { animation-delay: 0.2s; }
tbody tr:nth-child(3) { animation-delay: 0.3s; }
tbody tr:nth-child(4) { animation-delay: 0.4s; }
tbody tr:nth-child(5) { animation-delay: 0.5s; }

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse animation */
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
</style>