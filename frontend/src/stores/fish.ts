import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { FishSpecies, MercuryLevel, SafetyCategory } from '@/api/types'
import { fishService, type FishDiseaseSuitability } from '@/services/fishService'

export const useFishStore = defineStore('fish', () => {
  const allFish = ref<FishSpecies[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const suitabilityCache = ref<Map<string, FishDiseaseSuitability[]>>(new Map())

  const safeFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'safe'))
  const moderateFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'moderate'))
  const avoidFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'avoid'))

  async function fetchAll() {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await fishService.getAll()
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      allFish.value = data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch fish data'
    } finally {
      isLoading.value = false
    }
  }

  function getById(id: string): FishSpecies | undefined {
    return allFish.value.find(f => f.id === id)
  }

  async function getByIdAsync(id: string): Promise<FishSpecies | null> {
    // First check local cache
    const cached = allFish.value.find(f => f.id === id)
    if (cached) return cached

    // Fetch from database
    const { data, error: fetchError } = await fishService.getById(id)
    if (fetchError) {
      error.value = fetchError.message
      return null
    }
    return data
  }

  function searchByName(query: string): FishSpecies[] {
    const q = query.toLowerCase()
    return allFish.value.filter(f =>
      f.commonName.toLowerCase().includes(q) ||
      f.scientificName.toLowerCase().includes(q)
    )
  }

  async function searchByNameAsync(query: string): Promise<FishSpecies[]> {
    const { data, error: fetchError } = await fishService.searchByName(query)
    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    return data
  }

  function filterByMercury(level: MercuryLevel): FishSpecies[] {
    return allFish.value.filter(f => f.mercuryLevel === level)
  }

  function filterBySafety(category: SafetyCategory): FishSpecies[] {
    return allFish.value.filter(f => f.safetyCategory === category)
  }

  async function getDiseaseSuitability(fishId: string): Promise<FishDiseaseSuitability[]> {
    // Check cache first
    const cached = suitabilityCache.value.get(fishId)
    if (cached) return cached

    const { data, error: fetchError } = await fishService.getDiseaseSuitability(fishId)
    if (fetchError) {
      error.value = fetchError.message
      return []
    }

    // Cache the result
    suitabilityCache.value.set(fishId, data)
    return data
  }

  async function getSuitabilityForCondition(conditionId: string) {
    const { data, error: fetchError } = await fishService.getSuitabilityForCondition(conditionId)
    if (fetchError) {
      error.value = fetchError.message
      return []
    }
    return data
  }

  async function getSuitabilityForConditions(conditionIds: string[]) {
    const { data, error: fetchError } = await fishService.getSuitabilityForConditions(conditionIds)
    if (fetchError) {
      error.value = fetchError.message
      return new Map()
    }
    return data
  }

  return {
    allFish,
    isLoading,
    error,
    safeFish,
    moderateFish,
    avoidFish,
    fetchAll,
    getById,
    getByIdAsync,
    searchByName,
    searchByNameAsync,
    filterByMercury,
    filterBySafety,
    getDiseaseSuitability,
    getSuitabilityForCondition,
    getSuitabilityForConditions,
  }
})
