<template>
  <div id="app" class="min-h-screen bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white transition-colors duration-200">
    <AppHeader v-if="showLayout" />
    
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <AppFooter v-if="showLayout" />
    
    <NotificationContainer />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/stores/theme'
import { useAuthStore } from '@/stores/auth'
import { useHealthStore } from '@/stores/health'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import NotificationContainer from '@/components/common/NotificationContainer.vue'

const route = useRoute()
const themeStore = useThemeStore()
const authStore = useAuthStore()
const healthStore = useHealthStore()

const showLayout = computed(() => {
  const noLayoutRoutes = ['Login', 'Register', 'Landing', 'NotFound']
  return !noLayoutRoutes.includes(route.name as string)
})

onMounted(async () => {
  themeStore.applyTheme()
  themeStore.initSystemListener()
  
  // Load health conditions for the app (auth init is handled by router guard)
  await healthStore.fetchConditions()
})
</script>
