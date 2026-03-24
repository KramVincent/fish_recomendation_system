<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="authStore.isLoading || !authStore.isInitialized" class="flex items-center justify-center min-h-[60vh]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p class="text-surface-600 dark:text-surface-400">Loading your dashboard...</p>
      </div>
    </div>

    <template v-else>
      <Breadcrumb :items="breadcrumbs" />
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Dashboard</h1>
        <p class="text-surface-600 dark:text-surface-400">Welcome back, {{ authStore.user?.fullName }}!</p>
      </div>

      <!-- Active Profile Banner -->
      <BaseCard v-if="profilesStore.activeProfile" class="mb-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
              {{ getInitials(profilesStore.activeProfile.name) }}
            </div>
            <div>
              <p class="text-sm text-surface-600 dark:text-surface-400">Currently viewing data for:</p>
              <p class="font-semibold text-surface-900 dark:text-white">{{ profilesStore.activeProfile.name }}</p>
            </div>
          </div>
          <router-link to="/health-profile">
            <BaseButton size="sm" variant="secondary">
              Switch Profile
            </BaseButton>
          </router-link>
        </div>
      </BaseCard>
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <BaseCard elevation="md" class="animate-fade-in" style="animation-delay: 0.1s">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-safe-light dark:bg-safe-dark/30 flex items-center justify-center">
            <span class="text-2xl">✓</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900 dark:text-white">{{ recommendationStore.totalSafe }}</p>
            <p class="text-sm text-surface-600 dark:text-surface-400">Safe Fish</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard elevation="md" class="animate-fade-in" style="animation-delay: 0.2s">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-moderate-light dark:bg-moderate-dark/30 flex items-center justify-center">
            <span class="text-2xl">⚠</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900 dark:text-white">{{ recommendationStore.totalModerate }}</p>
            <p class="text-sm text-surface-600 dark:text-surface-400">Moderate</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard elevation="md" class="animate-fade-in" style="animation-delay: 0.3s">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-avoid-light dark:bg-avoid-dark/30 flex items-center justify-center">
            <span class="text-2xl">✕</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900 dark:text-white">{{ recommendationStore.totalAvoid }}</p>
            <p class="text-sm text-surface-600 dark:text-surface-400">Avoid</p>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard elevation="md" class="animate-fade-in" style="animation-delay: 0.4s">
        <div class="flex items-center gap-4">
          <div class="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span class="text-2xl">📊</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-surface-900 dark:text-white">{{ uploadStore.uploadHistory.length }}</p>
            <p class="text-sm text-surface-600 dark:text-surface-400">Analyzed</p>
          </div>
        </div>
      </BaseCard>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <BaseCard title="Quick Actions">
        <div class="space-y-3">
          <router-link to="/identify" class="block">
            <div class="flex items-center gap-4 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all transform hover:scale-[1.02]">
              <svg class="h-8 w-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="font-semibold text-surface-900 dark:text-white">Identify Fish</p>
                <p class="text-sm text-surface-600 dark:text-surface-400">Upload image to identify species</p>
              </div>
            </div>
          </router-link>
          
          <router-link to="/health-profile" class="block">
            <div class="flex items-center gap-4 p-4 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-all transform hover:scale-[1.02]">
              <svg class="h-8 w-8 text-surface-600 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p class="font-semibold text-surface-900 dark:text-white">Update Health Profile</p>
                <p class="text-sm text-surface-600 dark:text-surface-400">Manage conditions and preferences</p>
              </div>
            </div>
          </router-link>
          
          <router-link to="/recommendations" class="block">
            <div class="flex items-center gap-4 p-4 rounded-lg bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors">
              <svg class="h-8 w-8 text-surface-600 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p class="font-semibold text-surface-900 dark:text-white">View Recommendations</p>
                <p class="text-sm text-surface-600 dark:text-surface-400">See your personalized fish guide</p>
              </div>
            </div>
          </router-link>
        </div>
      </BaseCard>
      
      <!-- Recent Activity -->
      <BaseCard title="Recent Activity">
        <div v-if="uploadStore.uploadHistory.length > 0" class="space-y-3">
          <div
            v-for="upload in recentUploads"
            :key="upload.id"
            class="flex items-center gap-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-700/50"
          >
            <img :src="upload.previewUrl" alt="Fish" class="h-12 w-12 rounded object-cover" />
            <div class="flex-1">
              <p class="font-medium text-surface-900 dark:text-white text-sm">
                {{ upload.result?.predictions[0]?.speciesName || 'Processing...' }}
              </p>
              <p class="text-xs text-surface-500 dark:text-surface-400">
                {{ formatDate(upload.createdAt) }}
              </p>
            </div>
            <BaseBadge
              :variant="upload.status === 'complete' ? 'safe' : 'info'"
              size="sm"
            >
              {{ upload.status }}
            </BaseBadge>
          </div>
        </div>
        <div v-else class="text-center py-8 text-surface-500 dark:text-surface-400">
          <p>No activity yet</p>
          <p class="text-sm mt-1">Start by identifying your first fish!</p>
        </div>
      </BaseCard>
    </div>
    
    <!-- Health Conditions Summary -->
    <BaseCard v-if="healthStore.hasProfile" title="Your Health Conditions">
      <div class="flex flex-wrap gap-2">
        <BaseBadge
          v-for="condition in healthStore.selectedConditions"
          :key="condition.id"
          variant="info"
          size="md"
        >
          {{ condition.icon }} {{ condition.name }}
        </BaseBadge>
        <router-link to="/health-profile">
          <BaseBadge variant="neutral" size="md">+ Manage</BaseBadge>
        </router-link>
      </div>
    </BaseCard>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRecommendationStore } from '@/stores/recommendations'
import { useUploadStore } from '@/stores/upload'
import { useHealthStore } from '@/stores/health'
import { useProfilesStore } from '@/stores/profiles'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

const authStore = useAuthStore()
const recommendationStore = useRecommendationStore()
const uploadStore = useUploadStore()
const healthStore = useHealthStore()
const profilesStore = useProfilesStore()

const breadcrumbs = [{ label: 'Dashboard' }]

const recentUploads = computed(() => uploadStore.uploadHistory.slice(0, 5))

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

onMounted(async () => {
  if (authStore.user) {
    // First load profiles to get active profile
    await profilesStore.loadProfilesFromSupabase(authStore.user.id)
    
    // Then load recommendations and other data
    await Promise.all([
      profilesStore.activeProfile 
        ? recommendationStore.fetchRecommendations(authStore.user.id, profilesStore.activeProfile.id)
        : Promise.resolve(),
      healthStore.fetchProfile(authStore.user.id),
      uploadStore.loadHistory(authStore.user.id),
    ])
  }
})
</script>
