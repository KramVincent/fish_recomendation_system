# FishSafe Application - Functionality & Architecture Guide

This document provides detailed explanations of the main functionalities, design decisions, and the reasoning behind the architectural choices in the FishSafe application.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Service Layer](#service-layer)
3. [State Management (Stores)](#state-management-stores)
4. [Composables](#composables)
5. [Authentication Flow](#authentication-flow)
6. [Fish Identification System](#fish-identification-system)
7. [Health Profile Management](#health-profile-management)
8. [Recommendation Engine](#recommendation-engine)
9. [Notification System](#notification-system)
10. [Routing & Navigation Guards](#routing--navigation-guards)
11. [Database Integration](#database-integration)
12. [Type Safety](#type-safety)

---

## Architecture Overview

### Why This Architecture?

The application follows a **layered architecture pattern** with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│                 Vue Components                   │
│            (Pages & UI Components)               │
├─────────────────────────────────────────────────┤
│                  Composables                     │
│         (Reusable Logic & Side Effects)          │
├─────────────────────────────────────────────────┤
│               Pinia Stores                       │
│           (Centralized State Management)         │
├─────────────────────────────────────────────────┤
│                  Services                        │
│          (API & Business Logic Layer)            │
├─────────────────────────────────────────────────┤
│               Supabase Client                    │
│            (Database & Auth Provider)            │
└─────────────────────────────────────────────────┘
```

**Benefits:**
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes in one layer don't cascade to others
- **Reusability**: Services and composables can be shared across components
- **Scalability**: Easy to add new features without touching existing code

---

## Service Layer

### Purpose

Services act as the **data access layer**, encapsulating all Supabase interactions. This provides:

1. **Abstraction**: Components don't need to know how data is fetched
2. **Consistency**: All database operations follow the same pattern
3. **Error Handling**: Centralized error handling with consistent response format

### Service Pattern

All services follow a consistent return pattern:

```typescript
async function someOperation(): Promise<{ data: T | null; error: Error | null }>
```

**Why this pattern?**
- Explicit error handling without try-catch in consuming code
- TypeScript can infer both success and error cases
- Consistent API across all service methods

---

### fishService.ts

**Purpose**: Manages fish species data and disease suitability information.

#### Key Functions

##### `getAll()`
```typescript
async getAll(): Promise<{ data: FishSpecies[]; error: Error | null }>
```

**What it does**: Retrieves all fish species with their nutritional data.

**Why two separate queries?**
```typescript
const { data: fishData } = await supabase.from('fish_species').select('*')
const { data: nutritionData } = await supabase.from('fish_nutrition').select('*')
```

The nutrition data is in a separate table for **database normalization**. This design:
- Reduces data redundancy
- Allows nutrition data to be updated independently
- Keeps the fish_species table focused on species metadata

##### `transformFish()`

**Purpose**: Converts database schema (snake_case) to app schema (camelCase).

**Why transform?**
- Database conventions use `snake_case` (PostgreSQL standard)
- JavaScript/TypeScript conventions use `camelCase`
- Keeps codebase consistent with language idioms

##### `mapMercuryToSafety()`

**Purpose**: Maps detailed mercury levels to simplified safety categories.

```typescript
function mapMercuryToSafety(mercuryLevel: string): SafetyCategory {
  switch (mercuryLevel) {
    case 'very-low':
    case 'low':
      return 'safe'
    case 'moderate':
      return 'moderate'
    case 'high':
    case 'very-high':
      return 'avoid'
  }
}
```

**Why abstract mercury levels?**
- Users don't need to understand "very-low" vs "low" mercury
- Simplifies UI to three easy-to-understand categories
- Database retains granular data for advanced filtering

##### `getDiseaseSuitability()`

**Purpose**: Retrieves fish consumption recommendations based on health conditions.

**Use case**: When displaying a fish species, shows whether it's recommended, moderate, or should be avoided for specific health conditions.

---

### healthService.ts

**Purpose**: Manages health conditions data.

#### Key Functions

##### `getAllConditions()`

**What it does**: Fetches all available health conditions.

**Why fetch all?**
- Health conditions are a relatively small, static dataset
- Caching all conditions upfront improves UX (no loading delays)
- Enables instant filtering and searching on the client

##### `searchConditions()`

```typescript
.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
```

**Why use `ilike` with `or`?**
- `ilike` provides case-insensitive matching
- Searching both `name` and `description` improves discoverability
- Users can find conditions using partial names or symptoms

---

### authService.ts

**Purpose**: Handles all authentication operations.

#### Key Functions

##### `register()`

**What it does**: Creates a new user account with a profile.

```typescript
// 1. Create auth user
const { data } = await supabase.auth.signUp({...})

// 2. Create user profile in database
await supabase.from('users').insert([{...}])
```

**Why two-step registration?**
- Supabase Auth handles credentials securely
- Separate `users` table stores app-specific user data
- Allows extending user data without touching auth

##### `getSession()`

**Purpose**: Retrieves the current user session on app load.

**Why check session on startup?**
- Restores user state after page refresh
- Enables "remember me" functionality
- Prevents unnecessary re-authentication

##### `onAuthStateChange()`

**Purpose**: Subscribes to authentication state changes.

**Use cases**:
- Detect when user logs out in another tab
- Handle session expiry
- Sync auth state across the application

---

### uploadService.ts

**Purpose**: Handles image uploads and identification results.

#### Key Functions

##### `uploadImage()`

```typescript
// 1. Generate unique filename
const storagePath = `${userId}/${timestamp}.${extension}`

// 2. Upload to storage bucket
await supabase.storage.from('fish-images').upload(storagePath, file)

// 3. Create database record
await supabase.from('image_uploads').insert({...})
```

**Why this structure?**

1. **User-based paths**: `${userId}/` ensures isolation between users
2. **Timestamp naming**: Prevents filename collisions
3. **Database record**: Enables tracking, history, and metadata storage

##### `saveIdentificationResult()`

**Purpose**: Stores AI identification results with predictions.

**Why separate predictions table?**
```typescript
// Create identification result (parent)
const { data: result } = await supabase.from('identification_results').insert({...})

// Save predictions (children)
await supabase.from('fish_predictions').insert(predictionInserts)
```

- One image can have multiple predictions (multiple fish detected)
- Predictions include bounding boxes and confidence scores
- Historical data enables ML model improvement

---

### recommendationService.ts

**Purpose**: Generates and manages personalized fish recommendations.

#### Key Functions

##### `generateRecommendations()`

**What it does**: Creates personalized fish recommendations based on health profile.

**Algorithm Flow**:
1. Fetch user's health conditions from profile
2. Retrieve suitability data for each condition
3. Aggregate suitability scores across all conditions
4. Generate recommendations with warnings and alternatives

**Why generate server-side?**
- Complex logic benefits from structured processing
- Results are persisted for quick retrieval
- Enables future ML-based personalization

##### `getSummary()`

**Purpose**: Provides a quick overview of recommendations.

```typescript
interface RecommendationSummary {
  safe: FishRecommendation[]
  moderate: FishRecommendation[]
  avoid: FishRecommendation[]
  totalAnalyzed: number
  lastUpdated: string
}
```

**Why a summary?**
- Dashboard displays need quick counts
- Avoids fetching full recommendation details
- Improves perceived performance

---

### profileService.ts

**Purpose**: Manages health profiles for users and their patients/family.

#### Key Functions

##### `getProfilesByUserId()`

**What it does**: Fetches all profiles with their associated conditions.

**Two-step query approach**:
```typescript
// 1. Get profiles
const { data: profiles } = await supabase.from('health_profiles').select('*')

// 2. Get conditions for all profiles
const { data: conditions } = await supabase.from('profile_conditions')
  .in('profile_id', profileIds)
```

**Why not a join?**
- Supabase's join syntax can be limiting for complex relationships
- Separate queries are more predictable in error handling
- Easier to cache conditions data independently

##### `createProfile()`

**Transaction-like behavior**:
```typescript
// 1. Insert profile
const { data: profile } = await supabase.from('health_profiles').insert({...})

// 2. Insert conditions
await supabase.from('profile_conditions').insert(conditionInserts)
```

**Why two inserts?**
- Many-to-many relationship (profile ↔ conditions)
- Junction table `profile_conditions` enables flexible condition assignment
- Profiles can be created without conditions, conditions added later

---

## State Management (Stores)

### Why Pinia?

Pinia is used for centralized state management because:

1. **Composition API native**: Works seamlessly with Vue 3
2. **TypeScript support**: Full type inference
3. **Devtools integration**: Easy debugging
4. **Modular**: Each domain has its own store

### Store Pattern

All stores follow a consistent pattern:

```typescript
export const useXxxStore = defineStore('xxx', () => {
  // State (ref)
  const data = ref<T[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const filtered = computed(() => data.value.filter(...))

  // Actions
  async function fetchData() {...}

  return { data, isLoading, error, filtered, fetchData }
})
```

---

### auth.ts (Auth Store)

**Purpose**: Manages authentication state and user session.

#### Key Features

##### Initialization Guard

```typescript
let initializePromise: Promise<void> | null = null

async function initialize() {
  if (initializePromise) return initializePromise
  if (isInitialized.value) return Promise.resolve()
  
  initializePromise = (async () => {...})()
  return initializePromise
}
```

**Why this pattern?**
- Prevents multiple simultaneous initialization calls
- Ensures router guards wait for auth to be ready
- Handles race conditions during app startup

##### Session Restoration

```typescript
async function initialize() {
  const { user } = await authService.getSession()
  if (user) {
    user.value = user
    await profilesStore.loadProfilesFromSupabase(user.id)
  }
}
```

**Why load profiles during init?**
- Profile data is needed immediately after login
- Prevents flash of empty state
- Improves user experience

##### Auth State Listener

```typescript
function setupAuthStateListener() {
  authService.onAuthStateChange((authUser) => {
    if (authUser && !user.value) {
      user.value = authUser
    } else if (!authUser && user.value) {
      user.value = null
      profilesStore.reset()
    }
  })
}
```

**Use cases**:
- External logout (another tab)
- Session expiry
- OAuth callback handling

---

### fish.ts (Fish Store)

**Purpose**: Manages fish species data with caching.

#### Key Features

##### Computed Filters

```typescript
const safeFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'safe'))
const moderateFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'moderate'))
const avoidFish = computed(() => allFish.value.filter(f => f.safetyCategory === 'avoid'))
```

**Why computed?**
- Automatically updates when `allFish` changes
- No manual cache invalidation needed
- Efficient - only recalculates when dependencies change

##### Suitability Cache

```typescript
const suitabilityCache = ref<Map<string, FishDiseaseSuitability[]>>(new Map())

async function getDiseaseSuitability(fishId: string) {
  const cached = suitabilityCache.value.get(fishId)
  if (cached) return cached
  
  const { data } = await fishService.getDiseaseSuitability(fishId)
  suitabilityCache.value.set(fishId, data)
  return data
}
```

**Why local caching?**
- Suitability data rarely changes
- Reduces API calls for repeated lookups
- Improves performance when viewing multiple fish

##### Sync vs Async Methods

```typescript
// Synchronous - uses local cache
function getById(id: string): FishSpecies | undefined {
  return allFish.value.find(f => f.id === id)
}

// Asynchronous - fetches if not cached
async function getByIdAsync(id: string): Promise<FishSpecies | null> {
  const cached = allFish.value.find(f => f.id === id)
  if (cached) return cached
  
  const { data } = await fishService.getById(id)
  return data
}
```

**When to use which?**
- `getById`: When you know data is already loaded
- `getByIdAsync`: When data might not be cached yet

---

### recommendations.ts (Recommendations Store)

**Purpose**: Manages personalized fish recommendations.

#### Key Features

##### Summary Management

```typescript
function updateSummary(data: FishRecommendation[]) {
  summary.value = {
    safe: data.filter(r => r.safetyCategory === 'safe'),
    moderate: data.filter(r => r.safetyCategory === 'moderate'),
    avoid: data.filter(r => r.safetyCategory === 'avoid'),
    totalAnalyzed: data.length,
    lastUpdated: new Date().toISOString(),
  }
}
```

**Why maintain a summary?**
- Dashboard needs quick access to counts
- Avoids re-filtering large arrays repeatedly
- Provides a single source of truth for statistics

##### Dual Fetch Methods

```typescript
async function fetchRecommendations(userId: string, profileId?: string)
async function generateRecommendations(userId: string, profileId: string)
```

**Difference**:
- `fetchRecommendations`: Retrieves existing recommendations
- `generateRecommendations`: Creates new recommendations based on current profile

**When to generate?**
- After health profile changes
- When user explicitly requests refresh
- On first time setup

---

### notifications.ts (Notification Store)

**Purpose**: Manages toast notifications across the app.

#### Key Features

##### Auto-dismissal

```typescript
function add(notification: Omit<Notification, 'id'>): string {
  const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2)
  
  notifications.value.push(newNotif)

  if (newNotif.duration && newNotif.duration > 0) {
    setTimeout(() => remove(id), newNotif.duration)
  }

  return id
}
```

**Why auto-dismiss?**
- Prevents notification clutter
- Users don't need to manually close success messages
- Duration varies by notification type (errors stay longer)

##### Helper Methods

```typescript
function success(title: string, message = '', duration = 5000)
function error(title: string, message = '', duration = 7000)
function warning(title: string, message = '', duration = 6000)
function info(title: string, message = '', duration = 5000)
```

**Why helper methods?**
- Cleaner API for common use cases
- Enforces consistent styling per notification type
- Sets appropriate default durations

---

### upload.ts (Upload Store)

**Purpose**: Manages image uploads and identification history.

#### Key Features

##### Progress Simulation

```typescript
// Simulate upload progress
for (let i = 0; i <= 100; i += 20) {
  await new Promise(resolve => setTimeout(resolve, 100))
  upload.progress = i
}
```

**Why simulate progress?**
- Supabase doesn't provide real-time upload progress
- Visual feedback improves user experience
- Prevents users from thinking the app is frozen

##### Mock Identification

```typescript
async function generateIdentificationResult(imageId: string, userId: string) {
  const { data: allFish } = await fishService.getAll()
  const randomFish = allFish[Math.floor(Math.random() * allFish.length)]
  
  const predictions: FishPrediction[] = [{
    speciesId: randomFish?.id || '',
    speciesName: randomFish?.commonName || 'Unknown Fish',
    confidence: 0.88 + Math.random() * 0.1
  }]
}
```

**Why mock results?**
- Demo/development without ML infrastructure
- Shows end-to-end flow
- In production, replace with actual YOLOv8 API call

---

## Composables

### Purpose

Composables encapsulate **reusable logic** that combines multiple concerns:
- Store interactions
- Side effects
- Local state

### useFishIdentification.ts

**Purpose**: Orchestrates the fish identification workflow.

```typescript
export function useFishIdentification() {
  const uploadStore = useUploadStore()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  const isProcessing = ref(false)
  const currentResult = ref<ImageUpload | null>(null)

  async function identifyFish(file: File) {
    // 1. Check authentication
    if (!authStore.user) {
      notificationStore.error('Not authenticated')
      return null
    }

    // 2. Start processing
    isProcessing.value = true
    
    // 3. Upload and identify
    const upload = await uploadStore.uploadImage(file, authStore.user.id)
    
    // 4. Show result notification
    if (upload?.result) {
      notificationStore.success('Fish identified!')
    }
    
    return upload
  }
}
```

**Why a composable instead of putting this in a component?**
- Reusable across multiple pages
- Separates UI from business logic
- Easier to test

### useUtils.ts

**Purpose**: General-purpose utility composables.

#### useConfirmDialog()

**Purpose**: Promise-based confirmation dialogs.

```typescript
function confirm(msg: string): Promise<boolean> {
  isOpen.value = true
  return new Promise((resolve) => {
    resolvePromise.value = resolve
  })
}
```

**Why Promise-based?**
- Cleaner async/await syntax in consuming code
- No callback nesting
- Natural flow: `if (await confirm('Delete?')) { ... }`

#### useDebounce()

**Purpose**: Prevents rapid-fire function calls.

```typescript
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
```

**Use cases**:
- Search input (wait for user to stop typing)
- Window resize handlers
- API calls triggered by user input

#### useClickOutside()

**Purpose**: Detects clicks outside an element.

```typescript
export function useClickOutside(handler: () => void) {
  const element = ref<HTMLElement | null>(null)

  function onClickOutside(event: MouseEvent) {
    if (element.value && !element.value.contains(event.target as Node)) {
      handler()
    }
  }

  onMounted(() => document.addEventListener('click', onClickOutside))
  onUnmounted(() => document.removeEventListener('click', onClickOutside))

  return element
}
```

**Use cases**:
- Closing dropdowns
- Dismissing modals
- Collapsing menus

---

## Authentication Flow

### Flow Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   App Init  │────────▶│  getSession │────────▶│  Has User?  │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                        ┌──────────────────────────────┼──────────────────────────────┐
                        │                              │                              │
                        ▼                              ▼                              │
                 ┌─────────────┐              ┌─────────────┐                        │
                 │    Yes      │              │     No      │                        │
                 └──────┬──────┘              └──────┬──────┘                        │
                        │                           │                               │
                        ▼                           ▼                               │
                 ┌─────────────┐              ┌─────────────┐                        │
                 │ Load Profile│              │ Show Login  │                        │
                 └──────┬──────┘              └─────────────┘                        │
                        │                                                            │
                        ▼                                                            │
                 ┌─────────────┐                                                     │
                 │  Setup Auth │◀────────────────────────────────────────────────────┘
                 │   Listener  │
                 └─────────────┘
```

### Why This Flow?

1. **Session Check First**: Prevents unnecessary login page flash
2. **Profile Loading**: User data is ready when dashboard loads
3. **Auth Listener**: Handles external state changes (logout in another tab)

---

## Fish Identification System

### Flow Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ User Selects│────────▶│   Upload to │────────▶│  Store in   │
│   Image     │         │   Storage   │         │   Database  │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                       │
                                                       ▼
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Display to  │◀────────│    Save     │◀────────│ ML Processing│
│    User     │         │   Results   │         │  (YOLOv8)   │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Why This Architecture?

1. **Storage First**: Images are persisted for history/audit
2. **Status Tracking**: Database tracks processing state
3. **Decoupled Processing**: ML can be async/queued
4. **Result Persistence**: Enables history and analytics

---

## Health Profile Management

### Multi-Profile Design

```typescript
interface HealthProfile {
  id: string
  userId: string           // Owner of the profile
  name: string            // "My Profile", "Mom", "Patient John"
  isDefault: boolean      // User's own profile
  conditions: string[]    // Health conditions
  // ...
}
```

**Why multi-profile?**

1. **Healthcare professionals**: Dietitians manage multiple patients
2. **Family care**: Users check fish safety for family members
3. **Flexibility**: Different preparation needs for different people

### Conditions as IDs

```typescript
conditions: string[]  // Array of condition IDs, not condition objects
```

**Why store IDs instead of full objects?**

1. **Normalization**: Condition details are in a separate table
2. **Size**: Profiles stay lightweight
3. **Updates**: Condition details can change without updating profiles
4. **Flexibility**: Easy to add/remove conditions

---

## Recommendation Engine

### Algorithm Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  User Health Profile                         │
│         [Hypertension, Diabetes, Pregnancy]                  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Disease Suitability Matrix                      │
│                                                              │
│ Fish        │ Hypertension │ Diabetes │ Pregnancy           │
│ ─────────────────────────────────────────────────────       │
│ Salmon      │ Recommended  │ Moderate │ Recommended         │
│ Tuna        │ Moderate     │ Safe     │ Avoid (mercury)     │
│ Mackerel    │ Recommended  │ Safe     │ Moderate            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Aggregate Safety Categories                       │
│                                                              │
│ • Most restrictive category wins (avoid > moderate > safe)   │
│ • Salmon: Moderate (limited by Diabetes score)               │
│ • Tuna: Avoid (pregnancy restriction)                        │
│ • Mackerel: Moderate (pregnancy restriction)                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Final Recommendations                           │
│                                                              │
│ Safe: [...]                                                  │
│ Moderate: [Salmon, Mackerel]                                │
│ Avoid: [Tuna]                                               │
│ + Warnings, alternatives, preparation tips                   │
└─────────────────────────────────────────────────────────────┘
```

### Why "Most Restrictive" Logic?

```typescript
// Safety priority: avoid > moderate > safe
function getAggregateSafety(categoryScores: SafetyCategory[]): SafetyCategory {
  if (categoryScores.includes('avoid')) return 'avoid'
  if (categoryScores.includes('moderate')) return 'moderate'
  return 'safe'
}
```

**Reasoning**:
- **Safety first**: If ANY condition says avoid, avoid it
- **Clear guidance**: No ambiguity in recommendations
- **Medical soundness**: Follows precautionary principle

---

## Routing & Navigation Guards

### Route Configuration

```typescript
{
  path: '/dashboard',
  name: 'Dashboard',
  component: () => import('@/pages/DashboardPage.vue'),
  meta: { requiresAuth: true },
}
```

**Why lazy loading (`() => import(...)`)?**
- Reduces initial bundle size
- Pages load only when needed
- Improves first-paint performance

### Navigation Guard

```typescript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth to initialize
  await authStore.waitForInit()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})
```

**Why `waitForInit()`?**
- Auth state might not be ready on page load
- Prevents false redirects to login
- Ensures session is checked before routing decision

**Why redirect query param?**
```typescript
query: { redirect: to.fullPath }
```
- After login, user returns to originally requested page
- Better UX for deep links

---

## Database Integration

### Supabase Client Configuration

```typescript
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,    // Automatically refresh expired tokens
    persistSession: true,       // Save session to localStorage
    detectSessionInUrl: true,   // Handle OAuth callbacks
  },
})
```

**Why these options?**

1. **autoRefreshToken**: Users stay logged in without manual re-auth
2. **persistSession**: Session survives page refresh
3. **detectSessionInUrl**: Supports OAuth providers (Google, GitHub)

### Storage Helpers

```typescript
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
```

**Why a helper function?**
- Consistent URL generation
- Encapsulates Supabase storage URL format
- Easy to update if storage location changes

---

## Type Safety

### API Types

All types are defined centrally in `src/api/types/index.ts`:

```typescript
export interface FishSpecies {
  id: string
  commonName: string
  scientificName: string
  // ...
}
```

### Database Types

Database-specific types in `src/types/database.ts`:

```typescript
export interface DbFishSpecies {
  id: string
  common_name: string        // Database uses snake_case
  scientific_name: string
  // ...
}
```

**Why separate types?**

1. **Snake_case in DB, camelCase in app**: Each follows its conventions
2. **Transform functions**: Convert between schemas at service layer
3. **Type safety**: TypeScript catches mismatches at compile time

### Benefits of Strong Typing

1. **Autocomplete**: IDE knows available properties
2. **Error prevention**: Catch typos and wrong types before runtime
3. **Documentation**: Types serve as living documentation
4. **Refactoring**: Safe to rename properties - TypeScript tracks usage

---

## Best Practices Summary

| Practice | Why |
|----------|-----|
| Layered architecture | Separation of concerns, testability |
| Service return pattern | Consistent error handling |
| Pinia stores | Centralized, reactive state |
| Composables | Reusable business logic |
| Type transformations | Clean API boundaries |
| Lazy route loading | Performance optimization |
| Auth initialization guard | Prevent race conditions |
| Caching strategies | Reduce API calls |
| Notification system | Consistent user feedback |

---

## Extending the Application

### Adding a New Feature

1. **Define types** in `src/api/types/index.ts`
2. **Create service** in `src/services/`
3. **Create store** in `src/stores/`
4. **Create composable** (if needed) in `src/composables/`
5. **Create page/component** in `src/pages/` or `src/components/`
6. **Add route** in `src/router/index.ts`

### Adding a New Service Method

```typescript
// 1. Add to service
async newMethod(): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.from('table').select()
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

// 2. Add to store
async function callNewMethod() {
  isLoading.value = true
  const { data, error } = await service.newMethod()
  if (error) {
    error.value = error.message
  } else {
    // update state
  }
  isLoading.value = false
}
```

---

## Conclusion

This architecture provides:

- **Maintainability**: Clear structure and separation of concerns
- **Scalability**: Easy to add features without touching existing code
- **Type safety**: Full TypeScript coverage
- **Performance**: Caching and lazy loading optimizations
- **User experience**: Consistent notifications and error handling

The patterns used are industry-standard for Vue 3 applications and should be familiar to any Vue developer joining the project.
