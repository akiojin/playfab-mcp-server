/**
 * PlayFab API wrapper utilities
 */
import { PlayFabAuthenticationAPI } from '../config/playfab.js'
import { wrapPlayFabError, RateLimitError } from './errors.js'
import { logAPICall, createLogger } from './logger.js'
import { retryWithPlayFabLogic, PLAYFAB_RETRY_CONFIGS, RetryOptions } from './retry.js'

const getLogger = () => createLogger('playfab-wrapper')

export interface PlayFabApiCall<TRequest, TResponse> {
  (request: TRequest, callback: (error: unknown, result: { data: TResponse } | null) => void): void
}

/**
 * Wraps a PlayFab API call in a Promise with proper error handling and retry logic
 */
export async function callPlayFabApi<TRequest, TResponse>(
  apiMethod: PlayFabApiCall<TRequest, TResponse>,
  request: TRequest,
  methodName: string,
  retryOptions?: Partial<RetryOptions>
): Promise<TResponse> {
  // First, ensure we have a valid entity token
  await ensureEntityToken()
  
  // Use standard retry config by default, but allow override
  const finalRetryOptions = {
    ...PLAYFAB_RETRY_CONFIGS.standard,
    ...retryOptions
  }
  
  return retryWithPlayFabLogic(async () => {
    const startTime = Date.now()
    getLogger().debug(`Calling PlayFab API: ${methodName}`, { method: methodName })
    
    return new Promise<TResponse>((resolve, reject) => {
      apiMethod(request, (error, result) => {
        const duration = Date.now() - startTime
        
        if (error) {
          logAPICall(methodName, request, null, duration, error)
          
          // Check for rate limiting
          const errorObj = error as { code?: number; errorCode?: number; retryAfterSeconds?: number };
          if (errorObj.code === 429 || errorObj.errorCode === 1117) {
            reject(new RateLimitError(
              `Rate limit exceeded for ${methodName}`,
              errorObj.retryAfterSeconds
            ))
          } else {
            reject(wrapPlayFabError(error, methodName))
          }
          return
        }
        
        if (!result?.data) {
          const noDataError = new Error(`No data returned from ${methodName}`)
          logAPICall(methodName, request, null, duration, noDataError)
          reject(noDataError)
          return
        }
        
        logAPICall(methodName, request, result.data, duration)
        resolve(result.data)
      })
    })
  }, finalRetryOptions)
}

/**
 * Ensures we have a valid entity token for API calls
 */
let entityTokenPromise: Promise<void> | null = null
let tokenExpiresAt: Date | null = null

async function ensureEntityToken(): Promise<void> {
  // Check if we have a valid token
  if (tokenExpiresAt && tokenExpiresAt > new Date()) {
    return
  }
  
  // If we're already fetching a token, wait for it
  if (entityTokenPromise) {
    await entityTokenPromise
    return
  }
  
  // Fetch a new token
  entityTokenPromise = fetchEntityToken()
  await entityTokenPromise
  entityTokenPromise = null
}

async function fetchEntityToken(): Promise<void> {
  return new Promise((resolve, reject) => {
    PlayFabAuthenticationAPI.GetEntityToken(
      {
        CustomTags: {
          mcp: 'true'
        }
      },
      (error: unknown, result: { data?: { TokenExpiration?: string } } | null) => {
        if (error) {
          reject(wrapPlayFabError(error, 'GetEntityToken'))
          return
        }
        
        if (result?.data?.TokenExpiration) {
          tokenExpiresAt = new Date(result.data.TokenExpiration)
        }
        
        resolve()
      }
    )
  })
}

/**
 * Add custom tags to a request
 */
export function addCustomTags<T>(
  request: T,
  tags: Record<string, string> = {}
): T & { CustomTags: Record<string, string> } {
  return {
    ...request,
    CustomTags: {
      mcp: 'true',
      ...tags,
      ...((request as Record<string, unknown>)['CustomTags'] || {})
    }
  }
}

/**
 * Convenience functions for different API categories
 */

// For player-facing inventory and economy operations with strict limits
export async function callPlayerAPI<TRequest, TResponse>(
  apiMethod: PlayFabApiCall<TRequest, TResponse>,
  request: TRequest,
  methodName: string
): Promise<TResponse> {
  return callPlayFabApi(apiMethod, request, methodName, PLAYFAB_RETRY_CONFIGS.strict)
}

// For admin/server operations
export async function callAdminAPI<TRequest, TResponse>(
  apiMethod: PlayFabApiCall<TRequest, TResponse>,
  request: TRequest,
  methodName: string
): Promise<TResponse> {
  return callPlayFabApi(apiMethod, request, methodName, PLAYFAB_RETRY_CONFIGS.standard)
}

// For bulk operations
export async function callBulkAPI<TRequest, TResponse>(
  apiMethod: PlayFabApiCall<TRequest, TResponse>,
  request: TRequest,
  methodName: string
): Promise<TResponse> {
  return callPlayFabApi(apiMethod, request, methodName, PLAYFAB_RETRY_CONFIGS.bulk)
}