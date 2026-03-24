import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = 'https://dvoqjmfmjgqzyzjdhvpf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2b3FqbWZtamdxenl6amRodnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTI5NDcsImV4cCI6MjA4NjE4ODk0N30.LYoucqUvclnhLZNiQjEbfEEKtoNxkqMkJ2ehENDnhlw'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Helper function to get storage URL for images
export function getStorageUrl(bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// Upload file to storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    return { url: '', error }
  }

  const url = getStorageUrl(bucket, data.path)
  return { url, error: null }
}

// Delete file from storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

export default supabase
