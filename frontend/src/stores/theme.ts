import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ThemeMode } from '@/api/types'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('system')
  const resolved = ref<'light' | 'dark'>('light')

  function applyTheme() {
    let effective: 'light' | 'dark'

    if (mode.value === 'system') {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      effective = mode.value
    }

    resolved.value = effective

    if (effective === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    applyTheme()
  }

  function toggle() {
    if (resolved.value === 'light') {
      setMode('dark')
    } else {
      setMode('light')
    }
  }

  // Watch for system preference changes
  function initSystemListener() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', () => {
      if (mode.value === 'system') applyTheme()
    })
  }

  return { mode, resolved, setMode, toggle, applyTheme, initSystemListener }
}, {
  persist: {
    key: 'fish-diet-theme',
    pick: ['mode'],
  },
})
