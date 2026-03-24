<template>
  <div class="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-surface-900 dark:to-surface-800">
    <!-- Simple Navigation -->
    <nav class="absolute top-0 left-0 right-0 z-10">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/fish-icon.svg" alt="FishDiet" class="h-8 w-8" />
            <span class="text-xl font-bold text-primary-600 dark:text-primary-400">FishDiet</span>
          </router-link>
          <router-link to="/" class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm">
            ← Back to Home
          </router-link>
        </div>
      </div>
    </nav>
    
    <div class="flex items-center justify-center px-4 min-h-screen">
      <div class="w-full max-w-md animate-fade-in">
        <div class="text-center mb-8">
          <img src="/fish-icon.svg" alt="FishDiet" class="h-16 w-16 mx-auto mb-4" />
          <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Welcome to FishDiet</h1>
          <p class="text-surface-600 dark:text-surface-400">Sign in to your account</p>
        </div>
        
        <BaseCard elevation="lg">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <BaseInput
              v-model="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autocomplete="email"
              :error-message="errors.email"
              required
            />
            
            <BaseInput
              v-model="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              autocomplete="current-password"
              :error-message="errors.password"
              required
            />
            
            <div class="flex items-center justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="rememberMe" class="rounded text-primary-600 focus:ring-primary-500" />
                <span class="text-surface-700 dark:text-surface-300">Remember me</span>
              </label>
              <router-link to="/forgot-password" class="text-primary-600 dark:text-primary-400 hover:underline">
                Forgot password?
              </router-link>
            </div>
            
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="authStore.isLoading"
            >
              Sign In
            </BaseButton>
            
            <div class="text-center text-sm text-surface-600 dark:text-surface-400">
              Don't have an account?
              <router-link to="/register" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Sign up
              </router-link>
            </div>
          </form>
        </BaseCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const email = ref('maria@example.com')
const password = ref('password123')
const rememberMe = ref(false)
const errors = ref<{ email?: string; password?: string }>({})

async function handleSubmit() {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = 'Email is required'
    return
  }
  
  if (!password.value || password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  
  const success = await authStore.login({ email: email.value, password: password.value })
  
  if (success) {
    notificationStore.success('Welcome back!', `Signed in as ${email.value}`)
    router.push('/dashboard')
  } else {
    notificationStore.error('Login failed', authStore.error || 'Invalid credentials')
  }
}
</script>
