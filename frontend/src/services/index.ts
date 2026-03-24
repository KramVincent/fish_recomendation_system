// Export all services
export { authService } from './authService'
export { fishService } from './fishService'
export { healthService } from './healthService'
export { profileService } from './profileService'
export { recommendationService } from './recommendationService'
export { uploadService } from './uploadService'

// Default export as object
import { authService } from './authService'
import { fishService } from './fishService'
import { healthService } from './healthService'
import { profileService } from './profileService'
import { recommendationService } from './recommendationService'
import { uploadService } from './uploadService'

export default {
  auth: authService,
  fish: fishService,
  health: healthService,
  profile: profileService,
  recommendation: recommendationService,
  upload: uploadService,
}
