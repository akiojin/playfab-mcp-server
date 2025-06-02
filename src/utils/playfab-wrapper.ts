/**
 * PlayFab API wrapper utilities
 */
import { PlayFabAuthenticationAPI } from '../config/playfab.js'
import { wrapPlayFabError, RateLimitError } from './errors.js'

export interface PlayFabApiCall<TRequest, TResponse> {
  (request: TRequest, callback: (error: any, result: { data: TResponse }) => void): void
}

/**
 * Wraps a PlayFab API call in a Promise with proper error handling
 */
export async function callPlayFabApi<TRequest, TResponse>(
  apiMethod: PlayFabApiCall<TRequest, TResponse>,
  request: TRequest,
  methodName: string
): Promise<TResponse> {
  // First, ensure we have a valid entity token
  await ensureEntityToken()
  
  return new Promise((resolve, reject) => {
    apiMethod(request, (error, result) => {
      if (error) {
        // Check for rate limiting
        if (error.code === 429 || error.errorCode === 1117) {
          reject(new RateLimitError(
            `Rate limit exceeded for ${methodName}`,
            error.retryAfterSeconds
          ))
        } else {
          reject(wrapPlayFabError(error, methodName))
        }
        return
      }
      
      if (!result?.data) {
        reject(new Error(`No data returned from ${methodName}`))
        return
      }
      
      resolve(result.data)
    })
  })
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
      (error, result) => {
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
export function addCustomTags<T extends { CustomTags?: any }>(
  request: T,
  tags: Record<string, string> = {}
): T {
  return {
    ...request,
    CustomTags: {
      mcp: 'true',
      ...tags,
      ...(request.CustomTags || {})
    }
  }
}