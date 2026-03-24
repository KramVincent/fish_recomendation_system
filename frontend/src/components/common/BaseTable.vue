<template>
  <div class="w-full overflow-x-auto">
    <table class="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
      <thead class="bg-surface-50 dark:bg-surface-900">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :class="[
              'px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider',
              column.sortable ? 'cursor-pointer hover:text-surface-700 dark:hover:text-surface-200 select-none' : '',
            ]"
            @click="column.sortable ? onSort(column.key) : null"
          >
            <div class="flex items-center gap-2">
              {{ column.label }}
              <template v-if="column.sortable">
                <svg v-if="sortKey === column.key && sortOrder === 'asc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.879a1 1 0 111.414 1.414l-4 4.667a1 1 0 01-1.414 0l-4-4.667a1 1 0 010-1.414z"/>
                </svg>
                <svg v-else-if="sortKey === column.key && sortOrder === 'desc'" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M14.707 12.293a1 1 0 01-1.414 0L10 8.414l-3.293 3.879a1 1 0 01-1.414-1.414l4-4.667a1 1 0 011.414 0l4 4.667a1 1 0 010 1.414z"/>
                </svg>
                <svg v-else class="w-4 h-4 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.293 7.707a1 1 0 011.414 0L10 11.586l3.293-3.879a1 1 0 111.414 1.414l-4 4.667a1 1 0 01-1.414 0l-4-4.667a1 1 0 010-1.414z"/>
                </svg>
              </template>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
        <slot />
      </tbody>
    </table>
    
    <div v-if="!$slots.default" class="text-center py-12 text-surface-500 dark:text-surface-400">
      No data available
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumn } from '@/api/types'

interface Props {
  columns: TableColumn[]
}

defineProps<Props>()

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc']
}>()

const sortKey = ref<string | null>(null)
const sortOrder = ref<'asc' | 'desc'>('asc')

function onSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
  emit('sort', key, sortOrder.value)
}
</script>
