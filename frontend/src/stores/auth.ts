import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterCredentials } from '@/api/types'
import { authService } from '@/services/authService'
import { useProfilesStore } from './profiles'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  // Promise to track initialization completion (for router guard)
  let initializePromise: Promise<void> | null = null
  let authStateUnsubscribe: (() => void) | null = null

  // Initialize auth state from Supabase session
  async function initialize() {
    // Return existing promise if already initializing
    if (initializePromise) {
      return initializePromise
    }

    // Skip if already initialized
    if (isInitialized.value) {
      return Promise.resolve()
    }

    initializePromise = (async () => {
      isLoading.value = true
      try {
        const { user: sessionUser, error: sessionError } = await authService.getSession()
        if (sessionUser) {
          user.value = sessionUser
          // Load profiles for user (don't block initialization on this)
          const profilesStore = useProfilesStore()
          try {
            await Promise.race([
              profilesStore.loadProfilesFromSupabase(sessionUser.id),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile load timeout')), 10000))
            ])
          } catch (profileError) {
            console.warn('Profile loading failed or timed out:', profileError)
            // Continue anyway - user is authenticated even if profiles fail
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
      } finally {
        isLoading.value = false
        isInitialized.value = true
        
        // Set up auth state listener AFTER initialization
        setupAuthStateListener()
      }
    })()

    return initializePromise
  }

  // Set up the auth state change listener
  function setupAuthStateListener() {
    // Don't set up multiple listeners
    if (authStateUnsubscribe) return
    
    const { data } = authService.onAuthStateChange((authUser) => {
      // Only handle changes after initialization
      if (!isInitialized.value) return
      
      if (authUser && !user.value) {
        user.value = authUser
      } else if (!authUser && user.value) {
        user.value = null
        // Reset profiles on auth state change to logged out
        const profilesStore = useProfilesStore()
        profilesStore.reset()
      }
    })
    
    authStateUnsubscribe = data?.subscription?.unsubscribe || null
  }

  // Wait for auth to be ready (used by router guard)
  async function waitForInit() {
    if (isInitialized.value) return
    await initialize()
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { user: loggedInUser, error: loginError } = await authService.login(credentials)

      if (loginError) {
        error.value = loginError.message || 'Invalid email or password.'
        return false
      }

      if (loggedInUser) {
        user.value = loggedInUser
        
        // Load profiles from Supabase with timeout protection
        const profilesStore = useProfilesStore()
        try {
          await Promise.race([
            profilesStore.loadProfilesFromSupabase(loggedInUser.id),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Profile load timeout')), 10000))
          ])
          
          // Create default profile if none exists
          if (profilesStore.profiles.length === 0) {
            await profilesStore.createDefaultProfileInSupabase(loggedInUser.id, loggedInUser.fullName)
          }
        } catch (profileError) {
          console.warn('Profile loading failed:', profileError)
          // Continue anyway - user is logged in
        }
        
        return true
      }
      
      error.value = 'Login failed.'
      return false
    } catch (e: any) {
      error.value = e.message || 'An unexpected error occurred.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(credentials: RegisterCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { user: newUser, error: registerError } = await authService.register(credentials)

      if (registerError) {
        error.value = registerError.message || 'Registration failed.'
        return false
      }

      if (newUser) {
        user.value = newUser
        
        // Create default profile for new user, but do not block registration if it fails.
        const profilesStore = useProfilesStore()
        try {
          await profilesStore.createDefaultProfileInSupabase(newUser.id, newUser.fullName)
        } catch (profileError) {
          console.warn('Default profile creation failed:', profileError)
        }
        
        return true
      }
      
      error.value = 'Registration failed.'
      return false
    } catch (e: any) {
      error.value = e.message || 'Registration failed.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    isLoading.value = true
    try {
      await authService.logout()
      user.value = null
      
      // Reset profiles on logout
      const profilesStore = useProfilesStore()
      profilesStore.reset()
    } finally {
      isLoading.value = false
    }
  }

  async function resetPassword(email: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { error: resetError } = await authService.resetPassword(email)
      if (resetError) {
        error.value = resetError.message || 'Failed to send reset email.'
        return false
      }
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to send reset email.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(updates: Partial<User>) {
    if (user.value) {
      const { user: updatedUser, error: updateError } = await authService.updateProfile(user.value.id, updates)
      if (updatedUser) {
        user.value = updatedUser
      }
    }
  }

  async function changePassword(newPassword: string): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { error: changeError } = await authService.changePassword(newPassword)
      if (changeError) {
        error.value = changeError.message || 'Failed to change password.'
        return false
      }
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to change password.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount(): Promise<boolean> {
    if (!user.value) return false
    isLoading.value = true
    error.value = null
    try {
      const { error: deleteError } = await authService.deleteAccount(user.value.id)
      if (deleteError) {
        error.value = deleteError.message || 'Failed to delete account.'
        return false
      }
      user.value = null
      const profilesStore = useProfilesStore()
      profilesStore.reset()
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to delete account.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function exportData(): Promise<any> {
    if (!user.value) return null
    const { data, error: exportError } = await authService.exportUserData(user.value.id)
    if (exportError) {
      error.value = exportError.message
      return null
    }
    return data
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    isInitialized,
    initialize,
    waitForInit,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    changePassword,
    deleteAccount,
    exportData,
  }
})
