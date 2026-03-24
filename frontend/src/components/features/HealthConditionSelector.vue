<template>
  <BaseCard title="Select Your Health Conditions">
    <div class="space-y-4">
      <p class="text-sm text-surface-600 dark:text-surface-400">
        This helps us provide personalized fish recommendations based on your health needs.
      </p>
      
      <!-- Search -->
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search conditions..."
          class="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <svg class="absolute left-3 top-2.5 h-5 w-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <!-- Grouped by Category -->
      <div class="space-y-4 max-h-96 overflow-y-auto">
        <div v-for="(group, category) in groupedConditions" :key="category">
          <h4 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 capitalize">
            {{ category }}
          </h4>
          
          <div class="space-y-2">
            <label
              v-for="condition in group"
              :key="condition.id"
              class="flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="isSelected(condition.id) ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'"
            >
              <input
                type="checkbox"
                :checked="isSelected(condition.id)"
                class="mt-0.5 h-5 w-5 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                @change="toggleCondition(condition.id)"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ condition.icon }}</span>
                  <span class="font-medium text-surface-900 dark:text-white">{{ condition.name }}</span>
                </div>
                <p class="text-sm text-surface-600 dark:text-surface-400 mt-1">
                  {{ condition.description }}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
      
      <!-- Selected Count -->
      <div v-if="selectedCount > 0" class="pt-4 border-t border-surface-200 dark:border-surface-700">
        <div class="flex items-center justify-between">
          <span class="text-sm text-surface-600 dark:text-surface-400">
            {{ selectedCount }} condition{{ selectedCount > 1 ? 's' : '' }} selected
          </span>
          <BaseButton variant="ghost" size="sm" @click="clearAll">
            Clear All
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { HealthCondition } from '@/api/types'
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'

interface Props {
  conditions: HealthCondition[]
  modelValue: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const searchQuery = ref('')

const filteredConditions = computed(() => {
  if (!searchQuery.value) return props.conditions
  const query = searchQuery.value.toLowerCase()
  return props.conditions.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.description.toLowerCase().includes(query)
  )
})

const groupedConditions = computed(() => {
  const groups: Record<string, HealthCondition[]> = {}
  filteredConditions.value.forEach(condition => {
    if (!groups[condition.category]) {
      groups[condition.category] = []
    }
    groups[condition.category].push(condition)
  })
  return groups
})

const selectedCount = computed(() => props.modelValue.length)

function isSelected(id: string): boolean {
  return props.modelValue.includes(id)
}

function toggleCondition(id: string) {
  if (isSelected(id)) {
    emit('update:modelValue', props.modelValue.filter(cid => cid !== id))
  } else {
    emit('update:modelValue', [...props.modelValue, id])
  }
}

function clearAll() {
  emit('update:modelValue', [])
}
</script>
