// Health conditions service using backend API
import apiClient from '@/lib/api'
import type { HealthCondition, HealthConditionCategory } from '@/api/types'

interface ApiHealthCondition {
  id: string
  name: string
  category: HealthConditionCategory
  description: string
  icon: string
}

const ALLOWED_CONDITIONS = new Set(['hypertension', 'diabetes', 'ckd', 'copd', 'asthma'])

function normalizeName(name: string): string {
  return name.trim().toLowerCase()
}

function formatCondition(condition: ApiHealthCondition): HealthCondition {
  const normalized = normalizeName(condition.name)
  let displayName = condition.name

  if (normalized === 'ckd') {
    displayName = 'Chronic Kidney Disease (CKD)'
  } else if (normalized === 'copd') {
    displayName = 'Chronic Obstructive Pulmonary Disease (COPD)'
  }

  return {
    ...condition,
    name: displayName,
  }
}

function onlyAllowed(conditions: ApiHealthCondition[]): HealthCondition[] {
  return conditions
    .filter((item) => ALLOWED_CONDITIONS.has(normalizeName(item.name)))
    .map(formatCondition)
}

export const healthService = {
  // Get all health conditions
  async getAllConditions(): Promise<{ data: HealthCondition[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<ApiHealthCondition[]>('/api/health-conditions')
      const conditions = onlyAllowed(data || [])
      return { data: conditions, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // Get condition by ID
  async getConditionById(id: string): Promise<{ data: HealthCondition | null; error: Error | null }> {
    try {
      const { data } = await apiClient.get<ApiHealthCondition[]>('/api/health-conditions')
      const condition = onlyAllowed(data || []).find((item) => item.id === id) || null
      return { data: condition, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  // Get conditions by category
  async getConditionsByCategory(
    category: HealthConditionCategory
  ): Promise<{ data: HealthCondition[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<ApiHealthCondition[]>('/api/health-conditions')
      const conditions = onlyAllowed(data || []).filter((item) => item.category === category)
      return { data: conditions, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // Get conditions by IDs
  async getConditionsByIds(ids: string[]): Promise<{ data: HealthCondition[]; error: Error | null }> {
    try {
      if (ids.length === 0) return { data: [], error: null }

      const { data } = await apiClient.get<ApiHealthCondition[]>('/api/health-conditions')
      const idSet = new Set(ids)
      const conditions = onlyAllowed(data || []).filter((item) => idSet.has(item.id))
      return { data: conditions, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  // Search conditions
  async searchConditions(query: string): Promise<{ data: HealthCondition[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<ApiHealthCondition[]>('/api/health-conditions')
      const q = query.toLowerCase().trim()
      const conditions = onlyAllowed(data || []).filter(
        (item) =>
          item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      )
      return { data: conditions, error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },
}

export default healthService
