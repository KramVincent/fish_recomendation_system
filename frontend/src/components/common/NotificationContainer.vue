<template>
  <div class="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
    <NotificationToast
      v-for="notification in notificationStore.notifications"
      :key="notification.id"
      :notification="notification"
      @dismiss="notificationStore.remove(notification.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'
import NotificationToast from './NotificationToast.vue'

const notificationStore = useNotificationStore()
</script>
