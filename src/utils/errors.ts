/**
 * Custom error classes and error handling utilities
 */

export class PlayFabMCPError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'PlayFabMCPError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends PlayFabMCPError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends PlayFabMCPError {
  constructor(message: string, details?: unknown) {
    super(message, 'AUTHENTICATION_ERROR', 401, details)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends PlayFabMCPError {
  constructor(message: string, retryAfter?: number) {
    super(message, 'RATE_LIMIT_ERROR', 429, { retryAfter })
    this.name = 'RateLimitError'
  }
}

export class PlayFabAPIError extends PlayFabMCPError {
  constructor(
    message: string,
    public readonly playfabError: any,
    public readonly apiMethod?: string
  ) {
    super(
      message,
      playfabError?.errorCode ?? 'PLAYFAB_API_ERROR',
      playfabError?.code ?? 500,
      { playfabError, apiMethod }
    )
    this.name = 'PlayFabAPIError'
  }
}

/**
 * Formats error response in a consistent structure
 */
export function formatErrorResponse(error: unknown): {
  success: false
  error: {
    message: string
    code: string
    statusCode?: number
    details?: unknown
  }
} {
  const isDevelopment = process.env['NODE_ENV'] !== 'production'
  
  if (error instanceof PlayFabMCPError) {
    const details = isDevelopment ? error.details : undefined
    
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details,
      },
    }
  }

  if (error instanceof Error) {
    // In production, only return safe error information
    const details = isDevelopment ? {
      name: error.name,
      stack: error.stack,
    } : undefined
    
    return {
      success: false,
      error: {
        message: error.message,
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        details,
      },
    }
  }

  return {
    success: false,
    error: {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
      details: isDevelopment ? error : undefined,
    },
  }
}

/**
 * Type guard to check if an error is a PlayFab error
 */
export function isPlayFabError(error: unknown): error is {
  error?: string
  errorCode?: number
  errorMessage?: string
  code?: number
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('error' in error || 'errorCode' in error || 'errorMessage' in error)
  )
}

/**
 * Wraps PlayFab API errors in a consistent format
 */
export function wrapPlayFabError(
  error: unknown,
  apiMethod: string
): PlayFabAPIError {
  if (isPlayFabError(error)) {
    const message = error.errorMessage ?? error.error ?? 'PlayFab API error occurred'
    return new PlayFabAPIError(message, error, apiMethod)
  }
  
  return new PlayFabAPIError(
    'An unexpected error occurred while calling PlayFab API',
    error,
    apiMethod
  )
}