<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-avoid ml-1">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="onInput"
        @blur="onBlur"
        @focus="onFocus"
      />
      
      <div v-if="hasError && errorMessage" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-avoid" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <p v-if="hasError && errorMessage" class="mt-1.5 text-sm text-avoid">
      {{ errorMessage }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  hint?: string
  errorMessage?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = ref(`input-${Math.random().toString(36).slice(2, 9)}`)
const isFocused = ref(false)

const hasError = computed(() => !!props.errorMessage)

const baseClasses = 'block w-full rounded-md shadow-sm transition-colors duration-150 sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-0'
const normalClasses = 'border-surface-300 dark:border-surface-600 focus:border-primary-500 focus:ring-primary-500 dark:bg-surface-800 dark:text-white'
const errorClasses = 'border-avoid focus:border-avoid focus:ring-avoid pr-10'
const disabledClasses = 'bg-surface-100 dark:bg-surface-900 cursor-not-allowed opacity-60'

const inputClasses = computed(() => {
  return [
    baseClasses,
    hasError.value ? errorClasses : normalClasses,
    props.disabled ? disabledClasses : '',
  ].join(' ')
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}

function onBlur(event: FocusEvent) {
  isFocused.value = false
  emit('blur', event)
}

function onFocus(event: FocusEvent) {
  isFocused.value = true
  emit('focus', event)
}
</script>
