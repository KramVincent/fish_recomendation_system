<template>
  <footer class="bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700 mt-auto">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <img src="/fish-icon.svg" alt="FishDiet" class="h-8 w-8" />
            <span class="text-lg font-bold text-primary-600 dark:text-primary-400">FishDiet</span>
          </div>
          <p class="text-sm text-surface-600 dark:text-surface-400">
            AI-powered fish dietary recommendations for healthier living.
          </p>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-surface-900 dark:text-white mb-3">Quick Links</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <router-link to="/dashboard" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/identify" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Identify Fish
              </router-link>
            </li>
            <li>
              <router-link to="/recommendations" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Recommendations
              </router-link>
            </li>
          </ul>
        </div>
        
        <!-- Resources -->
        <div>
          <h3 class="font-semibold text-surface-900 dark:text-white mb-3">Resources</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                About Mercury Levels
              </a>
            </li>
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Omega-3 Benefits
              </a>
            </li>
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Health Conditions Guide
              </a>
            </li>
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                FAQ
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Legal -->
        <div>
          <h3 class="font-semibold text-surface-900 dark:text-white mb-3">Legal</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" class="text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400">
                Medical Disclaimer
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="mt-8 pt-8 border-t border-surface-200 dark:border-surface-700">
        <p class="text-center text-sm text-surface-600 dark:text-surface-400">
          © {{ currentYear }} FishDiet. All rights reserved. Medical advice should always be obtained from a qualified healthcare professional.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>
