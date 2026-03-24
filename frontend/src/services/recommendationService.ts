// Recommendations service using backend API
import apiClient from '@/lib/api'
import type { FishRecommendation, FishSpecies, SafetyCategory, RecommendationSummary } from '@/api/types'
import { fishService } from './fishService'
import { profileService } from './profileService'
import { healthService } from './healthService'

export const recommendationService = {
  async getRecommendations(
    userId: string,
    profileId?: string
  ): Promise<{ data: FishRecommendation[]; error: Error | null }> {
    try {
      if (!profileId) return { data: [], error: null }
      const { data } = await apiClient.get<FishRecommendation[]>('/api/recommendations', {
        params: { user_id: userId, profile_id: profileId },
      })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async generateRecommendations(
    userId: string,
    profileId: string
  ): Promise<{ data: FishRecommendation[]; error: Error | null }> {
    try {
      const { data: profile } = await profileService.getProfileById(profileId)
      const conditionIds = profile?.conditions || []
      if (conditionIds.length === 0) {
        return { data: [], error: null }
      }

      const { data: allFish, error: fishError } = await fishService.getAll()
      if (fishError) throw fishError

      const generated: FishRecommendation[] = []
      // If multiple conditions, check multimorbidity table for overrides
      let multimorbidityMap: Map<string, { suitability: string; portionRecommendation: string; clinicalRationale: string; alternatives: string[] }> | null = null
      if (conditionIds.length > 1) {
        const { data: conditions } = await healthService.getConditionsByIds(conditionIds)
        if (conditions.length > 1) {
          const combo = conditions.map((c) => c.name).sort().join(' + ')
          const { data: multiRows } = await fishService.getMultimorbidityRecommendations(combo)
          multimorbidityMap = new Map(
            (multiRows || []).map((row: any) => [row.fishId, row])
          )
        }
      }

      for (const fish of allFish) {
        let safety: SafetyCategory = mapMercuryToSafety(fish.mercuryLevel)
        let reasoning = `Based on mercury level: ${fish.mercuryLevel}`
        let servingSize = safety === 'safe' ? '100-150g' : safety === 'moderate' ? '80-100g' : 'N/A'
        let frequencyPerWeek = safety === 'safe' ? 2 : safety === 'moderate' ? 1 : 0
        let frequencyPerMonth = frequencyPerWeek * 4
        let alternatives: string[] = []

        if (conditionIds.length > 0) {
          const { data: suitability } = await fishService.getDiseaseSuitability(fish.id)
          const relevant = suitability.filter((s) => conditionIds.includes(s.conditionId))
          if (relevant.length > 0) {
            if (relevant.some((r) => r.suitability === 'avoid')) safety = 'avoid'
            else if (relevant.some((r) => r.suitability === 'moderate')) safety = 'moderate'
            else safety = 'safe'

            const first = relevant[0]
            reasoning = relevant.map((r) => r.clinicalRationale).filter(Boolean).join(' ')
            alternatives = first?.alternatives || []
            if (first?.portionRecommendation) {
              const parsed = parsePortion(first.portionRecommendation, safety)
              servingSize = parsed.servingSize
              frequencyPerWeek = parsed.frequencyPerWeek
              frequencyPerMonth = parsed.frequencyPerMonth
            }
          }
        }

        if (multimorbidityMap?.has(fish.id)) {
          const multi = multimorbidityMap.get(fish.id)
          if (multi) {
            safety = multi.suitability === 'avoid' ? 'avoid' : multi.suitability === 'moderate' ? 'moderate' : 'safe'
            reasoning = multi.clinicalRationale || reasoning
            alternatives = (multi.alternatives || []).slice(0, 3)
            if (multi.portionRecommendation) {
              const parsed = parsePortion(multi.portionRecommendation, safety)
              servingSize = parsed.servingSize
              frequencyPerWeek = parsed.frequencyPerWeek
              frequencyPerMonth = parsed.frequencyPerMonth
            }
          }
        }

        generated.push({
          id: `rec-${crypto.randomUUID()}`,
          userId,
          speciesId: fish.id,
          species: fish,
          safetyCategory: safety,
          servingSize,
          frequencyPerWeek,
          frequencyPerMonth,
          preparationTips: getPreparationTips(fish, safety),
          warnings: safety === 'avoid' ? ['Not recommended for your health conditions'] : [],
          alternatives,
          reasoning,
          createdAt: new Date().toISOString(),
        })
      }

      await apiClient.post('/api/recommendations', {
        userId,
        profileId,
        recommendations: generated.map((rec) => ({
          speciesId: rec.speciesId,
          safetyCategory: rec.safetyCategory,
          servingSize: rec.servingSize,
          frequencyPerWeek: rec.frequencyPerWeek,
          frequencyPerMonth: rec.frequencyPerMonth,
          preparationTips: rec.preparationTips,
          warnings: rec.warnings,
          alternatives: rec.alternatives,
          reasoning: rec.reasoning,
        })),
      })
      return { data: generated, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getSummary(
    userId: string,
    profileId?: string
  ): Promise<{ data: RecommendationSummary | null; error: Error | null }> {
    try {
      if (!profileId) {
        return {
          data: { safe: [], moderate: [], avoid: [], totalAnalyzed: 0, lastUpdated: new Date().toISOString() },
          error: null,
        }
      }
      const { data: recommendations } = await apiClient.get<FishRecommendation[]>('/api/recommendations', {
        params: { user_id: userId, profile_id: profileId },
      })
      const recs = recommendations || []
      return {
        data: {
          safe: recs.filter((r) => r.safetyCategory === 'safe'),
          moderate: recs.filter((r) => r.safetyCategory === 'moderate'),
          avoid: recs.filter((r) => r.safetyCategory === 'avoid'),
          totalAnalyzed: recs.length,
          lastUpdated: new Date().toISOString(),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getById(recommendationId: string): Promise<{ data: FishRecommendation | null; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishRecommendation>(`/api/recommendations/${recommendationId}`)
      return { data: data || null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getBySpecies(
    userId: string,
    profileId: string,
    fishId: string
  ): Promise<{ data: FishRecommendation | null; error: Error | null }> {
    try {
      const { data } = await apiClient.get<FishRecommendation | null>('/api/recommendations/by-species', {
        params: { user_id: userId, profile_id: profileId, fish_id: fishId },
      })
      return { data: data || null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },
}

function mapMercuryToSafety(level: string): SafetyCategory {
  if (level === 'very-low' || level === 'low') return 'safe'
  if (level === 'moderate') return 'moderate'
  return 'avoid'
}

function parsePortion(
  text: string,
  fallback: SafetyCategory
): { servingSize: string; frequencyPerWeek: number; frequencyPerMonth: number } {
  if (!text || fallback === 'avoid' || text.includes('0')) {
    return { servingSize: 'N/A', frequencyPerWeek: 0, frequencyPerMonth: 0 }
  }
  const servingMatch = text.match(/(\d+\s*-\s*\d+|\d+)\s*g/i)
  const freqMatch = text.match(/(\d+)\s*[-xX]?\s*(\d+)?\s*(?:\/\s*)?(week|month)/i)

  const servingSize = servingMatch ? `${servingMatch[1]}g` : '100g'
  let frequencyPerWeek = fallback === 'safe' ? 2 : 1
  let frequencyPerMonth = frequencyPerWeek * 4

  if (freqMatch) {
    const unit = freqMatch[3].toLowerCase()
    const val = Number(freqMatch[1]) || frequencyPerWeek
    if (unit === 'month') {
      frequencyPerMonth = val
      frequencyPerWeek = Math.max(1, Math.ceil(val / 4))
    } else {
      frequencyPerWeek = val
      frequencyPerMonth = val * 4
    }
  }

  return { servingSize, frequencyPerWeek, frequencyPerMonth }
}

function getPreparationTips(fish: FishSpecies, safety: SafetyCategory): string[] {
  if (safety === 'avoid') return []
  const tips = ['Prefer grilling, steaming, or baking over frying']
  if (safety === 'moderate') tips.push('Keep portions small and avoid extra salt')
  if (fish.preparationMethods?.length) {
    tips.push(`Best methods: ${fish.preparationMethods.slice(0, 3).join(', ')}`)
  }
  return tips
}

export default recommendationService
