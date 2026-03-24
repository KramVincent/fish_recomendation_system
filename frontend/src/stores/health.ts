import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserHealthProfile, HealthCondition } from '@/api/types'
import { healthService } from '@/services/healthService'

export const useHealthStore = defineStore('health', () => {
  const profile = ref<UserHealthProfile | null>(null)
  const allConditions = ref<HealthCondition[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const hasProfile = computed(() => !!profile.value)
  const selectedConditions = computed(() => {
    if (!profile.value) return []
    return allConditions.value.filter(c => profile.value!.conditions.includes(c.id))
  })

  async function fetchConditions() {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await healthService.getAllConditions()
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      allConditions.value = data
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch health conditions'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfile(userId: string) {
    isLoading.value = true
    error.value = null
    try {
      // This will now be handled by profiles store
      // Left for backward compatibility
      await fetchConditions()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch profile'
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(updates: Partial<UserHealthProfile>) {
    isLoading.value = true
    error.value = null
    try {
      if (profile.value) {
        profile.value = { ...profile.value, ...updates, updatedAt: new Date().toISOString() }
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to update profile'
    } finally {
      isLoading.value = false
    }
  }

  async function addCondition(conditionId: string) {
    if (profile.value && !profile.value.conditions.includes(conditionId)) {
      await updateProfile({ conditions: [...profile.value.conditions, conditionId] })
    }
  }

  async function removeCondition(conditionId: string) {
    if (profile.value) {
      await updateProfile({ conditions: profile.value.conditions.filter(id => id !== conditionId) })
    }
  }

  async function getConditionById(id: string): Promise<HealthCondition | null> {
    // First check local cache
    const cached = allConditions.value.find(c => c.id === id)
    if (cached) return cached

    // Fetch from database
    const { data, error: fetchError } = await healthService.getConditionById(id)
    if (fetchError) {
      error.value = fetchError.message
      return null
    }
    return data
  }

  async function getConditionsByIds(ids: string[]): Promise<HealthCondition[]> {
    // First try to get from local cache
    const cachedConditions = allConditions.value.filter(c => ids.includes(c.id))
    if (cachedConditions.length === ids.length) {
      return cachedConditions
    }

    // Fetch missing from database
    const { data, error: fetchError } = await healthService.getConditionsByIds(ids)
    if (fetchError) {
      error.value = fetchError.message
      return cachedConditions
    }
    return data
  }

  function getConditionName(conditionId: string): string {
    const condition = allConditions.value.find(c => c.id === conditionId)
    return condition?.name || conditionId
  }

  return {
    profile,
    allConditions,
    isLoading,
    error,
    hasProfile,
    selectedConditions,
    fetchConditions,
    fetchProfile,
    updateProfile,
    addCondition,
    removeCondition,
    getConditionById,
    getConditionsByIds,
    getConditionName,
  }
})
