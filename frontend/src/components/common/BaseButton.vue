<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2">
      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-95'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg focus:ring-primary-500 dark:bg-primary-600 dark:hover:bg-primary-700',
  secondary: 'bg-surface-200 text-surface-800 hover:bg-surface-300 hover:shadow-md focus:ring-surface-400 dark:bg-surface-700 dark:text-surface-100 dark:hover:bg-surface-600',
  success: 'bg-safe text-white hover:bg-safe-dark hover:shadow-lg focus:ring-safe',
  warning: 'bg-moderate text-white hover:bg-moderate-dark hover:shadow-lg focus:ring-moderate',
  danger: 'bg-avoid text-white hover:bg-avoid-dark hover:shadow-lg focus:ring-avoid',
  ghost: 'bg-transparent text-surface-700 hover:bg-surface-100 focus:ring-surface-300 dark:text-surface-300 dark:hover:bg-surface-800',
}

const sizeClasses: Record<Size, string> = {
  xs: 'px-2.5 py-1.5 text-xs rounded',
  sm: 'px-3 py-2 text-sm rounded-md',
  md: 'px-4 py-2.5 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

const buttonClasses = computed(() => {
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.fullWidth ? 'w-full' : '',
  ].join(' ')
})
</script>
