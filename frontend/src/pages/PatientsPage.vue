<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Health Profiles</h1>
        <p class="text-surface-600 dark:text-surface-400">
          Manage health profiles and dietary plans
        </p>
      </div>
      <BaseButton @click="showAddModal = true">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Profile
      </BaseButton>
    </div>

    <!-- Stats -->
    <div class="grid md:grid-cols-4 gap-6 mb-8">
      <BaseCard>
        <div>
          <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Total Profiles</p>
          <p class="text-3xl font-bold text-surface-900 dark:text-white">{{ profiles.length }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div>
          <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Active Profiles</p>
          <p class="text-3xl font-bold text-safe">{{ activeProfiles }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div>
          <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">New This Week</p>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400">{{ newProfiles }}</p>
        </div>
      </BaseCard>
      <BaseCard>
        <div>
          <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Need Conditions</p>
          <p class="text-3xl font-bold text-moderate">{{ pendingReviews }}</p>
        </div>
      </BaseCard>
    </div>

    <!-- Search and Filters -->
    <BaseCard class="mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <BaseInput
            v-model="searchQuery"
            placeholder="Search profiles by name..."
            class="w-full"
          >
            <template #prefix>
              <svg class="w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </template>
          </BaseInput>
        </div>
      </div>
    </BaseCard>

    <!-- Profiles Table -->
    <BaseCard>
      <BaseTable
        :columns="columns"
        :data="filteredProfiles"
        :loading="loading || profilesStore.isLoading"
      >
        <template #cell-name="{ row }">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-semibold">
              {{ getInitials(row.name) }}
            </div>
            <div>
              <p class="font-medium text-surface-900 dark:text-white">{{ row.name }}</p>
              <p v-if="row.isDefault" class="text-xs text-primary-600 dark:text-primary-400">Default Profile</p>
            </div>
          </div>
        </template>

        <template #cell-conditions="{ row }">
          <div class="flex flex-wrap gap-1">
            <BaseBadge
              v-for="conditionId in row.conditions.slice(0, 2)"
              :key="conditionId"
              variant="info"
              size="sm"
            >
              {{ getConditionName(conditionId) }}
            </BaseBadge>
            <BaseBadge v-if="row.conditions.length > 2" variant="neutral" size="sm">
              +{{ row.conditions.length - 2 }}
            </BaseBadge>
            <span v-if="row.conditions.length === 0" class="text-sm text-surface-400">No conditions</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <BaseBadge :variant="row.isDefault ? 'safe' : 'neutral'">
            {{ row.isDefault ? 'Default' : 'Active' }}
          </BaseBadge>
        </template>

        <template #cell-lastVisit="{ row }">
          <span class="text-sm text-surface-600 dark:text-surface-400">
            {{ formatDate(row.lastVisit) }}
          </span>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex gap-2">
            <button
              @click="viewProfile(row)"
              class="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="View Details"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              @click="openEditModal(row)"
              class="p-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
              title="Edit"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              v-if="!row.isDefault"
              @click="deleteProfile(row)"
              class="p-2 text-avoid hover:bg-avoid-light/20 rounded-lg transition-colors"
              title="Delete"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </template>
      </BaseTable>
    </BaseCard>

    <!-- Add Profile Modal -->
    <BaseModal :show="showAddModal" @update:show="showAddModal = $event" title="Add New Profile">
      <form @submit.prevent="handleAddProfile" class="space-y-4">
        <BaseInput
          v-model="newProfile.name"
          label="Profile Name"
          placeholder="e.g., My Health Profile"
          required
        />
        
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="secondary" @click="showAddModal = false">
            Cancel
          </BaseButton>
          <BaseButton type="submit" :loading="loading">
            Add Profile
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Edit Profile Modal -->
    <BaseModal :show="showEditModal" @update:show="showEditModal = $event" title="Edit Profile">
      <form @submit.prevent="handleEditProfile" class="space-y-4">
        <BaseInput
          v-model="editProfile.name"
          label="Profile Name"
          required
        />
        
        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="secondary" @click="showEditModal = false">
            Cancel
          </BaseButton>
          <BaseButton type="submit" :loading="loading">
            Save Changes
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { useProfilesStore } from '@/stores/profiles'
import { useHealthStore } from '@/stores/health'
import type { HealthProfile } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseModal from '@/components/common/BaseModal.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const profilesStore = useProfilesStore()
const healthStore = useHealthStore()

const loading = ref(false)
const searchQuery = ref('')
const filterStatus = ref('all')
const showAddModal = ref(false)
const showEditModal = ref(false)
const selectedProfile = ref<HealthProfile | null>(null)

const newProfile = ref({
  name: '',
})

const editProfile = ref({
  name: '',
})

const columns = [
  { key: 'name', label: 'Profile', sortable: true },
  { key: 'conditions', label: 'Health Conditions' },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'lastVisit', label: 'Last Updated', sortable: true },
  { key: 'actions', label: 'Actions' },
]

// Profiles data from Supabase via store
const profiles = computed(() => profilesStore.profiles.map(p => ({
  ...p,
  status: 'active' as const,
  lastVisit: new Date(p.updatedAt),
})))

const activeProfiles = computed(() => profiles.value.length)

const newProfiles = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return profiles.value.filter(p => p.lastVisit >= oneWeekAgo).length
})

const pendingReviews = computed(() => 
  profiles.value.filter(p => p.conditions.length === 0).length
)

const filteredProfiles = computed(() => {
  let result = profiles.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(query))
  }

  return result
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

function getConditionName(conditionId: string): string {
  return healthStore.getConditionName(conditionId)
}

function viewProfile(profile: HealthProfile) {
  router.push('/health-profile')
}

function openEditModal(profile: HealthProfile) {
  selectedProfile.value = profile
  editProfile.value = {
    name: profile.name,
  }
  showEditModal.value = true
}

async function handleEditProfile() {
  if (!selectedProfile.value || !authStore.user) return
  
  loading.value = true
  const result = await profilesStore.updateProfile(selectedProfile.value.id, {
    name: editProfile.value.name,
  })
  loading.value = false
  
  if (result) {
    notificationStore.success('Profile updated', `${editProfile.value.name}'s information has been saved`)
  } else {
    notificationStore.error('Update failed', profilesStore.error || 'Failed to update profile')
  }
  
  showEditModal.value = false
  selectedProfile.value = null
  editProfile.value = { name: '' }
}

async function deleteProfile(profile: HealthProfile) {
  if (!authStore.user) return
  
  if (confirm(`Are you sure you want to remove ${profile.name}?`)) {
    loading.value = true
    try {
      await profilesStore.deleteProfile(profile.id)
      notificationStore.success('Profile removed', `${profile.name} has been removed`)
    } catch (e: any) {
      notificationStore.error('Delete failed', e.message || 'Failed to delete profile')
    }
    loading.value = false
  }
}

async function handleAddProfile() {
  if (!newProfile.value.name || !authStore.user) {
    notificationStore.error('Validation error', 'Name is required')
    return
  }
  
  loading.value = true
  const result = await profilesStore.createProfile({
    name: newProfile.value.name,
  }, authStore.user.id)
  loading.value = false
  
  if (result) {
    notificationStore.success('Profile added', `${newProfile.value.name} has been added`)
    showAddModal.value = false
    newProfile.value = { name: '' }
  } else {
    notificationStore.error('Create failed', profilesStore.error || 'Failed to create profile')
  }
}

onMounted(async () => {
  if (authStore.user) {
    loading.value = true
    await Promise.all([
      profilesStore.loadProfilesFromSupabase(authStore.user.id),
      healthStore.fetchConditions(),
    ])
    loading.value = false
  }
})
</script>
