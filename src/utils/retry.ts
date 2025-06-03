/**
 * Retry utilities with PlayFab-specific logic
 */
import { PlayFabAPIError, RateLimitError, AuthenticationError } from './errors.js';
import { createLogger } from './logger.js';

const logger = createLogger('retry');

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
  jitter: boolean;
  retryableErrors: string[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  exponentialBackoff: true,
  jitter: true,
  retryableErrors: [
    // Network and server errors
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'INTERNAL_SERVER_ERROR',
    
    // PlayFab server errors (5xx range)
    'InternalServerError',
    'ServiceUnavailable',
    'RequestTimeout',
    
    // PlayFab throttling
    'APIRequestsDisallowedForTitle',
    'OverLimit',
    
    // Transient errors
    'TitleDeleted',
    'TitleNotActivated',
  ]
};

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: unknown, options: RetryOptions = DEFAULT_RETRY_OPTIONS): boolean {
  // Rate limit errors are always retryable but with specific handling
  if (error instanceof RateLimitError) {
    return true;
  }
  
  // Authentication errors are not retryable
  if (error instanceof AuthenticationError) {
    return false;
  }
  
  // PlayFab API errors - check the error code
  if (error instanceof PlayFabAPIError) {
    const errorCode = error.playfabError?.errorCode || error.code;
    return options.retryableErrors.includes(errorCode);
  }
  
  // Generic errors with HTTP status codes
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as any).statusCode;
    // Retry on 5xx errors and some 4xx errors
    return statusCode >= 500 || statusCode === 408 || statusCode === 429;
  }
  
  // Network errors (no status code)
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('timeout') || 
           message.includes('connection') ||
           message.includes('econnreset') ||
           message.includes('enotfound');
  }
  
  return false;
}

/**
 * Calculates the delay for a retry attempt
 */
export function calculateRetryDelay(
  attempt: number, 
  options: RetryOptions = DEFAULT_RETRY_OPTIONS,
  retryAfter?: number
): number {
  // Use retryAfter from rate limit response if available
  if (retryAfter) {
    const rateLimitDelay = retryAfter * 1000; // Convert to milliseconds
    return Math.min(rateLimitDelay, options.maxDelay);
  }
  
  let delay = options.baseDelay;
  
  if (options.exponentialBackoff) {
    delay = options.baseDelay * Math.pow(2, attempt);
  } else {
    delay = options.baseDelay * (attempt + 1);
  }
  
  // Apply jitter to avoid thundering herd
  if (options.jitter) {
    const jitterRange = delay * 0.1; // 10% jitter
    delay += (Math.random() * jitterRange * 2) - jitterRange;
  }
  
  return Math.min(delay, options.maxDelay);
}

/**
 * Retries a function with PlayFab-specific logic
 */
export async function retryWithPlayFabLogic<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const mergedOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= mergedOptions.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.debug({ attempt, maxRetries: mergedOptions.maxRetries }, 'Retrying function call');
      }
      
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Log the error
      logger.warn({
        attempt: attempt + 1,
        maxRetries: mergedOptions.maxRetries + 1,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          code: (error as any).code
        } : error
      }, 'Function call failed');
      
      // Don't retry if we've reached max attempts
      if (attempt >= mergedOptions.maxRetries) {
        break;
      }
      
      // Check if error is retryable
      if (!isRetryableError(error, mergedOptions)) {
        logger.debug({ error }, 'Error is not retryable, giving up');
        break;
      }
      
      // Calculate delay
      const retryAfter = error instanceof RateLimitError 
        ? (error.details as any)?.retryAfter 
        : undefined;
      
      const delay = calculateRetryDelay(attempt, mergedOptions, retryAfter);
      
      logger.info({
        attempt: attempt + 1,
        delay,
        retryAfter,
        nextAttemptIn: `${delay}ms`
      }, 'Retrying after delay');
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retry attempts failed
  logger.error({
    totalAttempts: mergedOptions.maxRetries + 1,
    lastError: lastError instanceof Error ? {
      name: lastError.name,
      message: lastError.message,
      code: (lastError as any).code
    } : lastError
  }, 'All retry attempts exhausted');
  
  throw lastError;
}

/**
 * Creates a retry middleware for the router
 */
export function createRetryMiddleware(options: Partial<RetryOptions> = {}) {
  return (next: (args: any) => Promise<any>) => {
    return async (args: any) => {
      return retryWithPlayFabLogic(() => next(args), options);
    };
  };
}

/**
 * PlayFab-specific retry configurations
 */
export const PLAYFAB_RETRY_CONFIGS = {
  // For player-facing APIs with strict rate limits
  strict: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 10000,
    exponentialBackoff: true,
    jitter: true,
  },
  
  // For admin/server APIs with more lenient limits
  standard: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 15000,
    exponentialBackoff: true,
    jitter: true,
  },
  
  // For bulk operations
  bulk: {
    maxRetries: 5,
    baseDelay: 5000,
    maxDelay: 60000,
    exponentialBackoff: true,
    jitter: true,
  }
} as const;