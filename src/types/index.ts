/**
 * Common type definitions
 */

export interface SuccessResponse<T = any> {
  success: true
  [key: string]: any
}

export interface ErrorResponse {
  success: false
  error: {
    message: string
    code: string
    statusCode?: number
    details?: unknown
  }
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

export interface PaginatedRequest {
  Count?: number
  ContinuationToken?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  continuationToken?: string
  totalCount?: number
}

export interface BatchOperationResult {
  success: boolean
  index: number
  error?: string
  [key: string]: any
}

export interface ConfirmationRequired {
  ConfirmDeletion?: boolean
  ConfirmBan?: boolean
}

// Re-export all PlayFab response types
export * from './playfab-responses.js'