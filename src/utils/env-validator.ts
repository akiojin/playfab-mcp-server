/**
 * Environment variable validation utilities
 */

export interface RequiredEnvVars {
  PLAYFAB_TITLE_ID: string
  PLAYFAB_DEV_SECRET_KEY: string
}

export class EnvironmentValidationError extends Error {
  constructor(
    public readonly missingVars: string[],
    public readonly invalidVars: string[]
  ) {
    const messages: string[] = []
    
    if (missingVars.length > 0) {
      messages.push(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
    
    if (invalidVars.length > 0) {
      messages.push(`Invalid environment variables: ${invalidVars.join(', ')}`)
    }
    
    super(messages.join('. '))
    this.name = 'EnvironmentValidationError'
  }
}

/**
 * Validates that all required environment variables are present and valid
 */
export function validateEnvironment(): RequiredEnvVars {
  const missingVars: string[] = []
  const invalidVars: string[] = []
  
  // Check PLAYFAB_TITLE_ID
  const titleId = process.env['PLAYFAB_TITLE_ID']
  if (!titleId) {
    missingVars.push('PLAYFAB_TITLE_ID')
  } else if (titleId.trim().length === 0) {
    invalidVars.push('PLAYFAB_TITLE_ID (cannot be empty)')
  } else if (!/^[A-F0-9]{5}$/.test(titleId.trim())) {
    invalidVars.push('PLAYFAB_TITLE_ID (must be 5 hexadecimal characters)')
  }
  
  // Check PLAYFAB_DEV_SECRET_KEY
  const secretKey = process.env['PLAYFAB_DEV_SECRET_KEY']
  if (!secretKey) {
    missingVars.push('PLAYFAB_DEV_SECRET_KEY')
  } else if (secretKey.trim().length === 0) {
    invalidVars.push('PLAYFAB_DEV_SECRET_KEY (cannot be empty)')
  } else if (secretKey.trim().length < 32) {
    invalidVars.push('PLAYFAB_DEV_SECRET_KEY (must be at least 32 characters)')
  }
  
  // Throw error if any validation failed
  if (missingVars.length > 0 || invalidVars.length > 0) {
    throw new EnvironmentValidationError(missingVars, invalidVars)
  }
  
  return {
    PLAYFAB_TITLE_ID: titleId!.trim(),
    PLAYFAB_DEV_SECRET_KEY: secretKey!.trim(),
  }
}

/**
 * Checks if running in production environment
 */
export function isProduction(): boolean {
  return process.env['NODE_ENV'] === 'production'
}

/**
 * Checks if running in development environment
 */
export function isDevelopment(): boolean {
  return process.env['NODE_ENV'] !== 'production'
}

/**
 * Gets the current environment name
 */
export function getEnvironmentName(): string {
  return process.env['NODE_ENV'] ?? 'development'
}