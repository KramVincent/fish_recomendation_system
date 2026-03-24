<template>
  <div :class="['flex', fullscreen ? 'fixed inset-0 bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm z-50' : 'w-full', centerItems ? 'items-center justify-center' : '']">
    <div class="text-center">
      <!-- Animated Logo Loader -->
      <div v-if="variant === 'logo'" class="relative inline-block">
        <div class="relative w-20 h-20">
          <!-- Fish circle animation -->
          <svg class="animate-spin-slow w-20 h-20 text-primary-600 dark:text-primary-400" viewBox="0 0 100 100">
            <circle
              class="opacity-25"
              cx="50"
              cy="50"
              r="40"
              stroke="currentColor"
              stroke-width="8"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M50 10 A 40 40 0 0 1 90 50"
            />
          </svg>
          <!-- Fish icon in center -->
          <div class="absolute inset-0 flex items-center justify-center">
            <svg class="w-10 h-10 text-primary-600 dark:text-primary-400 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c-3.5 0-6.5 2-8 5-1.5-1-3-1.5-3-1.5s1 3 2 4c-1 1.5-1 3.5-1 5.5s0 4 1 5.5c-1 1-2 4-2 4s1.5-.5 3-1.5c1.5 3 4.5 5 8 5s6.5-2 8-5c1.5 1 3 1.5 3 1.5s-1-3-2-4c1-1.5 1-3.5 1-5.5s0-4-1-5.5c1-1 2-4 2-4s-1.5.5-3 1.5c-1.5-3-4.5-5-8-5z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <!-- Dots Loader -->
      <div v-else-if="variant === 'dots'" class="flex gap-2">
        <div
          v-for="i in 3"
          :key="i"
          :class="['w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400 animate-bounce']"
          :style="{ animationDelay: `${i * 0.15}s` }"
        />
      </div>
      
      <!-- Spinner Loader -->
      <div v-else-if="variant === 'spinner'" class="inline-block">
        <svg 
          :class="['animate-spin', sizeClasses]" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <!-- Pulse Loader -->
      <div v-else-if="variant === 'pulse'" class="relative">
        <div :class="['rounded-full bg-primary-600 dark:bg-primary-400 animate-ping absolute', sizeClasses]"></div>
        <div :class="['rounded-full bg-primary-600 dark:bg-primary-400 relative', sizeClasses]"></div>
      </div>
      
      <!-- Loading Text -->
      <p v-if="text" :class="['mt-4 font-medium', textSizeClasses]">
        {{ text }}
      </p>
      
      <!-- Subtext -->
      <p v-if="subtext" class="mt-2 text-sm text-surface-500 dark:text-surface-400">
        {{ subtext }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'logo' | 'spinner' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  subtext?: string
  fullscreen?: boolean
  centerItems?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'logo',
  size: 'md',
  fullscreen: false,
  centerItems: true
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }
  return sizes[props.size]
})

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm text-surface-600 dark:text-surface-400',
    md: 'text-base text-surface-700 dark:text-surface-300',
    lg: 'text-lg text-surface-900 dark:text-white'
  }
  return sizes[props.size]
})
</script>

<style scoped>
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
</style>
