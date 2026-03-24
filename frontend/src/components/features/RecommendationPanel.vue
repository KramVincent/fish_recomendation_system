<template>
  <BaseCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-surface-900 dark:text-white">Personalized Recommendations</h3>
        <BaseBadge variant="info" size="sm">{{ totalRecommendations }} fish analyzed</BaseBadge>
      </div>
    </template>
    
    <div class="space-y-6">
      <!-- Safe Fish -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="h-3 w-3 rounded-full bg-safe"></div>
          <h4 class="text-md font-semibold text-surface-900 dark:text-white">
            Safe to Eat ({{ safeRecommendations.length }})
          </h4>
        </div>
        
        <div v-if="safeRecommendations.length > 0" class="space-y-3">
          <div
            v-for="rec in safeRecommendations"
            :key="rec.id"
            class="p-4 bg-safe-light dark:bg-safe-dark/20 rounded-lg border border-safe/20"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <h5 class="font-semibold text-surface-900 dark:text-white">{{ rec.species.commonName }}</h5>
                <p class="text-xs text-surface-600 dark:text-surface-400 italic">{{ rec.species.scientificName }}</p>
              </div>
              <BaseBadge variant="safe" size="sm">Safe</BaseBadge>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <span class="text-surface-600 dark:text-surface-400">Serving:</span>
                <span class="ml-1 font-medium text-surface-900 dark:text-white">{{ rec.servingSize }}</span>
              </div>
              <div>
                <span class="text-surface-600 dark:text-surface-400">Frequency:</span>
                <span class="ml-1 font-medium text-surface-900 dark:text-white">{{ rec.frequencyPerWeek }}x/week</span>
              </div>
            </div>
            
            <p class="text-sm text-surface-700 dark:text-surface-300 mb-2">
              {{ rec.reasoning }}
            </p>
            
            <details class="text-sm">
              <summary class="cursor-pointer text-primary-600 dark:text-primary-400 font-medium">
                Preparation Tips
              </summary>
              <ul class="mt-2 ml-4 list-disc text-surface-600 dark:text-surface-400 space-y-1">
                <li v-for="(tip, i) in rec.preparationTips" :key="i">{{ tip }}</li>
              </ul>
            </details>
          </div>
        </div>
        <p v-else class="text-sm text-surface-500 dark:text-surface-400 italic">No safe fish found for your profile.</p>
      </div>
      
      <!-- Moderate Fish -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="h-3 w-3 rounded-full bg-moderate"></div>
          <h4 class="text-md font-semibold text-surface-900 dark:text-white">
            Consume with Caution ({{ moderateRecommendations.length }})
          </h4>
        </div>
        
        <div v-if="moderateRecommendations.length > 0" class="space-y-3">
          <div
            v-for="rec in moderateRecommendations"
            :key="rec.id"
            class="p-4 bg-moderate-light dark:bg-moderate-dark/20 rounded-lg border border-moderate/20"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <h5 class="font-semibold text-surface-900 dark:text-white">{{ rec.species.commonName }}</h5>
                <p class="text-xs text-surface-600 dark:text-surface-400 italic">{{ rec.species.scientificName }}</p>
              </div>
              <BaseBadge variant="moderate" size="sm">Moderate</BaseBadge>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-3 text-sm">
              <div>
                <span class="text-surface-600 dark:text-surface-400">Serving:</span>
                <span class="ml-1 font-medium text-surface-900 dark:text-white">{{ rec.servingSize }}</span>
              </div>
              <div>
                <span class="text-surface-600 dark:text-surface-400">Limit:</span>
                <span class="ml-1 font-medium text-surface-900 dark:text-white">{{ rec.frequencyPerMonth }}x/month</span>
              </div>
            </div>
            
            <p class="text-sm text-surface-700 dark:text-surface-300 mb-2">
              {{ rec.reasoning }}
            </p>
            
            <div v-if="rec.warnings.length > 0" class="bg-moderate/10 dark:bg-moderate-dark/30 p-3 rounded mt-2">
              <p class="text-xs font-semibold text-moderate-dark dark:text-moderate mb-1">⚠ Warnings:</p>
              <ul class="text-xs text-surface-700 dark:text-surface-300 space-y-1 ml-4 list-disc">
                <li v-for="(warn, i) in rec.warnings" :key="i">{{ warn }}</li>
              </ul>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-surface-500 dark:text-surface-400 italic">No moderate-risk fish identified.</p>
      </div>
      
      <!-- Avoid Fish -->
      <div>
        <div class="flex items-center gap-2 mb-3">
          <div class="h-3 w-3 rounded-full bg-avoid"></div>
          <h4 class="text-md font-semibold text-surface-900 dark:text-white">
            Avoid ({{ avoidRecommendations.length }})
          </h4>
        </div>
        
        <div v-if="avoidRecommendations.length > 0" class="space-y-3">
          <div
            v-for="rec in avoidRecommendations"
            :key="rec.id"
            class="p-4 bg-avoid-light dark:bg-avoid-dark/20 rounded-lg border border-avoid/20"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <h5 class="font-semibold text-surface-900 dark:text-white">{{ rec.species.commonName }}</h5>
                <p class="text-xs text-surface-600 dark:text-surface-400 italic">{{ rec.species.scientificName }}</p>
              </div>
              <BaseBadge variant="avoid" size="sm">Avoid</BaseBadge>
            </div>
            
            <p class="text-sm text-surface-700 dark:text-surface-300 mb-2">
              {{ rec.reasoning }}
            </p>
            
            <div v-if="rec.warnings.length > 0" class="bg-avoid/10 dark:bg-avoid-dark/30 p-3 rounded">
              <p class="text-xs font-semibold text-avoid-dark dark:text-avoid mb-1">✕ Health Warnings:</p>
              <ul class="text-xs text-surface-700 dark:text-surface-300 space-y-1 ml-4 list-disc">
                <li v-for="(warn, i) in rec.warnings" :key="i">{{ warn }}</li>
              </ul>
            </div>
            
            <div v-if="rec.alternatives.length > 0" class="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
              <p class="text-xs font-medium text-surface-700 dark:text-surface-300 mb-1">Alternatives:</p>
              <p class="text-xs text-surface-600 dark:text-surface-400">{{ rec.alternatives.join(', ') }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-surface-500 dark:text-surface-400 italic">No fish to avoid identified.</p>
      </div>
    </div>
    
    <template #footer>
      <BaseButton variant="primary" size="md" full-width @click="$emit('download-report')">
        Download PDF Report
      </BaseButton>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FishRecommendation } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'

interface Props {
  recommendations: FishRecommendation[]
}

const props = defineProps<Props>()

defineEmits<{
  'download-report': []
}>()

const safeRecommendations = computed(() =>
  props.recommendations.filter(r => r.safetyCategory === 'safe')
)

const moderateRecommendations = computed(() =>
  props.recommendations.filter(r => r.safetyCategory === 'moderate')
)

const avoidRecommendations = computed(() =>
  props.recommendations.filter(r => r.safetyCategory === 'avoid')
)

const totalRecommendations = computed(() => props.recommendations.length)
</script>
