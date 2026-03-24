// Fish species service using backend API
import apiClient from '@/lib/api'
import type { FishSpecies, MercuryLevel } from '@/api/types'

export interface FishDiseaseSuitability {
  fishId: string
  conditionId: string
  suitability: 'recommended' | 'moderate' | 'avoid'
  portionRecommendation: string
  clinicalRationale: string
  alternatives: string[]
}

export const fishService = {
  async getAll(): Promise<{ data: FishSpecies[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishSpecies[]>('/api/fish')
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getById(id: string): Promise<{ data: FishSpecies | null; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishSpecies[]>('/api/fish')
      const fish = (data || []).find((item) => item.id === id) || null
      return { data: fish, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async searchByName(query: string): Promise<{ data: FishSpecies[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishSpecies[]>('/api/fish', { params: { q: query } })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getByMercuryLevel(level: MercuryLevel): Promise<{ data: FishSpecies[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishSpecies[]>('/api/fish', {
        params: { mercury_level: level },
      })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getDiseaseSuitability(
    fishId: string
  ): Promise<{ data: FishDiseaseSuitability[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishDiseaseSuitability[]>(
        `/api/fish/${fishId}/suitability`
      )
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getSuitabilityForCondition(
    _conditionId: string
  ): Promise<{ data: (FishDiseaseSuitability & { fish: FishSpecies })[]; error: Error | null }> {
    return { data: [], error: null }
  },

  async getMultimorbidityRecommendations(
    diseaseCombination: string
  ): Promise<{ data: any[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<any[]>('/api/fish/multimorbidity', {
        params: { combination: diseaseCombination },
      })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getSuitabilityForConditions(
    _conditionIds: string[]
  ): Promise<{ data: Map<string, FishDiseaseSuitability[]>; error: Error | null }> {
    return { data: new Map(), error: null }
  },
}

export default fishService
