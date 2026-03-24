<template>
  <BaseCard :elevation="'lg'" class="overflow-hidden">
    <!-- Safety Banner -->
    <div 
      class="px-6 py-4 -mx-6 -mt-6 mb-4"
      :class="safetyBannerClass"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="text-3xl">{{ safetyIcon }}</div>
          <div>
            <h2 class="text-xl font-bold text-white">{{ safetyTitle }}</h2>
            <p class="text-sm text-white/80">{{ safetySubtitle }}</p>
          </div>
        </div>
        <div v-if="confidence" class="text-right">
          <div class="text-2xl font-bold text-white">{{ Math.round(confidence * 100) }}%</div>
          <div class="text-xs text-white/70">match confidence</div>
        </div>
      </div>
    </div>

    <div class="space-y-5">
      <!-- Fish Identity (Secondary) -->
      <div class="flex items-start gap-4">
        <div class="w-20 h-20 rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-700 flex-shrink-0">
          <img
            v-if="displayImageUrl"
            :src="displayImageUrl"
            :alt="species.commonName"
            class="w-full h-full object-cover"
          />
          <div v-else class="flex items-center justify-center h-full">
            <svg class="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div>
          <p class="text-sm text-surface-500 dark:text-surface-400">Identified as</p>
          <h3 class="text-lg font-bold text-surface-900 dark:text-white">{{ species.commonName }}</h3>
          <p class="text-sm italic text-surface-500 dark:text-surface-400">{{ species.scientificName }}</p>
        </div>
      </div>

      <!-- Recommendation Reasoning -->
      <div class="p-4 rounded-lg" :class="reasoningBgClass">
        <h4 class="font-semibold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Why this recommendation?
        </h4>
        <p class="text-sm text-surface-700 dark:text-surface-300">{{ reasoning }}</p>
      </div>

      <!-- Serving Recommendation (only for safe/moderate) -->
      <div v-if="recommendation !== 'avoid'" class="grid grid-cols-2 gap-4">
        <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Recommended Serving</p>
          <p class="text-lg font-semibold text-surface-900 dark:text-white">{{ servingSize }}</p>
        </div>
        <div class="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
          <p class="text-xs text-surface-500 dark:text-surface-400 mb-1">Frequency</p>
          <p class="text-lg font-semibold text-surface-900 dark:text-white">{{ frequencyText }}</p>
        </div>
      </div>

      <!-- Key Nutritional Benefits -->
      <div>
        <h4 class="font-semibold text-surface-900 dark:text-white mb-3">Nutritional Profile</h4>
        <div class="grid grid-cols-4 gap-2">
          <div class="text-center p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p class="text-xs text-surface-500 dark:text-surface-400">Omega-3</p>
            <p class="text-sm font-semibold text-primary-600 dark:text-primary-400">{{ species.nutrition.omega3 }}mg</p>
          </div>
          <div class="text-center p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p class="text-xs text-surface-500 dark:text-surface-400">Protein</p>
            <p class="text-sm font-semibold text-surface-900 dark:text-white">{{ species.nutrition.protein }}g</p>
          </div>
          <div class="text-center p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p class="text-xs text-surface-500 dark:text-surface-400">Mercury</p>
            <p class="text-sm font-semibold" :class="mercuryColor">{{ mercuryLabel }}</p>
          </div>
          <div class="text-center p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
            <p class="text-xs text-surface-500 dark:text-surface-400">Calories</p>
            <p class="text-sm font-semibold text-surface-900 dark:text-white">{{ species.nutrition.calories }}</p>
          </div>
        </div>
      </div>

      <!-- Health Benefits (for safe fish) -->
      <div v-if="recommendation === 'recommended' && benefits.length > 0">
        <h4 class="font-semibold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
          <svg class="w-5 h-5 text-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Health Benefits
        </h4>
        <ul class="space-y-1">
          <li v-for="(benefit, i) in benefits" :key="i" class="flex items-start gap-2 text-sm text-surface-700 dark:text-surface-300">
            <span class="text-safe mt-0.5">✓</span>
            {{ benefit }}
          </li>
        </ul>
      </div>

      <!-- Warnings (for moderate/avoid) -->
      <div v-if="warnings.length > 0" class="p-4 rounded-lg" :class="warningBgClass">
        <h4 class="font-semibold mb-2 flex items-center gap-2" :class="warningTextClass">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ recommendation === 'avoid' ? 'Health Warnings' : 'Cautions' }}
        </h4>
        <ul class="space-y-1">
          <li v-for="(warning, i) in warnings" :key="i" class="flex items-start gap-2 text-sm" :class="warningItemClass">
            <span class="mt-0.5">•</span>
            {{ warning }}
          </li>
        </ul>
      </div>

      <!-- Alternatives (for avoid fish) -->
      <div v-if="recommendation === 'avoid' && alternatives.length > 0" class="p-4 bg-safe-light dark:bg-safe-dark/20 rounded-lg border border-safe/20">
        <h4 class="font-semibold text-surface-900 dark:text-white mb-2 flex items-center gap-2">
          <svg class="w-5 h-5 text-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Safer Alternatives
        </h4>
        <p class="text-sm text-surface-700 dark:text-surface-300">
          Consider these fish instead: <span class="font-medium">{{ alternatives.join(', ') }}</span>
        </p>
      </div>

      <!-- Preparation Tips -->
      <details v-if="preparationTips.length > 0" class="group">
        <summary class="cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1">
          <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          Preparation Tips
        </summary>
        <ul class="mt-2 ml-5 space-y-1 text-sm text-surface-600 dark:text-surface-400 list-disc">
          <li v-for="(tip, i) in preparationTips" :key="i">{{ tip }}</li>
        </ul>
      </details>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FishSpecies } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'

type RecommendationType = 'recommended' | 'caution' | 'avoid'

interface Props {
  species: FishSpecies
  localImageUrl?: string
  recommendation: RecommendationType
  reasoning: string
  confidence?: number
  servingSize?: string
  frequencyPerWeek?: number
  frequencyPerMonth?: number
  benefits?: string[]
  warnings?: string[]
  alternatives?: string[]
  preparationTips?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  servingSize: '100-150g',
  frequencyPerWeek: 2,
  frequencyPerMonth: 8,
  benefits: () => [],
  warnings: () => [],
  alternatives: () => [],
  preparationTips: () => [],
})

// Use local image if available, otherwise fall back to species imageUrl
const displayImageUrl = computed(() => {
  return props.localImageUrl || props.species.imageUrl
})

// Safety banner styles
const safetyBannerClass = computed(() => {
  switch (props.recommendation) {
    case 'recommended':
      return 'bg-gradient-to-r from-safe to-safe-dark'
    case 'caution':
      return 'bg-gradient-to-r from-moderate to-moderate-dark'
    case 'avoid':
      return 'bg-gradient-to-r from-avoid to-avoid-dark'
  }
})

const safetyIcon = computed(() => {
  switch (props.recommendation) {
    case 'recommended':
      return '✓'
    case 'caution':
      return '⚠'
    case 'avoid':
      return '✕'
  }
})

const safetyTitle = computed(() => {
  switch (props.recommendation) {
    case 'recommended':
      return 'Safe to Eat'
    case 'caution':
      return 'Consume with Caution'
    case 'avoid':
      return 'Not Recommended'
  }
})

const safetySubtitle = computed(() => {
  switch (props.recommendation) {
    case 'recommended':
      return 'This fish is recommended for your health profile'
    case 'caution':
      return 'Limit consumption based on your health conditions'
    case 'avoid':
      return 'This fish may pose health risks for you'
  }
})

const reasoningBgClass = computed(() => {
  switch (props.recommendation) {
    case 'recommended':
      return 'bg-safe-light dark:bg-safe-dark/10 border border-safe/20'
    case 'caution':
      return 'bg-moderate-light dark:bg-moderate-dark/10 border border-moderate/20'
    case 'avoid':
      return 'bg-avoid-light dark:bg-avoid-dark/10 border border-avoid/20'
  }
})

const warningBgClass = computed(() => {
  return props.recommendation === 'avoid'
    ? 'bg-avoid-light dark:bg-avoid-dark/20 border border-avoid/20'
    : 'bg-moderate-light dark:bg-moderate-dark/20 border border-moderate/20'
})

const warningTextClass = computed(() => {
  return props.recommendation === 'avoid'
    ? 'text-avoid-dark dark:text-avoid'
    : 'text-moderate-dark dark:text-moderate'
})

const warningItemClass = computed(() => {
  return props.recommendation === 'avoid'
    ? 'text-avoid-dark dark:text-avoid-light'
    : 'text-moderate-dark dark:text-moderate-light'
})

const frequencyText = computed(() => {
  if (props.recommendation === 'recommended') {
    return `${props.frequencyPerWeek}x per week`
  }
  return `${props.frequencyPerMonth}x per month`
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
</script>
