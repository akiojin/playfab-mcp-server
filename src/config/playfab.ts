/**
 * PlayFab configuration and initialization
 */
import * as dotenv from 'dotenv'
import * as pf from 'playfab-sdk'
import { validateEnvironment } from '../utils/env-validator'

// Load environment variables
dotenv.config()

// Validate required environment variables
const env = validateEnvironment()

// Export PlayFab modules with proper typing
export const PlayFab = pf.PlayFab as PlayFabModule.IPlayFab
export const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin
export const PlayFabAuthenticationAPI = pf.PlayFabAuthentication as PlayFabAuthenticationModule.IPlayFabAuthentication
export const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy
export const PlayFabProfileAPI = pf.PlayFabProfiles as PlayFabProfilesModule.IPlayFabProfiles
export const PlayFabServerAPI = pf.PlayFabServer as PlayFabServerModule.IPlayFabServer

// Configure PlayFab settings
PlayFab.settings.titleId = env.PLAYFAB_TITLE_ID
PlayFab.settings.developerSecretKey = env.PLAYFAB_DEV_SECRET_KEY

/**
 * Get current PlayFab configuration
 */
export function getPlayFabConfig() {
  return {
    titleId: PlayFab.settings.titleId,
    hasSecretKey: !!PlayFab.settings.developerSecretKey,
  }
}

/**
 * Check if PlayFab is properly configured
 */
export function isPlayFabConfigured(): boolean {
  return !!(PlayFab.settings.titleId && PlayFab.settings.developerSecretKey)
}