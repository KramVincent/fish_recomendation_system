<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'primary' | 'safe' | 'moderate' | 'avoid' | 'info' | 'neutral'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  variant?: Variant
  size?: Size
  rounded?: boolean
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'neutral',
  size: 'md',
  rounded: false,
  dot: false,
})

const baseClasses = 'inline-flex items-center font-medium'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
  safe: 'bg-safe-light text-safe-dark dark:bg-safe-dark/30 dark:text-safe',
  moderate: 'bg-moderate-light text-moderate-dark dark:bg-moderate-dark/30 dark:text-moderate',
  avoid: 'bg-avoid-light text-avoid-dark dark:bg-avoid-dark/30 dark:text-avoid',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  neutral: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-300',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

const badgeClasses = computed(() => {
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    props.rounded ? 'rounded-full' : 'rounded',
  ].join(' ')
})
</script>
