// Upload and identification persistence using backend API
import apiClient from '@/lib/api'
import type { ImageUpload, IdentificationResult, FishPrediction } from '@/api/types'

export const uploadService = {
  async uploadImage(
    userId: string,
    file: File
  ): Promise<{ data: ImageUpload | null; error: Error | null }> {
    try {
      // Upload is handled by /api/identify; this is kept for API parity
      const previewUrl = URL.createObjectURL(file)
      return { data: { id: '', previewUrl, status: 'processing', progress: 50, createdAt: new Date().toISOString() }, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async saveIdentificationResult(
    imageId: string,
    userId: string,
    predictions: FishPrediction[],
    processingTimeMs: number
  ): Promise<{ data: IdentificationResult | null; error: Error | null }> {
    try {
      // Results are persisted by the backend in /api/identify
      return {
        data: {
          id: '',
          imageId,
          predictions,
          processingTime: processingTimeMs,
          createdAt: new Date().toISOString(),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async getUploadHistory(
    userId: string,
    limit: number = 20
  ): Promise<{ data: ImageUpload[]; error: Error | null }> {
    try {
      const { data } = await apiClient.get<ImageUpload[]>('/api/uploads', { params: { user_id: userId, limit } })
      return { data: data || [], error: null }
    } catch (error) {
      return { data: [], error: error as Error }
    }
  },

  async getIdentificationResult(
    imageId: string
  ): Promise<{ data: IdentificationResult | null; error: Error | null }> {
    try {
      return { data: null, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  async deleteUpload(uploadId: string): Promise<{ error: Error | null }> {
    try {
      await apiClient.delete(`/api/uploads/${uploadId}`)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async clearHistory(userId: string): Promise<{ error: Error | null }> {
    try {
      const { data } = await apiClient.get<ImageUpload[]>('/api/uploads', { params: { user_id: userId, limit: 200 } })
      const uploads = data || []
      for (const upload of uploads) {
        await apiClient.delete(`/api/uploads/${upload.id}`)
      }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}

export default uploadService
