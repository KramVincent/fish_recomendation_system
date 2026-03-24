<template>
  <BaseCard :elevation="hover ? 'lg' : 'md'" :hover="true">
    <div class="space-y-4">
      <!-- Image -->
      <div class="relative w-full h-48 bg-surface-100 dark:bg-surface-700 rounded-lg overflow-hidden">
        <img
          v-if="species.imageUrl"
          :src="species.imageUrl"
          :alt="species.commonName"
          class="w-full h-full object-cover"
        />
        <div v-else class="flex items-center justify-center h-full">
          <svg class="h-16 w-16 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <!-- Confidence Badge -->
        <div v-if="confidence" class="absolute top-2 right-2">
          <BaseBadge :variant="confidenceVariant" size="md" rounded>
            {{ Math.round(confidence * 100) }}% match
          </BaseBadge>
        </div>
      </div>
      
      <!-- Species Info -->
      <div>
        <h3 class="text-xl font-bold text-surface-900 dark:text-white mb-1">
          {{ species.commonName }}
        </h3>
        <p class="text-sm italic text-surface-500 dark:text-surface-400 mb-3">
          {{ species.scientificName }}
        </p>
        
        <!-- Safety Badge -->
        <div class="flex items-center gap-2 mb-3">
          <BaseBadge :variant="safetyVariant" size="lg" rounded>
            {{ safetyLabel }}
          </BaseBadge>
          <BaseBadge :variant="mercuryVariant" size="md">
            {{ mercuryLabel }} Mercury
          </BaseBadge>
        </div>
        
        <p class="text-sm text-surface-700 dark:text-surface-300 line-clamp-2">
          {{ species.description }}
        </p>
      </div>
      
      <!-- Key Nutrients -->
      <div class="grid grid-cols-2 gap-3 pt-3 border-t border-surface-200 dark:border-surface-700">
        <div>
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Omega-3</p>
          <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">
            {{ species.nutrition.omega3 }} mg
          </p>
        </div>
        <div>
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Mercury</p>
          <p class="text-lg font-semibold" :class="mercuryColor">
            {{ species.nutrition.mercury.toFixed(3) }} ppm
          </p>
        </div>
        <div>
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Protein</p>
          <p class="text-lg font-semibold text-surface-900 dark:text-white">
            {{ species.nutrition.protein }} g
          </p>
        </div>
        <div>
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Calories</p>
          <p class="text-lg font-semibold text-surface-900 dark:text-white">
            {{ species.nutrition.calories }} kcal
          </p>
        </div>
      </div>
      
      <!-- View Details -->
      <BaseButton
        variant="primary"
        size="sm"
        full-width
        @click="$emit('view-details', species.id)"
      >
        View Full Details
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FishSpecies } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseButton from '@/components/common/BaseButton.vue'

interface Props {
  species: FishSpecies
  confidence?: number
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hover: false,
})

defineEmits<{
  'view-details': [id: string]
}>()

const safetyVariant = computed<'primary' | 'safe' | 'moderate' | 'avoid' | 'info' | 'neutral'>(() => {
  const map = { safe: 'safe' as const, moderate: 'moderate' as const, avoid: 'avoid' as const }
  return map[props.species.safetyCategory]
})

const safetyLabel = computed(() => {
  const map = { safe: '✓ Safe', moderate: '⚠ Moderate', avoid: '✕ Avoid' }
  return map[props.species.safetyCategory]
})

const mercuryVariant = computed(() => {
  const level = props.species.mercuryLevel
  if (level === 'very-low' || level === 'low') return 'safe'
  if (level === 'moderate') return 'moderate'
  return 'avoid'
})

const mercuryLabel = computed(() => {
  const map = {
    'very-low': 'Very Low',
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'very-high': 'Very High'
  }
  return map[props.species.mercuryLevel]
})

const mercuryColor = computed(() => {
  const level = props.species.mercuryLevel
  if (level === 'very-low' || level === 'low') return 'text-safe'
  if (level === 'moderate') return 'text-moderate'
  return 'text-avoid'
})

const confidenceVariant = computed(() => {
  if (!props.confidence) return 'neutral'
  if (props.confidence >= 0.8) return 'safe'
  if (props.confidence >= 0.5) return 'moderate'
  return 'avoid'
})
</script>
