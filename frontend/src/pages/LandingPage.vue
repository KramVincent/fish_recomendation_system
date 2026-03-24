<template>
  <div class="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-surface-900 dark:to-surface-800">
    <!-- Public Navigation -->
    <nav class="sticky top-0 z-50 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <img src="/fish-icon.svg" alt="FishDiet" class="h-8 w-8" />
            <span class="text-xl font-bold text-primary-600 dark:text-primary-400">FishDiet</span>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-8">
            <a href="#features" class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" class="text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              How It Works
            </a>
          </div>
          
          <!-- Actions -->
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
            
            <router-link to="/login">
              <BaseButton variant="secondary" size="sm">Sign In</BaseButton>
            </router-link>
            <router-link to="/register">
              <BaseButton size="sm">Get Started</BaseButton>
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Hero Section -->
    <section class="container mx-auto px-4 pt-20 pb-32">
      <div class="max-w-4xl mx-auto text-center animate-fade-in">
        <div class="flex justify-center mb-8">
          <img src="/fish-icon.svg" alt="FishDiet" class="h-24 w-24 animate-bounce-subtle" />
        </div>
        <h1 class="text-5xl md:text-6xl font-bold text-surface-900 dark:text-white mb-6">
          Smart Fish Dietary Recommendations
        </h1>
        <p class="text-xl text-surface-600 dark:text-surface-300 mb-8 max-w-2xl mx-auto">
          AI-powered fish identification and personalized dietary recommendations based on your health profile and nutritional needs.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/login">
            <BaseButton size="lg" class="w-full sm:w-auto">
              Get Started
            </BaseButton>
          </router-link>
          <BaseButton variant="secondary" size="lg" class="w-full sm:w-auto" @click="scrollToFeatures">
            Learn More
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white dark:bg-surface-800">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-surface-900 dark:text-white mb-12">
          Key Features
        </h2>
        <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div class="text-center p-6">
            <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              AI Fish Identification
            </h3>
            <p class="text-surface-600 dark:text-surface-300">
              Upload a photo of any fish and get instant identification with detailed nutritional information.
            </p>
          </div>

          <div class="text-center p-6">
            <div class="w-16 h-16 bg-safe-light dark:bg-safe-dark/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-safe dark:text-safe-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              Personalized Recommendations
            </h3>
            <p class="text-surface-600 dark:text-surface-300">
              Get customized fish recommendations based on your health conditions and dietary restrictions.
            </p>
          </div>

          <div class="text-center p-6">
            <div class="w-16 h-16 bg-moderate-light dark:bg-moderate-dark/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-moderate dark:text-moderate-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">
              Health Monitoring
            </h3>
            <p class="text-surface-600 dark:text-surface-300">
              Track your fish consumption and monitor nutritional intake aligned with your health goals.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="py-20 bg-surface-50 dark:bg-surface-900">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center text-surface-900 dark:text-white mb-12">
          How It Works
        </h2>
        <div class="max-w-4xl mx-auto space-y-8">
          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">Create Your Profile</h3>
              <p class="text-surface-600 dark:text-surface-300">
                Sign up and enter your health information, dietary restrictions, and nutritional goals.
              </p>
            </div>
          </div>

          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">Identify Fish</h3>
              <p class="text-surface-600 dark:text-surface-300">
                Upload a photo of any fish species to instantly identify it and view its nutritional profile.
              </p>
            </div>
          </div>

          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">Get Recommendations</h3>
              <p class="text-surface-600 dark:text-surface-300">
                Receive personalized safety ratings and consumption guidelines based on your health profile.
              </p>
            </div>
          </div>

          <div class="flex gap-6 items-start">
            <div class="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">Track Your Progress</h3>
              <p class="text-surface-600 dark:text-surface-300">
                Monitor your fish consumption patterns and ensure you're meeting your nutritional goals safely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-primary-600 dark:bg-primary-700">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Start Your Healthy Fish Diet?
        </h2>
        <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of users making informed decisions about their fish consumption.
        </p>
        <router-link to="/login">
          <BaseButton variant="secondary" size="lg">
            Sign Up Now
          </BaseButton>
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-surface-900 text-surface-300 py-12">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <img src="/fish-icon.svg" alt="FishDiet" class="h-8 w-8" />
              <span class="text-xl font-bold text-white">FishDiet</span>
            </div>
            <p class="text-sm">
              AI-powered fish dietary recommendations for a healthier lifestyle.
            </p>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Product</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#features" class="hover:text-white transition-colors">Features</a></li>
              <li><router-link to="/login" class="hover:text-white transition-colors">Get Started</router-link></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Company</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-white mb-4">Legal</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="#" class="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" class="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-surface-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {{ new Date().getFullYear() }} FishDiet. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import BaseButton from '@/components/common/BaseButton.vue'

const themeStore = useThemeStore()

function scrollToFeatures() {
  const element = document.getElementById('features')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
