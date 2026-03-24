// Authentication service using local backend API
import apiClient from '@/lib/api'
import type { User as AppUser, LoginCredentials, RegisterCredentials } from '@/api/types'

export interface AuthResponse {
  user: AppUser | null
  error: Error | null
}

const AUTH_USER_KEY = 'auth_user'
const listeners = new Set<(user: AppUser | null) => void>()

function persistUser(user: AppUser | null) {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_USER_KEY)
  }
  listeners.forEach((cb) => cb(user))
}

function getPersistedUser(): AppUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AppUser
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export const authService = {
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<{ user: AppUser }>('/api/auth/register', credentials)
      const user = data.user
      persistUser(user)
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.post<{ user: AppUser }>('/api/auth/login', credentials)
      const user = data.user
      persistUser(user)
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async logout(): Promise<{ error: Error | null }> {
    try {
      persistUser(null)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async getSession(): Promise<AuthResponse> {
    try {
      return { user: getPersistedUser(), error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async resetPassword(_email: string): Promise<{ error: Error | null }> {
    return { error: new Error('Reset password is not implemented in local development mode') }
  },

  async updateProfile(userId: string, updates: Partial<AppUser>): Promise<AuthResponse> {
    try {
      const { data } = await apiClient.patch<{ user: AppUser }>(`/api/auth/users/${userId}`, {
        fullName: updates.fullName,
        avatarUrl: updates.avatarUrl,
      })
      persistUser(data.user)
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  onAuthStateChange(callback: (user: AppUser | null) => void) {
    listeners.add(callback)
    callback(getPersistedUser())
    return {
      data: {
        subscription: {
          unsubscribe: () => listeners.delete(callback),
        },
      },
    }
  },

  async changePassword(newPassword: string): Promise<{ error: Error | null }> {
    try {
      const current = getPersistedUser()
      if (!current) return { error: new Error('Not authenticated') }
      await apiClient.post(`/api/auth/users/${current.id}/change-password`, { newPassword })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async deleteAccount(userId: string): Promise<{ error: Error | null }> {
    try {
      await apiClient.delete(`/api/auth/users/${userId}`)
      persistUser(null)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async exportUserData(userId: string): Promise<{ data: any; error: Error | null }> {
    try {
      const { data } = await apiClient.get(`/api/auth/users/${userId}/export`)
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },
}

export default authService
