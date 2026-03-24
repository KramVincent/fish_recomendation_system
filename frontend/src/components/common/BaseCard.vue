<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="px-5 py-4 border-b border-surface-200 dark:border-surface-700">
      <slot name="header">
        <h3 class="text-lg font-semibold text-surface-900 dark:text-white">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="px-5 py-4">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="px-5 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Elevation = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  title?: string
  elevation?: Elevation
  padding?: boolean
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevation: 'md',
  padding: true,
  hover: false,
})

const baseClasses = 'bg-white dark:bg-surface-800 rounded-lg transition-all duration-200 border border-surface-100 dark:border-surface-700'

const elevationClasses: Record<Elevation, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-card',
  lg: 'shadow-lg',
}

const cardClasses = computed(() => {
  return [
    baseClasses,
    elevationClasses[props.elevation],
    props.hover ? 'hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800 cursor-pointer transform hover:-translate-y-1' : '',
  ].join(' ')
})
</script>
