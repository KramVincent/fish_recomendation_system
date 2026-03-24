<template>
  <header class="sticky top-0 z-40 w-full bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/fish-icon.svg" alt="FishDiet" class="h-8 w-8" />
          <span class="text-xl font-bold text-primary-600 dark:text-primary-400">FishDiet</span>
        </router-link>
        
        <!-- Navigation (Desktop) -->
        <nav class="hidden md:flex items-center gap-6">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            active-class="text-primary-600 dark:text-primary-400"
          >
            {{ link.label }}
          </router-link>
        </nav>
        
        <!-- Right Actions -->
        <div class="flex items-center gap-4">
          <!-- Theme Toggle -->
          <button
            type="button"
            class="p-2 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            @click="themeStore.toggle()"
            aria-label="Toggle theme"
          >
            <svg v-if="themeStore.resolved === 'light'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </button>
          
          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              data-user-menu-button
              type="button"
              class="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              @click.stop="toggleUserMenu"
            >
              <div class="h-8 w-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                {{ userInitials }}
              </div>
              <svg class="h-4 w-4 text-surface-600 dark:text-surface-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <Transition name="dropdown">
              <div
                v-if="showUserMenu"
                data-user-menu-dropdown
                class="absolute right-0 mt-2 w-56 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 py-1 z-50"
              >
                <div class="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                  <p class="text-sm font-medium text-surface-900 dark:text-white">{{ authStore.user?.fullName }}</p>
                  <p class="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{{ authStore.user?.email }}</p>
                </div>
                
                <router-link
                  to="/profile"
                  class="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  @click="showUserMenu = false"
                >
                  My Profile
                </router-link>
                <router-link
                  to="/settings"
                  class="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                  @click="showUserMenu = false"
                >
                  Settings
                </router-link>
                
                <div class="border-t border-surface-200 dark:border-surface-700 my-1"></div>
                
                <button
                  type="button"
                  class="block w-full text-left px-4 py-2 text-sm text-avoid hover:bg-avoid-light dark:hover:bg-avoid-dark/20"
                  @click="handleLogout"
                >
                  Sign Out
                </button>
              </div>
            </Transition>
          </div>
          
          <router-link v-else to="/login">
            <BaseButton size="sm">Sign In</BaseButton>
          </router-link>
          
          <!-- Mobile Menu Toggle -->
          <button
            type="button"
            class="md:hidden p-2 text-surface-600 dark:text-surface-400"
            @click="showMobileMenu = !showMobileMenu"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Navigation -->
      <Transition name="slide-down">
        <nav v-if="showMobileMenu" class="md:hidden border-t border-surface-200 dark:border-surface-700 py-4">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-4 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md"
            active-class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
            @click="showMobileMenu = false"
          >
            {{ link.label }}
          </router-link>
        </nav>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useNotificationStore } from '@/stores/notifications'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const notificationStore = useNotificationStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const navLinks = computed(() => {
  return [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Identify Fish', to: '/identify' },
    { label: 'Recommendations', to: '/recommendations' },
    { label: 'Health Profiles', to: '/health-profile' },
  ]
})

const userInitials = computed(() => {
  if (!authStore.user) return ''
  const names = authStore.user.fullName.split(' ')
  return names.map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

async function handleLogout() {
  showUserMenu.value = false
  await authStore.logout()
  notificationStore.success('Signed out successfully')
  router.push('/login')
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  const menuButton = document.querySelector('[data-user-menu-button]')
  const menuDropdown = document.querySelector('[data-user-menu-dropdown]')
  
  if (
    showUserMenu.value &&
    menuButton &&
    menuDropdown &&
    !menuButton.contains(target) &&
    !menuDropdown.contains(target)
  ) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
}
</style>
