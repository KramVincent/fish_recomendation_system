<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-900 px-4">
    <div class="text-center animate-fade-in">
      <h1 class="text-9xl font-bold text-primary-600 dark:text-primary-400 mb-4 animate-bounce-subtle">404</h1>
      <h2 class="text-3xl font-semibold text-surface-900 dark:text-white mb-4">Page Not Found</h2>
      <p class="text-surface-600 dark:text-surface-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <router-link :to="authStore.isAuthenticated ? '/dashboard' : '/'">
        <BaseButton variant="primary" size="lg">
          {{ authStore.isAuthenticated ? 'Back to Dashboard' : 'Back to Home' }}
        </BaseButton>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()
</script>
