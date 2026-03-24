<template>
  <nav class="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
    <router-link
      to="/"
      class="text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
    >
      Home
    </router-link>
    
    <template v-for="(item, index) in items" :key="index">
      <svg class="h-4 w-4 text-surface-400 dark:text-surface-500" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
      
      <router-link
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {{ item.label }}
      </router-link>
      <span v-else class="text-surface-900 dark:text-white font-medium">
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '@/api/types'

interface Props {
  items: BreadcrumbItem[]
}

defineProps<Props>()
</script>
