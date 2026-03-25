<template>
  <div class="container mx-auto px-4 py-8">
    <Breadcrumb :items="breadcrumbs" />
    
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Is This Fish Safe For You?</h1>
      <p class="text-surface-600 dark:text-surface-400">Upload a photo to check if this fish is safe to eat based on your health profile</p>
    </div>
    
    <!-- Upload Section -->
    <div class="max-w-3xl mx-auto mb-12">
      <ImageUploader @upload="handleUpload" :disabled="identification.isProcessing.value || isLoadingRecommendation" />
      
      <!-- Processing State -->
      <div v-if="identification.isProcessing.value || isLoadingRecommendation" class="mt-8">
        <LoadingSpinner 
          variant="logo" 
          size="lg" 
          :text="isLoadingRecommendation ? 'Analyzing for your health profile...' : 'Identifying fish...'" 
          :subtext="isLoadingRecommendation ? 'Checking safety based on your health conditions' : 'This may take a few seconds'"
        />
      </div>
    </div>
    
    <!-- Safety Results -->
    <div v-if="safetyResults.length > 0 && !identification.isProcessing.value && !isLoadingRecommendation" class="max-w-4xl mx-auto animate-fade-in">
      <h2 class="text-2xl font-bold text-surface-900 dark:text-white mb-6">Safety Analysis Results</h2>
      
      <!-- Profile Info Banner -->
      <div v-if="profilesStore.activeProfile" class="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <p class="text-sm text-primary-700 dark:text-primary-300">
              Results personalized for: <span class="font-semibold">{{ profilesStore.activeProfile.name }}</span>
            </p>
            <p v-if="profilesStore.activeProfile.conditions.length > 0" class="text-xs text-primary-600 dark:text-primary-400">
              Based on {{ profilesStore.activeProfile.conditions.length }} health condition(s)
            </p>
          </div>
          <router-link to="/health-profile" class="ml-auto text-xs text-primary-600 dark:text-primary-400 hover:underline">
            Change profile
          </router-link>
        </div>
      </div>
      
      <!-- Safety Result Cards -->
      <div class="space-y-6 mb-8">
        <FishSafetyResultCard
          v-for="result in safetyResults"
          :key="result.species.id"
          :species="result.species"
          :local-image-url="result.localImageUrl"
          :recommendation="result.recommendation"
          :reasoning="result.reasoning"
          :confidence="result.confidence"
          :serving-size="result.servingSize"
          :frequency-per-week="result.frequencyPerWeek"
          :frequency-per-month="result.frequencyPerMonth"
          :benefits="result.benefits"
          :warnings="result.warnings"
          :alternatives="result.alternatives"
          :preparation-tips="result.preparationTips"
        />
      </div>
      
      <!-- Processing Time -->
      <div class="text-center text-sm text-surface-500 dark:text-surface-400">
        Analysis completed in {{ identification.currentResult.value?.result?.processingTime || 0 }}ms
      </div>
      
      <!-- Actions -->
      <div class="mt-8 flex justify-center gap-4">
        <BaseButton variant="primary" size="lg" @click="handleNewUpload">
          Check Another Fish
        </BaseButton>
        <router-link to="/recommendations">
          <BaseButton variant="secondary" size="lg">
            View All Recommendations
          </BaseButton>
        </router-link>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!identification.isProcessing.value && !isLoadingRecommendation" class="max-w-2xl mx-auto text-center py-12">
      <svg class="h-24 w-24 mx-auto text-surface-300 dark:text-surface-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <h3 class="text-xl font-semibold text-surface-900 dark:text-white mb-2">Check If Fish Is Safe For You</h3>
      <p class="text-surface-600 dark:text-surface-400 mb-4">Upload a fish image to see if it's safe to eat based on your health profile</p>
      
      <!-- Profile reminder -->
      <div v-if="profilesStore.activeProfile?.conditions.length === 0" class="inline-flex items-center gap-2 px-4 py-2 bg-moderate-light dark:bg-moderate-dark/20 rounded-lg text-sm">
        <svg class="w-4 h-4 text-moderate" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-surface-700 dark:text-surface-300">
          <router-link to="/health-profile" class="text-primary-600 dark:text-primary-400 hover:underline font-medium">Add health conditions</router-link>
          for personalized recommendations
        </span>
      </div>
    </div>
    
    <!-- Recent Uploads -->
    <div v-if="uploadStore.uploadHistory.length > 0" class="max-w-6xl mx-auto mt-16">
      <h3 class="text-xl font-bold text-surface-900 dark:text-white mb-4">Recent Uploads</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div
          v-for="upload in uploadStore.uploadHistory.slice(0, 6)"
          :key="upload.id"
          class="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary-500 transition-all transform hover:scale-105 hover:-translate-y-1"
          @click="viewUpload(upload)"
        >
          <img :src="upload.previewUrl" alt="Previous upload" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
            <p class="text-white text-xs font-medium truncate">
              {{ upload.result?.predictions[0]?.speciesName || 'Processing' }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useFishIdentification } from '@/composables/useFishIdentification'
import { useUploadStore } from '@/stores/upload'
import { useFishStore } from '@/stores/fish'
import { useAuthStore } from '@/stores/auth'
import { useProfilesStore } from '@/stores/profiles'
import { useNotificationStore } from '@/stores/notifications'
import type { ImageUpload, FishSpecies, FishPrediction } from '@/api/types'
import ImageUploader from '@/components/features/ImageUploader.vue'
import FishSafetyResultCard from '@/components/features/FishSafetyResultCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'

const identification = useFishIdentification()
const uploadStore = useUploadStore()
const fishStore = useFishStore()
const authStore = useAuthStore()
const profilesStore = useProfilesStore()
const notificationStore = useNotificationStore()

const breadcrumbs = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Check Fish Safety' },
]

// Local fish image mapping
const localFishImages: Record<string, string> = {
  'Milkfish': '/Milkfish.jpg',
  'Tilapia': '/Tilapia.jpg',
  'Mackerel': '/Mackerel.avif',
  'Sardines': '/Sardines.jfif',
  'Sardine': '/Sardines.jfif',
  'Bullet Tuna': '/Bullet Tuna.jpg',
  'Bullet tuna': '/Bullet Tuna.jpg',
}

function getLocalImageUrl(fishName: string): string | null {
  // Check exact match first
  if (localFishImages[fishName]) {
    return localFishImages[fishName]
  }
  // Check case-insensitive match
  const lowerName = fishName.toLowerCase()
  for (const [key, value] of Object.entries(localFishImages)) {
    if (key.toLowerCase() === lowerName) {
      return value
    }
  }
  return null
}

// Safety results state
interface SafetyResult {
  species: FishSpecies
  localImageUrl?: string
  recommendation: 'recommended' | 'caution' | 'avoid'
  reasoning: string
  confidence: number
  servingSize: string
  frequencyPerWeek: number
  frequencyPerMonth: number
  benefits: string[]
  warnings: string[]
  alternatives: string[]
  preparationTips: string[]
}

const safetyResults = ref<SafetyResult[]>([])
const isLoadingRecommendation = ref(false)

// Generate safety recommendation based on fish and user's health conditions
async function resolveFishFromPrediction(prediction: FishPrediction): Promise<FishSpecies | null> {
  let fish: FishSpecies | null = null

  if (prediction.speciesId) {
    fish = fishStore.getById(prediction.speciesId) || await fishStore.getByIdAsync(prediction.speciesId)
  }

  // Fallback if speciesId is missing/unmapped: match by name from fish catalog.
  if (!fish) {
    if (fishStore.allFish.length === 0) {
      await fishStore.fetchAll()
    }
    const normalized = (prediction.speciesName || '').trim().toLowerCase()
    fish =
      fishStore.allFish.find((f) => f.commonName.trim().toLowerCase() === normalized) ||
      fishStore.allFish.find((f) => f.scientificName.trim().toLowerCase() === normalized) ||
      null
  }

  return fish
}

async function generateSafetyResult(prediction: FishPrediction): Promise<SafetyResult | null> {
  const fish = await resolveFishFromPrediction(prediction)
  if (!fish) return null

  // Get local image if available
  const localImageUrl = getLocalImageUrl(fish.commonName)

  const profile = profilesStore.activeProfile
  const conditionIds = profile?.conditions || []
  const fishId = fish.id

  // Get suitability data for this fish based on conditions
  let recommendation: 'recommended' | 'caution' | 'avoid' = 'recommended'
  let reasoning = ''
  let warnings: string[] = []
  let benefits: string[] = []
  let servingSize = '100-150g'
  let frequencyPerWeek = 2
  let frequencyPerMonth = 8
  let alternatives: string[] = []
  let preparationTips: string[] = []

  if (conditionIds.length > 0) {
    // Get suitability info from store
    const suitabilities = await fishStore.getDiseaseSuitability(fishId)
    const relevantSuitabilities = suitabilities.filter(s => conditionIds.includes(s.conditionId))

    if (relevantSuitabilities.length > 0) {
      // Determine worst-case recommendation
      const hasAvoid = relevantSuitabilities.some(s => s.suitability === 'avoid')
      const hasModerate = relevantSuitabilities.some(s => s.suitability === 'moderate')

      if (hasAvoid) {
        recommendation = 'avoid'
        const avoidReasons = relevantSuitabilities.filter(s => s.suitability === 'avoid')
        reasoning = avoidReasons.map(s => s.clinicalRationale).join(' ')
        warnings = avoidReasons.flatMap(s => [s.clinicalRationale])
        alternatives = avoidReasons.flatMap(s => s.alternatives).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3)
        servingSize = 'Not recommended'
        frequencyPerWeek = 0
        frequencyPerMonth = 0
      } else if (hasModerate) {
        recommendation = 'caution'
        const moderateReasons = relevantSuitabilities.filter(s => s.suitability === 'moderate')
        reasoning = moderateReasons.map(s => s.clinicalRationale).join(' ')
        warnings = moderateReasons.flatMap(s => [s.clinicalRationale])
        const portionRec = moderateReasons[0]?.portionRecommendation
        if (portionRec) {
          servingSize = portionRec.split(',')[0] || '80-100g'
        }
        frequencyPerWeek = 1
        frequencyPerMonth = 4
      } else {
        recommendation = 'recommended'
        const recommendedReasons = relevantSuitabilities.filter(s => s.suitability === 'recommended')
        reasoning = recommendedReasons.map(s => s.clinicalRationale).join(' ') || generateDefaultReasoning(fish, true)
        benefits = generateBenefits(fish, conditionIds)
        const portionRec = recommendedReasons[0]?.portionRecommendation
        if (portionRec) {
          servingSize = portionRec.split(',')[0] || '100-150g'
        }
      }
    } else {
      // No specific suitability data - base on mercury level
      const result = getDefaultRecommendation(fish)
      recommendation = result.recommendation
      reasoning = result.reasoning
      warnings = result.warnings
      benefits = generateBenefits(fish, conditionIds)
      servingSize = result.servingSize
      frequencyPerWeek = result.frequencyPerWeek
      frequencyPerMonth = result.frequencyPerMonth
    }
  } else {
    // No health conditions set - provide general recommendation based on mercury
    const result = getDefaultRecommendation(fish)
    recommendation = result.recommendation
    reasoning = result.reasoning
    warnings = result.warnings
    benefits = generateBenefits(fish, [])
    servingSize = result.servingSize
    frequencyPerWeek = result.frequencyPerWeek
    frequencyPerMonth = result.frequencyPerMonth
  }

  // Add preparation tips based on fish
  preparationTips = generatePreparationTips(fish)

  return {
    species: fish,
    localImageUrl: localImageUrl || undefined,
    recommendation,
    reasoning: reasoning || generateDefaultReasoning(fish, recommendation === 'recommended'),
    confidence: prediction.confidence,
    servingSize,
    frequencyPerWeek,
    frequencyPerMonth,
    benefits,
    warnings,
    alternatives,
    preparationTips,
  }
}

function getDefaultRecommendation(fish: FishSpecies) {
  const mercury = fish.mercuryLevel
  
  if (mercury === 'very-low' || mercury === 'low') {
    return {
      recommendation: 'recommended' as const,
      reasoning: `${fish.commonName} has ${mercury === 'very-low' ? 'very low' : 'low'} mercury levels, making it a safe choice. It provides good nutritional value with ${fish.nutrition.omega3}mg of omega-3 fatty acids per serving.`,
      warnings: [],
      servingSize: '100-150g',
      frequencyPerWeek: 2,
      frequencyPerMonth: 8,
    }
  } else if (mercury === 'moderate') {
    return {
      recommendation: 'caution' as const,
      reasoning: `${fish.commonName} has moderate mercury levels. While nutritious, consumption should be limited to avoid mercury accumulation.`,
      warnings: ['Contains moderate mercury levels - limit consumption', 'Pregnant women and children should consume less frequently'],
      servingSize: '80-100g',
      frequencyPerWeek: 1,
      frequencyPerMonth: 4,
    }
  } else {
    return {
      recommendation: 'avoid' as const,
      reasoning: `${fish.commonName} has ${mercury === 'very-high' ? 'very high' : 'high'} mercury content which can accumulate in the body and cause health issues over time.`,
      warnings: ['High mercury content can cause neurological issues', 'Not recommended for pregnant women, nursing mothers, or children', 'Long-term consumption may lead to mercury toxicity'],
      servingSize: 'Not recommended',
      frequencyPerWeek: 0,
      frequencyPerMonth: 0,
    }
  }
}

function generateDefaultReasoning(fish: FishSpecies, isSafe: boolean): string {
  if (isSafe) {
    return `${fish.commonName} is a nutritious choice with ${fish.nutrition.protein}g protein and ${fish.nutrition.omega3}mg omega-3 fatty acids per 100g. Its ${fish.mercuryLevel} mercury level makes it safe for regular consumption.`
  }
  return `Based on the mercury content and nutritional profile of ${fish.commonName}, consumption should be monitored.`
}

function generateBenefits(fish: FishSpecies, conditionIds: string[]): string[] {
  const benefits: string[] = []
  
  if (fish.nutrition.omega3 > 500) {
    benefits.push(`High in omega-3 fatty acids (${fish.nutrition.omega3}mg) - supports heart and brain health`)
  } else if (fish.nutrition.omega3 > 200) {
    benefits.push(`Good source of omega-3 fatty acids (${fish.nutrition.omega3}mg)`)
  }
  
  if (fish.nutrition.protein > 20) {
    benefits.push(`Excellent protein source (${fish.nutrition.protein}g per 100g)`)
  }
  
  if (fish.nutrition.vitaminD > 5) {
    benefits.push('Rich in Vitamin D for bone health')
  }
  
  if (fish.nutrition.vitaminB12 > 2) {
    benefits.push('Good source of Vitamin B12 for energy and nervous system')
  }
  
  if (fish.mercuryLevel === 'very-low') {
    benefits.push('Very low mercury - safe for frequent consumption')
  }
  
  return benefits
}

function generatePreparationTips(fish: FishSpecies): string[] {
  const tips: string[] = []
  
  if (fish.preparationMethods.includes('grilled')) {
    tips.push('Grilling preserves nutrients and adds great flavor')
  }
  if (fish.preparationMethods.includes('steamed')) {
    tips.push('Steaming is the healthiest cooking method')
  }
  if (fish.preparationMethods.includes('baked')) {
    tips.push('Baking with herbs reduces the need for added fats')
  }
  
  tips.push('Avoid deep frying to maintain nutritional benefits')
  tips.push('Cook to internal temperature of 63°C (145°F)')
  
  return tips.slice(0, 4)
}

async function handleUpload(file: File) {
  const activeProfile = profilesStore.activeProfile
  if (!activeProfile || activeProfile.conditions.length === 0) {
    notificationStore.warning(
      'Health profile required',
      'Please select at least one health condition before identifying fish.'
    )
    safetyResults.value = []
    return
  }

  safetyResults.value = []
  
  const upload = await identification.identifyFish(file)
  
  if (upload?.result?.predictions) {
    isLoadingRecommendation.value = true
    
    try {
      const [topPrediction] = [...upload.result.predictions].sort(
        (a, b) => b.confidence - a.confidence
      )
      if (!topPrediction) {
        safetyResults.value = []
        return
      }

      const result = await generateSafetyResult(topPrediction)
      safetyResults.value = result ? [result] : []
    } finally {
      isLoadingRecommendation.value = false
    }
  }
}

function handleNewUpload() {
  identification.clearResult()
  safetyResults.value = []
}

function viewUpload(upload: ImageUpload) {
  identification.currentResult.value = upload
  // Re-generate safety results for this upload
  if (upload.result?.predictions) {
    handleReprocessUpload(upload)
  }
}

async function handleReprocessUpload(upload: ImageUpload) {
  if (!upload.result?.predictions) return

  const activeProfile = profilesStore.activeProfile
  if (!activeProfile || activeProfile.conditions.length === 0) {
    safetyResults.value = []
    return
  }
  
  isLoadingRecommendation.value = true
  
  try {
    const [topPrediction] = [...upload.result.predictions].sort(
      (a, b) => b.confidence - a.confidence
    )
    if (!topPrediction) {
      safetyResults.value = []
      return
    }

    const result = await generateSafetyResult(topPrediction)
    safetyResults.value = result ? [result] : []
  } finally {
    isLoadingRecommendation.value = false
  }
}

// Load fish data on mount
onMounted(async () => {
  await fishStore.fetchAll()
  if (authStore.user) {
    await uploadStore.loadHistory(authStore.user.id)
    await profilesStore.loadProfilesFromSupabase(authStore.user.id)
  }
})

// Re-generate recommendations when profile changes
watch(() => profilesStore.activeProfile, async () => {
  if (identification.currentResult.value?.result?.predictions) {
    await handleReprocessUpload(identification.currentResult.value)
  }
})
</script>
