<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">Health Profiles</h1>
        <p class="text-surface-600 dark:text-surface-400">
          Manage health profiles for yourself, patients, or family members
        </p>
      </div>
      <BaseButton @click="showCreateModal = true">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Profile
      </BaseButton>
    </div>

    <!-- Active Profile Banner -->
    <BaseCard v-if="profilesStore.activeProfile" class="mb-6 border-2 border-primary-200 dark:border-primary-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl font-bold">
            {{ getInitials(profilesStore.activeProfile.name) }}
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-lg font-semibold text-surface-900 dark:text-white">
                {{ profilesStore.activeProfile.name }}
              </h3>
              <BaseBadge v-if="profilesStore.activeProfile.isDefault" variant="primary" size="sm">
                Default
              </BaseBadge>
              <BaseBadge variant="safe" size="sm">
                ✓ Active
              </BaseBadge>
            </div>
            <p class="text-sm text-surface-600 dark:text-surface-400">
              Currently checking fish recommendations for this profile
            </p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Profiles Grid -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BaseCard
        v-for="profile in profilesStore.sortedProfiles"
        :key="profile.id"
        :class="{'ring-2 ring-primary-500': profile.id === profilesStore.activeProfileId}"
        class="transition-all hover:shadow-lg"
      >
        <div class="space-y-4">
          <!-- Profile Header -->
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center text-lg font-bold">
                {{ getInitials(profile.name) }}
              </div>
              <div>
                <h3 class="font-semibold text-surface-900 dark:text-white">{{ profile.name }}</h3>
                <div class="flex gap-1 mt-1">
                  <BaseBadge v-if="profile.isDefault" variant="primary" size="sm">Default</BaseBadge>
                  <BaseBadge v-if="profile.id === profilesStore.activeProfileId" variant="safe" size="sm">Active</BaseBadge>
                </div>
              </div>
            </div>
            <button
              @click="openOptionsMenu(profile)"
              class="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <!-- Profile Info -->
          <div class="space-y-2 text-sm">
            <div v-if="profile.age" class="flex items-center gap-2 text-surface-600 dark:text-surface-400">
              <span>👤</span>
              <span>{{ profile.age }} years old</span>
            </div>
            <div v-if="profile.conditions.length > 0" class="flex items-center gap-2">
              <span>🏥</span>
              <div class="flex flex-wrap gap-1">
                <BaseBadge v-for="condId in profile.conditions.slice(0, 2)" :key="condId" variant="info" size="sm">
                  {{ getConditionName(condId) }}
                </BaseBadge>
                <BaseBadge v-if="profile.conditions.length > 2" variant="neutral" size="sm">
                  +{{ profile.conditions.length - 2 }}
                </BaseBadge>
              </div>
            </div>
            <div v-if="profile.dietaryPreferences.length > 0" class="flex items-center gap-2 text-surface-600 dark:text-surface-400">
              <span>🥗</span>
              <span>{{ profile.dietaryPreferences.length }} dietary preferences</span>
            </div>
            <div v-if="profile.notes" class="flex items-start gap-2 text-surface-500 dark:text-surface-400 mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
              <span>📝</span>
              <span class="text-xs line-clamp-2">{{ profile.notes }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 pt-2">
            <BaseButton
              v-if="profile.id !== profilesStore.activeProfileId"
              size="sm"
              variant="primary"
              @click="setActive(profile.id)"
              class="flex-1"
            >
              Set Active
            </BaseButton>
            <BaseButton size="sm" variant="secondary" @click="editProfile(profile)" class="flex-1">
              Edit
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Add New Profile Card -->
      <BaseCard class="flex items-center justify-center min-h-[300px] border-2 border-dashed border-surface-300 dark:border-surface-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer" @click="showCreateModal = true">
        <div class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p class="font-medium text-surface-600 dark:text-surface-400">Add New Profile</p>
          <p class="text-sm text-surface-500 dark:text-surface-500 mt-1">For patient or family member</p>
        </div>
      </BaseCard>
    </div>

    <!-- Create/Edit Profile Modal -->
    <BaseModal :show="showCreateModal" @update:show="showCreateModal = $event" :title="editingProfile ? 'Edit Profile' : 'Create New Profile'" size="lg">
      <form @submit.prevent="handleSaveProfile" class="space-y-4">
        <BaseInput
          v-model="profileForm.name"
          label="Profile Name"
          placeholder="e.g., Patient John, Mom, My Profile"
          required
        />

        <div class="grid md:grid-cols-3 gap-4">
          <BaseInput
            :model-value="profileForm.age ?? ''"
            @update:model-value="profileForm.age = $event ? Number($event) : undefined"
            type="number"
            label="Age"
            placeholder="25"
          />
          <BaseInput
            :model-value="profileForm.weight ?? ''"
            @update:model-value="profileForm.weight = $event ? Number($event) : undefined"
            type="number"
            label="Weight (kg)"
            placeholder="70"
          />
          <BaseInput
            :model-value="profileForm.height ?? ''"
            @update:model-value="profileForm.height = $event ? Number($event) : undefined"
            type="number"
            label="Height (cm)"
            placeholder="170"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Health Conditions
          </label>
          <HealthConditionSelector
            v-model="profileForm.conditions"
            :conditions="healthStore.allConditions"
          />
        </div>

        <BaseInput
          v-model="profileForm.notes"
          label="Notes (Optional)"
          placeholder="Additional information about this profile..."
        />

        <div class="flex justify-end gap-3 pt-4">
          <BaseButton variant="secondary" @click="showCreateModal = false">
            Cancel
          </BaseButton>
          <BaseButton type="submit">
            {{ editingProfile ? 'Save Changes' : 'Create Profile' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useProfilesStore } from '@/stores/profiles'
import { useAuthStore } from '@/stores/auth'
import { useHealthStore } from '@/stores/health'
import { useNotificationStore } from '@/stores/notifications'
import type { HealthProfile } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import HealthConditionSelector from '@/components/features/HealthConditionSelector.vue'

const profilesStore = useProfilesStore()
const authStore = useAuthStore()
const healthStore = useHealthStore()
const notificationStore = useNotificationStore()

const showCreateModal = ref(false)
const editingProfile = ref<HealthProfile | null>(null)

const profileForm = reactive({
  name: '',
  age: undefined as number | undefined,
  weight: undefined as number | undefined,
  height: undefined as number | undefined,
  conditions: [] as string[],
  notes: '',
})

onMounted(async () => {
  // Load profiles from Supabase
  if (authStore.user) {
    await profilesStore.loadProfilesFromSupabase(authStore.user.id)
  }
  // Load health conditions if not already loaded
  if (healthStore.allConditions.length === 0) {
    await healthStore.fetchConditions()
  }
})

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getConditionName(conditionId: string): string {
  const condition = healthStore.allConditions.find((c: { id: string }) => c.id === conditionId)
  return condition?.name || conditionId
}

async function setActive(profileId: string) {
  await profilesStore.setActiveProfile(profileId)
  notificationStore.success('Active profile updated')
}

function editProfile(profile: HealthProfile) {
  editingProfile.value = profile
  profileForm.name = profile.name
  profileForm.age = profile.age
  profileForm.weight = profile.weight
  profileForm.height = profile.height
  profileForm.conditions = [...profile.conditions]
  profileForm.notes = profile.notes || ''
  showCreateModal.value = true
}

async function openOptionsMenu(profile: HealthProfile) {
  if (confirm(`Delete profile "${profile.name}"?`)) {
    try {
      await profilesStore.deleteProfile(profile.id)
      notificationStore.success('Profile deleted')
    } catch (error: any) {
      notificationStore.error(error.message)
    }
  }
}

async function handleSaveProfile() {
  if (!authStore.user) return

  if (editingProfile.value) {
    // Update existing profile
    await profilesStore.updateProfile(editingProfile.value.id, {
      name: profileForm.name,
      age: profileForm.age,
      weight: profileForm.weight,
      height: profileForm.height,
      conditions: profileForm.conditions,
      notes: profileForm.notes,
    })
    notificationStore.success('Profile updated successfully')
  } else {
    // Create new profile
    await profilesStore.createProfile(
      {
        name: profileForm.name,
        age: profileForm.age,
        weight: profileForm.weight,
        height: profileForm.height,
        conditions: profileForm.conditions,
        notes: profileForm.notes,
      },
      authStore.user.id
    )
    notificationStore.success('Profile created successfully')
  }

  // Reset form
  showCreateModal.value = false
  editingProfile.value = null
  profileForm.name = ''
  profileForm.age = undefined
  profileForm.weight = undefined
  profileForm.height = undefined
  profileForm.conditions = []
  profileForm.notes = ''
}
</script>
