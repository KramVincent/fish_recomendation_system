<template>
  <div class="w-full">
    <div
      :class="[
        'relative border-2 border-dashed rounded-lg p-8 transition-colors duration-200',
        isDragging ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-surface-300 dark:border-surface-600',
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'
      ]"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
      @click="!disabled && triggerFileInput()"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        class="hidden"
        :disabled="disabled"
        @change="onFileSelect"
      />
      
      <div class="flex flex-col items-center justify-center text-center">
        <svg class="h-16 w-16 text-surface-400 dark:text-surface-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        
        <p class="text-lg font-medium text-surface-900 dark:text-white mb-2">
          {{ isDragging ? 'Drop your fish image here' : 'Upload or drag fish image' }}
        </p>
        <p class="text-sm text-surface-500 dark:text-surface-400 mb-4">
          JPG, PNG, or WebP (max 5MB)
        </p>
        
        <div class="flex gap-3">
          <BaseButton size="md" :disabled="disabled">
            Choose File
          </BaseButton>
          
          <BaseButton 
            size="md" 
            variant="secondary"
            :disabled="disabled"
            @click.stop="openCamera"
          >
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use Camera
          </BaseButton>
        </div>
      </div>
    </div>
    
    <!-- Camera Modal -->
    <BaseModal :show="showCamera" @close="closeCamera" size="lg">
      <template #header>
        <h3 class="text-xl font-semibold">Capture Fish Photo</h3>
      </template>
      
      <div class="space-y-4">
        <div class="relative bg-surface-900 rounded-lg overflow-hidden" style="aspect-ratio: 4/3;">
          <video
            ref="videoRef"
            autoplay
            playsinline
            class="w-full h-full object-cover"
            v-show="!capturedPhoto"
          ></video>
          
          <img
            v-if="capturedPhoto"
            :src="capturedPhoto"
            alt="Captured photo"
            class="w-full h-full object-contain"
          />
          
          <canvas ref="canvasRef" class="hidden"></canvas>
          
          <!-- Camera controls overlay -->
          <div v-if="!capturedPhoto" class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div class="flex justify-center">
              <button
                type="button"
                @click="capturePhoto"
                class="w-16 h-16 rounded-full bg-white border-4 border-primary-500 hover:bg-surface-100 transition-all transform hover:scale-105 shadow-lg"
              >
                <span class="sr-only">Take photo</span>
              </button>
            </div>
          </div>
        </div>
        
        <p v-if="cameraError" class="text-sm text-avoid text-center">
          {{ cameraError }}
        </p>
        
        <div v-if="capturedPhoto" class="flex gap-3 justify-end">
          <BaseButton variant="secondary" @click="retakePhoto">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake
          </BaseButton>
          <BaseButton variant="primary" @click="usePhoto">
            <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Use Photo
          </BaseButton>
        </div>
      </div>
    </BaseModal>
    
    <!-- Preview -->
    <div v-if="previewUrl" class="mt-6 animate-scale-in">
      <div class="relative rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img :src="previewUrl" alt="Fish preview" class="w-full h-64 object-contain" />
        
        <button
          type="button"
          class="absolute top-2 right-2 p-2 bg-white dark:bg-surface-800 rounded-full shadow-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          @click="clearPreview"
        >
          <svg class="h-5 w-5 text-surface-600 dark:text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="absolute inset-x-0 bottom-0 h-2 bg-surface-200 dark:bg-surface-700">
          <div
            class="h-full bg-primary-500 transition-all duration-300"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>
      
      <div v-if="uploadProgress === 100" class="mt-4 flex items-center justify-center gap-2 text-safe">
        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-medium">Upload complete</span>
      </div>
    </div>
    
    <!-- Error Message -->
    <p v-if="errorMessage" class="mt-3 text-sm text-avoid">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'

interface Props {
  disabled?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)
const uploadProgress = ref(0)
const errorMessage = ref<string | null>(null)
const showCamera = ref(false)
const cameraError = ref<string | null>(null)
const capturedPhoto = ref<string | null>(null)
let mediaStream: MediaStream | null = null

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onDragOver() {
  isDragging.value = true
}

function onDragLeave() {
  isDragging.value = false
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function onFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFile(target.files[0])
  }
}

function handleFile(file: File) {
  errorMessage.value = null
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    errorMessage.value = 'Please upload an image file'
    return
  }
  
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = 'File size must be less than 5MB'
    return
  }
  
  // Create preview
  previewUrl.value = URL.createObjectURL(file)
  
  // Emit file immediately — actual progress is tracked in the upload store
  uploadProgress.value = 100
  emit('upload', file)
}

function clearPreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  uploadProgress.value = 0
  errorMessage.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Camera functions
async function openCamera() {
  showCamera.value = true
  cameraError.value = null
  capturedPhoto.value = null
  
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment', // Use back camera on mobile
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })
    
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
    }
  } catch (err) {
    console.error('Camera access error:', err)
    cameraError.value = 'Unable to access camera. Please check permissions.'
  }
}

function closeCamera() {
  stopCamera()
  showCamera.value = false
  capturedPhoto.value = null
}

function stopCamera() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
}

function capturePhoto() {
  if (!videoRef.value || !canvasRef.value) return
  
  const video = videoRef.value
  const canvas = canvasRef.value
  
  // Set canvas dimensions to match video
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  
  // Draw the video frame to canvas
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.9)
  }
}

function retakePhoto() {
  capturedPhoto.value = null
}

async function usePhoto() {
  if (!capturedPhoto.value) return
  
  try {
    // Convert base64 to blob
    const response = await fetch(capturedPhoto.value)
    const blob = await response.blob()
    
    // Create a File object
    const file = new File([blob], `fish-photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
    
    // Close camera and process the file
    closeCamera()
    handleFile(file)
  } catch (err) {
    console.error('Error processing photo:', err)
    errorMessage.value = 'Failed to process photo'
  }
}

// Cleanup on component unmount
onUnmounted(() => {
  stopCamera()
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>
