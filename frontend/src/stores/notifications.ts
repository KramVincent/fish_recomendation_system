import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/api/types'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function add(notification: Omit<Notification, 'id'>): string {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2)
    const newNotif: Notification = {
      id,
      ...notification,
      dismissible: notification.dismissible ?? true,
      duration: notification.duration ?? 5000,
    }

    notifications.value.push(newNotif)

    if (newNotif.duration && newNotif.duration > 0) {
      setTimeout(() => remove(id), newNotif.duration)
    }

    return id
  }

  function remove(id: string) {
    const idx = notifications.value.findIndex(n => n.id === id)
    if (idx !== -1) notifications.value.splice(idx, 1)
  }

  function success(title: string, message = '', duration = 5000) {
    return add({ type: 'success', title, message, duration })
  }

  function error(title: string, message = '', duration = 7000) {
    return add({ type: 'error', title, message, duration })
  }

  function warning(title: string, message = '', duration = 6000) {
    return add({ type: 'warning', title, message, duration })
  }

  function info(title: string, message = '', duration = 5000) {
    return add({ type: 'info', title, message, duration })
  }

  function clear() {
    notifications.value = []
  }

  return { notifications, add, remove, success, error, warning, info, clear }
})
