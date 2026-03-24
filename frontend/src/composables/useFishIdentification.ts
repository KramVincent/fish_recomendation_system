import { ref } from 'vue'
import type { ImageUpload } from '@/api/types'
import { useUploadStore } from '@/stores/upload'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

export function useFishIdentification() {
  const uploadStore = useUploadStore()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  
  const isProcessing = ref(false)
  const currentResult = ref<ImageUpload | null>(null)

  async function identifyFish(file: File) {
    if (!authStore.user) {
      notificationStore.error('Not authenticated', 'Please log in to identify fish.')
      return null
    }

    isProcessing.value = true
    currentResult.value = null

    try {
      const upload = await uploadStore.uploadImage(file, authStore.user.id)
      currentResult.value = upload
      
      if (upload?.result) {
        notificationStore.success(
          'Fish identified!',
          `Detected: ${upload.result.predictions[0]?.speciesName || 'Unknown'}`
        )
      }
      
      return upload
    } catch (error) {
      notificationStore.error('Identification failed', 'Please try again with a clearer image.')
      throw error
    } finally {
      isProcessing.value = false
    }
  }

  function clearResult() {
    currentResult.value = null
  }

  return {
    isProcessing,
    currentResult,
    identifyFish,
    clearResult,
  }
}
