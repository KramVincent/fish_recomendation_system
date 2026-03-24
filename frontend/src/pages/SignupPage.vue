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
          <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Create Account</h1>
          <p class="text-surface-600 dark:text-surface-400">Join FishDiet today</p>
        </div>
        
        <BaseCard elevation="lg">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <BaseInput
              v-model="name"
              type="text"
              label="Full Name"
              placeholder="John Doe"
              :error-message="errors.name"
              required
            />
            
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
              placeholder="At least 6 characters"
              autocomplete="new-password"
              :error-message="errors.password"
              required
            />
            
            <BaseInput
              v-model="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              autocomplete="new-password"
              :error-message="errors.confirmPassword"
              required
            />
            
            <div class="flex items-start gap-2 text-sm">
              <input 
                type="checkbox" 
                v-model="agreeToTerms" 
                id="terms"
                class="mt-1 rounded text-primary-600 focus:ring-primary-500" 
              />
              <label for="terms" class="text-surface-700 dark:text-surface-300 cursor-pointer">
                I agree to the 
                <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
                and 
                <a href="#" class="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </label>
            </div>
            
            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              full-width
              :loading="authStore.isLoading"
              :disabled="!agreeToTerms"
            >
              Create Account
            </BaseButton>
            
            <div class="text-center text-sm text-surface-600 dark:text-surface-400">
              Already have an account?
              <router-link to="/login" class="text-primary-600 dark:text-primary-400 font-medium hover:underline">
                Sign in
              </router-link>
            </div>
          </form>
        </BaseCard>
        
        <!-- Demo Info -->
        <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p class="text-sm text-blue-900 dark:text-blue-100">
            <strong>Demo Mode:</strong> Already have demo accounts. You can also 
            <router-link to="/login" class="underline hover:text-blue-600">sign in</router-link>
            to test the app.
          </p>
        </div>
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

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreeToTerms = ref(false)
const errors = ref<{ 
  name?: string
  email?: string
  password?: string
  confirmPassword?: string 
}>({})

async function handleSubmit() {
  errors.value = {}
  
  // Validation
  if (!name.value.trim()) {
    errors.value.name = 'Name is required'
    return
  }
  
  if (!email.value) {
    errors.value.email = 'Email is required'
    return
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    return
  }
  
  if (!password.value || password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
    return
  }
  
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = 'Passwords do not match'
    return
  }
  
  if (!agreeToTerms.value) {
    notificationStore.error('Please accept the terms', 'You must agree to the Terms of Service and Privacy Policy')
    return
  }
  
  // Register with Supabase
  const success = await authStore.register({
    email: email.value,
    password: password.value,
    fullName: name.value,
  })
  
  if (success) {
    notificationStore.success(
      'Account created!', 
      `Welcome ${name.value}! You are now signed in.`
    )
    router.push('/dashboard')
  } else {
    notificationStore.error('Signup failed', authStore.error || 'An error occurred. Please try again.')
  }
}
</script>
