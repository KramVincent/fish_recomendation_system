<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Settings</h1>
      <p class="text-surface-600 dark:text-surface-400">Customize your app experience</p>
    </div>

    <div class="grid gap-6">
      <!-- Appearance -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold">Appearance</h2>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
              Theme
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="mode in themeOptions"
                :key="mode.value"
                @click="themeStore.setMode(mode.value)"
                class="p-4 border-2 rounded-lg transition-all"
                :class="themeStore.mode === mode.value 
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'"
              >
                <component :is="mode.icon" class="w-6 h-6 mx-auto mb-2" />
                <p class="text-sm font-medium">{{ mode.label }}</p>
              </button>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Notifications -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold">Notifications</h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-surface-900 dark:text-white">Email Notifications</p>
              <p class="text-sm text-surface-600 dark:text-surface-400">
                Receive updates about your recommendations via email
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.emailNotifications"
                type="checkbox"
                class="sr-only peer"
                @change="handleSettingChange"
              />
              <div class="w-11 h-6 bg-surface-300 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-500 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between py-3 border-t border-surface-200 dark:border-surface-700">
            <div>
              <p class="font-medium text-surface-900 dark:text-white">Push Notifications</p>
              <p class="text-sm text-surface-600 dark:text-surface-400">
                Get notified about new recommendations and updates
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.pushNotifications"
                type="checkbox"
                class="sr-only peer"
                @change="handleSettingChange"
              />
              <div class="w-11 h-6 bg-surface-300 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-500 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between py-3 border-t border-surface-200 dark:border-surface-700">
            <div>
              <p class="font-medium text-surface-900 dark:text-white">Weekly Summary</p>
              <p class="text-sm text-surface-600 dark:text-surface-400">
                Receive a weekly summary of your fish consumption
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.weeklySummary"
                type="checkbox"
                class="sr-only peer"
                @change="handleSettingChange"
              />
              <div class="w-11 h-6 bg-surface-300 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-500 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </BaseCard>

      <!-- Privacy -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold">Privacy & Data</h2>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-surface-900 dark:text-white">Data Collection</p>
              <p class="text-sm text-surface-600 dark:text-surface-400">
                Allow anonymous usage data to improve the app
              </p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                v-model="settings.dataCollection"
                type="checkbox"
                class="sr-only peer"
                @change="handleSettingChange"
              />
              <div class="w-11 h-6 bg-surface-300 peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-surface-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-surface-500 peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div class="py-3 border-t border-surface-200 dark:border-surface-700">
            <BaseButton variant="secondary" @click="handleExportData">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export My Data
            </BaseButton>
            <p class="text-xs text-surface-500 dark:text-surface-400 mt-2">
              Download all your data in JSON format
            </p>
          </div>
        </div>
      </BaseCard>

      <!-- Danger Zone -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold text-avoid">Danger Zone</h2>
        </template>

        <div class="space-y-4">
          <div class="p-4 bg-avoid-light dark:bg-avoid-dark/20 border border-avoid/30 rounded-lg">
            <p class="font-medium text-surface-900 dark:text-white mb-2">Delete Account</p>
            <p class="text-sm text-surface-600 dark:text-surface-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <BaseButton variant="danger" @click="handleDeleteAccount">
              Delete My Account
            </BaseButton>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const SETTINGS_STORAGE_KEY = 'fish-app-settings'

const themeOptions = [
  {
    value: 'light' as const,
    label: 'Light',
    icon: h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
    ]),
  },
  {
    value: 'dark' as const,
    label: 'Dark',
    icon: h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' })
    ]),
  },
  {
    value: 'system' as const,
    label: 'System',
    icon: h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ]),
  },
]

// Load settings from localStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        emailNotifications: parsed.emailNotifications ?? true,
        pushNotifications: parsed.pushNotifications ?? true,
        weeklySummary: parsed.weeklySummary ?? false,
        dataCollection: parsed.dataCollection ?? true,
      }
    }
  } catch {
    // ignore
  }
  return {
    emailNotifications: true,
    pushNotifications: true,
    weeklySummary: false,
    dataCollection: true,
  }
}

const settings = reactive(loadSettings())

function handleSettingChange() {
  // Persist to localStorage
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
    emailNotifications: settings.emailNotifications,
    pushNotifications: settings.pushNotifications,
    weeklySummary: settings.weeklySummary,
    dataCollection: settings.dataCollection,
  }))
  notificationStore.success('Settings saved')
}

async function handleExportData() {
  try {
    notificationStore.info('Exporting data...', 'Gathering all your data from the server')
    const data = await authStore.exportData()
    if (!data) {
      notificationStore.error('Export failed', 'Could not retrieve your data')
      return
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fishdiet-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    notificationStore.success('Data exported successfully')
  } catch {
    notificationStore.error('Export failed', 'An error occurred while exporting your data')
  }
}

async function handleDeleteAccount() {
  if (!confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.')) {
    return
  }
  // Double confirmation
  if (!confirm('This is your last chance. ALL your health profiles, scan history, and recommendations will be permanently deleted. Continue?')) {
    return
  }
  try {
    const success = await authStore.deleteAccount()
    if (success) {
      notificationStore.success('Account deleted', 'Your account and all associated data have been permanently removed.')
      router.push('/')
    } else {
      notificationStore.error('Deletion failed', authStore.error || 'Could not delete your account. Please try again.')
    }
  } catch {
    notificationStore.error('Deletion failed', 'An unexpected error occurred.')
  }
}
</script>
