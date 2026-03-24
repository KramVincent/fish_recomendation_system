<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="onBackdropClick">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="onBackdropClick"></div>
          
          <div
            :class="modalClasses"
            class="relative z-10 w-full bg-white dark:bg-surface-800 rounded-lg shadow-modal transform transition-all"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
              <h3 class="text-lg font-semibold text-surface-900 dark:text-white">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button
                v-if="closable"
                type="button"
                class="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 transition-colors"
                @click="close"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="px-6 py-4">
              <slot />
            </div>
            
            <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface Props {
  show: boolean
  title?: string
  size?: Size
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
  'update:show': [value: boolean]
}>()

const sizeClasses: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
}

const modalClasses = computed(() => sizeClasses[props.size])

function close() {
  emit('close')
  emit('update:show', false)
}

function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}

watch(() => props.show, (isShown) => {
  if (isShown) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.95);
}
</style>
