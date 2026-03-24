// ========================================
// User & Authentication Types
// ========================================

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  fullName: string
}

// ========================================
// Health Profile Types
// ========================================

export interface HealthCondition {
  id: string
  name: string
  category: HealthConditionCategory
  description: string
  icon: string
}

export type HealthConditionCategory =
  | 'cardiovascular'
  | 'metabolic'
  | 'autoimmune'
  | 'neurological'
  | 'renal'
  | 'gastrointestinal'
  | 'respiratory'
  | 'other'

// Health Profile - can be for user themselves or someone they're checking for (patient, family member, etc.)
export interface HealthProfile {
  id: string
  userId: string
  name: string              // "My Profile", "Patient John", "Mom", etc.
  avatarUrl?: string
  isDefault: boolean        // The user's own profile
  conditions: string[]      // condition IDs
  allergies: string[]
  medications: string[]
  dietaryPreferences: DietaryPreference[]
  age?: number
  weight?: number           // kg
  height?: number           // cm
  pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding'
  notes?: string            // For dietitians to add patient notes
  createdAt: string
  updatedAt: string
}

// Deprecated - kept for backward compatibility
export interface UserHealthProfile extends HealthProfile {}

export type DietaryPreference =
  | 'low-sodium'
  | 'low-mercury'
  | 'high-omega3'
  | 'low-fat'
  | 'high-protein'
  | 'pescatarian'
  | 'halal'
  | 'kosher'

// ========================================
// Fish & Nutritional Types
// ========================================

export interface FishSpecies {
  id: string
  commonName: string
  scientificName: string
  imageUrl: string
  description: string
  nutrition: FishNutrition
  mercuryLevel: MercuryLevel
  safetyCategory: SafetyCategory
  habitat: string
  season: string[]
  preparationMethods: string[]
}

export interface FishNutrition {
  calories: number          // per 100g
  protein: number           // grams per 100g
  totalFat: number
  omega3: number            // mg per 100g
  omega6: number
  cholesterol: number       // mg
  sodium: number            // mg
  potassium: number         // mg
  iron: number              // mg
  calcium: number           // mg
  vitaminD: number          // IU
  vitaminB12: number        // mcg
  selenium: number          // mcg
  mercury: number           // ppm
}

export type MercuryLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
export type SafetyCategory = 'safe' | 'moderate' | 'avoid'

// ========================================
// Fish Identification Types
// ========================================

export interface ImageUpload {
  id: string
  file?: File
  previewUrl: string
  status: UploadStatus
  progress: number
  result?: IdentificationResult
  createdAt: string
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'complete' | 'error'

export interface IdentificationResult {
  id: string
  imageId: string
  predictions: FishPrediction[]
  processingTime: number     // ms
  createdAt: string
}

export interface FishPrediction {
  speciesId: string
  speciesName: string
  confidence: number         // 0-1
  boundingBox?: BoundingBox
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// ========================================
// Recommendation Types
// ========================================

export interface FishRecommendation {
  id: string
  userId: string
  speciesId: string
  species: FishSpecies
  safetyCategory: SafetyCategory
  servingSize: string
  frequencyPerWeek: number
  frequencyPerMonth: number
  preparationTips: string[]
  warnings: string[]
  alternatives: string[]
  reasoning: string
  createdAt: string
}

export interface RecommendationSummary {
  safe: FishRecommendation[]
  moderate: FishRecommendation[]
  avoid: FishRecommendation[]
  totalAnalyzed: number
  lastUpdated: string
}

// ========================================
// Dietitian Types
// ========================================

export interface Patient {
  id: string
  user: User
  healthProfile: UserHealthProfile
  assignedDietitianId: string
  recommendations: FishRecommendation[]
  notes: DietitianNote[]
  status: 'active' | 'inactive'
  lastVisit: string
}

export interface DietitianNote {
  id: string
  patientId: string
  dietitianId: string
  content: string
  type: 'general' | 'recommendation' | 'follow-up' | 'warning'
  createdAt: string
}

// ========================================
// UI Types
// ========================================

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  dismissible?: boolean
}

export interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface PaginationState {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface SelectOption {
  label: string
  value: string
  description?: string
  icon?: string
  disabled?: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'
