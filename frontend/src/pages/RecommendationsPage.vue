<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumb :items="breadcrumbs" />
    
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Fish Recommendations</h1>
      <p class="text-surface-600 dark:text-surface-400">Personalized dietary recommendations based on your health profile</p>
    </div>
    
    <!-- Loading State -->
    <div v-if="recommendationStore.isLoading" class="flex justify-center py-12">
      <svg class="animate-spin h-12 w-12 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
    
    <!-- Recommendations Panel -->
    <div v-else-if="recommendationStore.recommendations.length > 0" class="max-w-5xl mx-auto">
      <div class="flex justify-end mb-4">
        <BaseButton variant="secondary" size="sm" @click="regenerateRecommendations">
          <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Regenerate
        </BaseButton>
      </div>
      <RecommendationPanel
        :recommendations="recommendationStore.recommendations"
        @download-report="downloadReport"
      />
    </div>
    
    <!-- Empty State -->
    <div v-else class="max-w-2xl mx-auto text-center py-16">
      <svg class="h-24 w-24 mx-auto text-surface-300 dark:text-surface-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-2xl font-bold text-surface-900 dark:text-white mb-3">No Recommendations Yet</h3>
      <p class="text-surface-600 dark:text-surface-400 mb-6">
        Complete your health profile to receive personalized fish recommendations
      </p>
      <router-link to="/health-profile">
        <BaseButton variant="primary" size="lg">
          Set Up Health Profile
        </BaseButton>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRecommendationStore } from '@/stores/recommendations'
import { useProfilesStore } from '@/stores/profiles'
import { useNotificationStore } from '@/stores/notifications'
import RecommendationPanel from '@/components/features/RecommendationPanel.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

const authStore = useAuthStore()
const recommendationStore = useRecommendationStore()
const profilesStore = useProfilesStore()
const notificationStore = useNotificationStore()

const breadcrumbs = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Recommendations' },
]

async function loadRecommendations() {
  if (authStore.user && profilesStore.activeProfile) {
    // Always regenerate from current suitability data to avoid stale local cache.
    await recommendationStore.generateRecommendations(authStore.user.id, profilesStore.activeProfile.id)
  }
}

async function regenerateRecommendations() {
  if (authStore.user && profilesStore.activeProfile) {
    await recommendationStore.generateRecommendations(authStore.user.id, profilesStore.activeProfile.id)
    notificationStore.success('Recommendations updated', 'Your fish recommendations have been regenerated based on your health profile.')
  }
}

async function downloadReport() {
  notificationStore.info('Generating PDF report...', 'This feature will be available soon')
  // TODO: Implement PDF generation with html2pdf or similar
}

onMounted(async () => {
  await loadRecommendations()
})

// Watch for active profile changes
watch(() => profilesStore.activeProfile?.id, async () => {
  await loadRecommendations()
})
</script>
