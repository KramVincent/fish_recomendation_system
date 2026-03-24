import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { HealthProfile } from '@/api/types'
import { profileService } from '@/services/profileService'

export const useProfilesStore = defineStore('profiles', () => {
  const profiles = ref<HealthProfile[]>([])
  const activeProfileId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeProfile = computed(() => {
    return profiles.value.find(p => p.id === activeProfileId.value) || profiles.value.find(p => p.isDefault) || profiles.value[0] || null
  })

  const defaultProfile = computed(() => {
    return profiles.value.find(p => p.isDefault) || null
  })

  const sortedProfiles = computed(() => {
    return [...profiles.value].sort((a, b) => {
      // Default profile first
      if (a.isDefault) return -1
      if (b.isDefault) return 1
      // Then by name
      return a.name.localeCompare(b.name)
    })
  })

  // Load profiles from Supabase
  async function loadProfilesFromSupabase(userId: string) {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await profileService.getProfilesByUserId(userId)
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      profiles.value = data
      
      // Auto-select default profile if no active profile
      if (!activeProfileId.value && data.length > 0) {
        const defaultProf = data.find(p => p.isDefault) || data[0]
        activeProfileId.value = defaultProf.id
      }
    } catch (e: any) {
      error.value = e.message || 'Failed to load profiles'
    } finally {
      isLoading.value = false
    }
  }

    // Create default profile in Supabase
    async function createDefaultProfileInSupabase(userId: string, userName: string) {
      isLoading.value = true
      error.value = null
      try {
        const { data, error: createError } = await profileService.createDefaultProfile(userId, userName)
        if (createError) {
          error.value = createError.message
          return null
        }
        if (data) {
          profiles.value.push(data)
          activeProfileId.value = data.id
        }
        return data
      } catch (e: any) {
        error.value = e.message || 'Failed to create default profile'
        return null
      } finally {
        isLoading.value = false
      }
    }

    // Actions
    function setProfiles(newProfiles: HealthProfile[]) {
      profiles.value = newProfiles
      // Auto-select default profile if no active profile
      if (!activeProfileId.value && newProfiles.length > 0) {
        const defaultProf = newProfiles.find(p => p.isDefault) || newProfiles[0]
        activeProfileId.value = defaultProf.id
      }
    }

    async function addProfile(profile: HealthProfile, userId?: string) {
      if (!userId) {
        error.value = 'User ID is required'
        return null
      }
      // Save to Supabase
      isLoading.value = true
      error.value = null
      try {
        const { data, error: createError } = await profileService.createProfile(userId, profile)
        if (createError) {
          error.value = createError.message
          return null
        }
        if (data) {
          profiles.value.push(data)
          return data
        }
        return null
      } catch (e: any) {
        error.value = e.message || 'Failed to create profile'
        return null
      } finally {
        isLoading.value = false
      }
    }

    async function updateProfile(id: string, updates: Partial<HealthProfile>) {
      isLoading.value = true
      error.value = null
      
      try {
        const { data, error: updateError } = await profileService.updateProfile(id, updates)
        if (updateError) {
          error.value = updateError.message
          return null
        }
        if (data) {
          // Update local state with Supabase response
          const index = profiles.value.findIndex(p => p.id === id)
          if (index !== -1) {
            profiles.value[index] = data
          }
          return data
        }
        return null
      } catch (e: any) {
        error.value = e.message || 'Failed to update profile'
        return null
      } finally {
        isLoading.value = false
      }
    }

    async function deleteProfile(id: string) {
      const profile = profiles.value.find(p => p.id === id)
      // Cannot delete default profile if it's the only one
      if (profile?.isDefault && profiles.value.length === 1) {
        throw new Error('Cannot delete your only profile')
      }

      isLoading.value = true
      error.value = null
      try {
        const { error: deleteError } = await profileService.deleteProfile(id)
        if (deleteError) {
          error.value = deleteError.message
          return
        }
        
        // Remove from local state
        profiles.value = profiles.value.filter(p => p.id !== id)

        // If deleted profile was active, switch to default or first profile
        if (activeProfileId.value === id) {
          const newActive = profiles.value.find(p => p.isDefault) || profiles.value[0]
          activeProfileId.value = newActive?.id || null
        }
      } catch (e: any) {
        error.value = e.message || 'Failed to delete profile'
      } finally {
        isLoading.value = false
      }
    }

    function setActiveProfile(id: string) {
      const profile = profiles.value.find(p => p.id === id)
      if (profile) {
        activeProfileId.value = id
      }
    }

    async function createProfile(data: {
      name: string
      avatarUrl?: string
      conditions?: string[]
      allergies?: string[]
      medications?: string[]
      dietaryPreferences?: string[]
      age?: number
      weight?: number
      height?: number
      pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding'
      notes?: string
    }, userId: string): Promise<HealthProfile | null> {
      isLoading.value = true
      error.value = null
      
      try {
        const profileData: Omit<HealthProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
          name: data.name,
          avatarUrl: data.avatarUrl,
          isDefault: false,
          conditions: data.conditions || [],
          allergies: data.allergies || [],
          medications: data.medications || [],
          dietaryPreferences: data.dietaryPreferences as any[] || [],
          age: data.age,
          weight: data.weight,
          height: data.height,
          pregnancyStatus: data.pregnancyStatus || 'none',
          notes: data.notes,
        }

        const { data: newProfile, error: createError } = await profileService.createProfile(userId, profileData)
        
        if (createError) {
          error.value = createError.message
          return null
        }
        
        if (newProfile) {
          profiles.value.push(newProfile)
          return newProfile
        }
        return null
      } catch (e: any) {
        error.value = e.message || 'Failed to create profile'
        return null
      } finally {
        isLoading.value = false
      }
    }

    function reset() {
      profiles.value = []
      activeProfileId.value = null
      error.value = null
    }

    return {
      // State
      profiles,
      activeProfileId,
      isLoading,
      error,
      
      // Computed
      activeProfile,
      defaultProfile,
      sortedProfiles,
      
      // Actions
      loadProfilesFromSupabase,
      createDefaultProfileInSupabase,
      setProfiles,
      addProfile,
      updateProfile,
      deleteProfile,
      setActiveProfile,
      createProfile,
      reset,
    }
  }
)
