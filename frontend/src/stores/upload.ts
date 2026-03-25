import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ImageUpload, IdentificationResult, FishPrediction } from '@/api/types'
import { uploadService } from '@/services/uploadService'
import { apiClient } from '@/lib/api'

export const useUploadStore = defineStore('upload', () => {
  const uploadHistory = ref<ImageUpload[]>([])
  const currentUpload = ref<ImageUpload | null>(null)
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  async function uploadImage(file: File, userId: string): Promise<ImageUpload | null> {
    error.value = null
    const id = 'img-' + Date.now()
    const previewUrl = URL.createObjectURL(file)

    const upload: ImageUpload = {
      id,
      file,
      previewUrl,
      status: 'uploading',
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    currentUpload.value = upload
    uploadHistory.value.unshift(upload)

    try {
      upload.progress = 30
      upload.status = 'processing'
      upload.progress = 70
      isProcessing.value = true

      // Send image to real YOLO backend for inference (also persists in DB)
      const result = await runModelInference(file, userId)
      if (result.imageId) {
        upload.id = result.imageId
      }
      if (result.imageUrl) {
        upload.previewUrl = result.imageUrl
      }
      upload.result = result
      upload.status = 'complete'
      upload.progress = 100

      return upload
    } catch (e: any) {
      upload.status = 'error'
      error.value = e.message || 'Identification failed'
      return null
    } finally {
      isProcessing.value = false
    }
  }

  async function runModelInference(
    file: File,
    userId: string
  ): Promise<IdentificationResult & { imageId?: string; imageUrl?: string }> {
    // Send image to the Python YOLO backend
    const formData = new FormData()
    formData.append('file', file)
    formData.append('user_id', userId)

    const response = await apiClient.post('/api/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000, // model inference may take longer on cold starts
    })

    const data = response.data
    const predictions: FishPrediction[] = (data.predictions || []).map((p: any) => ({
      speciesId: p.speciesId || '',
      speciesName: p.speciesName || 'Unknown',
      confidence: p.confidence || 0,
      boundingBox: p.boundingBox || undefined,
    }))

    const processingTime = data.processingTime || 0

    return {
      id: data.id || 'ir-' + Date.now(),
      imageId: data.imageId || '',
      imageUrl: data.imageUrl || '',
      predictions,
      processingTime,
      createdAt: new Date().toISOString(),
    }
  }

  async function loadHistory(userId: string) {
    error.value = null
    try {
      const { data, error: fetchError } = await uploadService.getUploadHistory(userId)
      if (fetchError) {
        error.value = fetchError.message
        return
      }
      uploadHistory.value = data
    } catch (e: any) {
      error.value = e.message || 'Failed to load history'
    }
  }

  async function clearHistory(userId: string) {
    error.value = null
    try {
      const { error: clearError } = await uploadService.clearHistory(userId)
      if (clearError) {
        error.value = clearError.message
        return
      }
      uploadHistory.value = []
    } catch (e: any) {
      error.value = e.message || 'Failed to clear history'
    }
  }

  async function removeUpload(id: string) {
    error.value = null
    try {
      const { error: deleteError } = await uploadService.deleteUpload(id)
      if (deleteError) {
        error.value = deleteError.message
        return
      }
      const idx = uploadHistory.value.findIndex(u => u.id === id)
      if (idx !== -1) uploadHistory.value.splice(idx, 1)
    } catch (e: any) {
      error.value = e.message || 'Failed to delete upload'
    }
  }

  return {
    uploadHistory,
    currentUpload,
    isProcessing,
    error,
    uploadImage,
    loadHistory,
    clearHistory,
    removeUpload,
  }
})
