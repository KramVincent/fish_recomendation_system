import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FishRecommendation, RecommendationSummary } from '@/api/types'
import { recommendationService } from '@/services/recommendationService'

export const useRecommendationStore = defineStore('recommendations', () => {
  const recommendations = ref<FishRecommendation[]>([])
  const summary = ref<RecommendationSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const safeList = computed(() => recommendations.value.filter(r => r.safetyCategory === 'safe'))
  const moderateList = computed(() => recommendations.value.filter(r => r.safetyCategory === 'moderate'))
  const avoidList = computed(() => recommendations.value.filter(r => r.safetyCategory === 'avoid'))

  const totalSafe = computed(() => safeList.value.length)
  const totalModerate = computed(() => moderateList.value.length)
  const totalAvoid = computed(() => avoidList.value.length)

  async function fetchRecommendations(userId: string, profileId?: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await recommendationService.getRecommendations(userId, profileId)
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      recommendations.value = data
      updateSummary(data)
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch recommendations'
    } finally {
      isLoading.value = false
    }
  }

  function updateSummary(data: FishRecommendation[]) {
    summary.value = {
      safe: data.filter(r => r.safetyCategory === 'safe'),
      moderate: data.filter(r => r.safetyCategory === 'moderate'),
      avoid: data.filter(r => r.safetyCategory === 'avoid'),
      totalAnalyzed: data.length,
      lastUpdated: new Date().toISOString(),
    }
  }

  async function generateRecommendations(userId: string, profileId: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: genError } = await recommendationService.generateRecommendations(userId, profileId)
      if (genError) {
        error.value = genError.message
        return
      }
      recommendations.value = data
      updateSummary(data)
    } catch (e: any) {
      error.value = e.message || 'Failed to generate recommendations'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSummary(userId: string, profileId?: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await recommendationService.getSummary(userId, profileId)
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      if (data) {
        summary.value = data
        recommendations.value = [...data.safe, ...data.moderate, ...data.avoid]
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch summary'
    } finally {
      isLoading.value = false
    }
  }

  function getById(id: string): FishRecommendation | undefined {
    return recommendations.value.find(r => r.id === id)
  }

  function getBySpecies(speciesId: string): FishRecommendation | undefined {
    return recommendations.value.find(r => r.speciesId === speciesId)
  }

  async function getBySpeciesAsync(userId: string, profileId: string, fishId: string): Promise<FishRecommendation | null> {
    // First check local cache
    const cached = recommendations.value.find(r => r.speciesId === fishId)
    if (cached) return cached

    // Fetch from database
    const { data, error: fetchError } = await recommendationService.getBySpecies(userId, profileId, fishId)
    if (fetchError) {
      error.value = fetchError.message
      return null
    }
    return data
  }

  return {
    recommendations,
    summary,
    isLoading,
    error,
    safeList,
    moderateList,
    avoidList,
    totalSafe,
    totalModerate,
    totalAvoid,
    fetchRecommendations,
    generateRecommendations,
    fetchSummary,
    getById,
    getBySpecies,
    getBySpeciesAsync,
  }
})
