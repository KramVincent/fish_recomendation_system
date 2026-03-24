<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-surface-900 dark:text-white mb-2">My Profile</h1>
      <p class="text-surface-600 dark:text-surface-400">Manage your account information and preferences</p>
    </div>

    <div class="grid gap-6">
      <!-- Profile Information -->
      <BaseCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Personal Information</h2>
            <BaseButton v-if="!isEditing" size="sm" variant="secondary" @click="startEditing">
              Edit
            </BaseButton>
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <BaseInput
              v-model="form.fullName"
              label="Full Name"
              :disabled="!isEditing"
              :error="errors.fullName"
            />
            <BaseInput
              v-model="form.email"
              type="email"
              label="Email Address"
              :disabled="!isEditing"
              :error="errors.email"
            />
          </div>

          <BaseInput
            v-model="form.phone"
            type="tel"
            label="Phone Number"
            :disabled="!isEditing"
            placeholder="(123) 456-7890"
          />

          <div v-if="isEditing" class="flex gap-3 pt-4">
            <BaseButton type="submit" :loading="loading">
              Save Changes
            </BaseButton>
            <BaseButton variant="secondary" @click="cancelEditing">
              Cancel
            </BaseButton>
          </div>
        </form>
      </BaseCard>

      <!-- Change Password -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold">Change Password</h2>
        </template>

        <form @submit.prevent="handlePasswordChange" class="space-y-4">
          <BaseInput
            v-model="passwordForm.currentPassword"
            type="password"
            label="Current Password"
            :error="passwordErrors.currentPassword"
          />
          <BaseInput
            v-model="passwordForm.newPassword"
            type="password"
            label="New Password"
            :error="passwordErrors.newPassword"
          />
          <BaseInput
            v-model="passwordForm.confirmPassword"
            type="password"
            label="Confirm New Password"
            :error="passwordErrors.confirmPassword"
          />

          <BaseButton type="submit" :loading="passwordLoading">
            Update Password
          </BaseButton>
        </form>
      </BaseCard>

      <!-- Account Stats -->
      <BaseCard>
        <template #header>
          <h2 class="text-xl font-semibold">Account Statistics</h2>
        </template>

        <div class="grid md:grid-cols-3 gap-6">
          <div>
            <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Member Since</p>
            <p class="text-lg font-semibold text-surface-900 dark:text-white">
              {{ formatDate(new Date(authStore.user?.createdAt || Date.now())) }}
            </p>
          </div>
          <div>
            <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Fish Identified</p>
            <p class="text-lg font-semibold text-surface-900 dark:text-white">
              {{ uploadStore.uploadHistory.length }}
            </p>
          </div>
          <div>
            <p class="text-sm text-surface-600 dark:text-surface-400 mb-1">Recommendations</p>
            <p class="text-lg font-semibold text-surface-900 dark:text-white">
              {{ recommendationStore.recommendations.length }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUploadStore } from '@/stores/upload'
import { useRecommendationStore } from '@/stores/recommendations'
import { useNotificationStore } from '@/stores/notifications'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseBadge from '@/components/common/BaseBadge.vue'

const authStore = useAuthStore()
const uploadStore = useUploadStore()
const recommendationStore = useRecommendationStore()
const notificationStore = useNotificationStore()

const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

const form = reactive({
  fullName: authStore.user?.fullName || '',
  email: authStore.user?.email || '',
  phone: '',
})

const errors = reactive({
  fullName: '',
  email: '',
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function startEditing() {
  isEditing.value = true
  form.fullName = authStore.user?.fullName || ''
  form.email = authStore.user?.email || ''
}

function cancelEditing() {
  isEditing.value = false
  errors.fullName = ''
  errors.email = ''
}

async function handleSubmit() {
  // Reset errors
  errors.fullName = ''
  errors.email = ''

  // Validate
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required'
    return
  }
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return
  }

  loading.value = true
  try {
    await authStore.updateProfile({
      fullName: form.fullName,
      email: form.email,
    })
    notificationStore.success('Profile updated successfully')
    isEditing.value = false
  } catch (error) {
    notificationStore.error('Failed to update profile')
  } finally {
    loading.value = false
  }
}

async function handlePasswordChange() {
  // Reset errors
  passwordErrors.currentPassword = ''
  passwordErrors.newPassword = ''
  passwordErrors.confirmPassword = ''

  // Validate
  if (!passwordForm.currentPassword) {
    passwordErrors.currentPassword = 'Current password is required'
    return
  }
  if (!passwordForm.newPassword) {
    passwordErrors.newPassword = 'New password is required'
    return
  }
  if (passwordForm.newPassword.length < 8) {
    passwordErrors.newPassword = 'Password must be at least 8 characters'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordErrors.confirmPassword = 'Passwords do not match'
    return
  }

  passwordLoading.value = true
  try {
    const success = await authStore.changePassword(passwordForm.newPassword)
    if (success) {
      notificationStore.success('Password changed successfully')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      notificationStore.error(authStore.error || 'Failed to change password')
    }
  } catch (error) {
    notificationStore.error('Failed to change password')
  } finally {
    passwordLoading.value = false
  }
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
</script>
