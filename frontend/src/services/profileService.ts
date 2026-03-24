// Health profiles service using backend API
import apiClient from '@/lib/api'
import type { HealthProfile, DietaryPreference } from '@/api/types'

export const profileService = {
  async getProfilesByUserId(userId: string): Promise<{ data: HealthProfile[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<HealthProfile[]>('/api/profiles', { params: { user_id: userId } })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getProfileById(profileId: string): Promise<{ data: HealthProfile | null; error: Error | null }> {
    try {
      const { data } = await apiClient.get<HealthProfile>(`/api/profiles/${profileId}`)
      return { data: data || null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async createProfile(
    userId: string,
    data: Omit<HealthProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<{ data: HealthProfile | null; error: Error | null }> {
    try {
      const payload = {
        userId,
        name: data.name,
        avatarUrl: data.avatarUrl || undefined,
        isDefault: data.isDefault || false,
        conditions: data.conditions || [],
        allergies: data.allergies || [],
        medications: data.medications || [],
        dietaryPreferences: (data.dietaryPreferences as DietaryPreference[]) || [],
        age: data.age,
        weight: data.weight,
        height: data.height,
        pregnancyStatus: data.pregnancyStatus || 'none',
        notes: data.notes,
      }

      const { data: created } = await apiClient.post<HealthProfile>('/api/profiles', payload)
      return { data: created || null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async updateProfile(
    profileId: string,
    updates: Partial<HealthProfile>
  ): Promise<{ data: HealthProfile | null; error: Error | null }> {
    try {
      const payload = {
        name: updates.name,
        avatarUrl: updates.avatarUrl,
        isDefault: updates.isDefault,
        conditions: updates.conditions,
        allergies: updates.allergies,
        medications: updates.medications,
        dietaryPreferences: updates.dietaryPreferences as DietaryPreference[] | undefined,
        age: updates.age,
        weight: updates.weight,
        height: updates.height,
        pregnancyStatus: updates.pregnancyStatus,
        notes: updates.notes,
      }
      const { data } = await apiClient.patch<HealthProfile>(`/api/profiles/${profileId}`, payload)
      return { data: data || null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async deleteProfile(profileId: string): Promise<{ error: Error | null }> {
    try {
      await apiClient.delete(`/api/profiles/${profileId}`)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async setDefaultProfile(userId: string, profileId: string): Promise<{ error: Error | null }> {
    try {
      await apiClient.patch(`/api/profiles/${profileId}`, { isDefault: true })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async createDefaultProfile(userId: string, _userName: string): Promise<{ data: HealthProfile | null; error: Error | null }> {
    return this.createProfile(userId, {
      name: 'My Profile',
      isDefault: true,
      conditions: [],
      allergies: [],
      medications: [],
      dietaryPreferences: [],
      pregnancyStatus: 'none',
    })
  },
}

export default profileService
