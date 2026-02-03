/**
 * Common type definitions
 */

export interface SuccessResponse<T = unknown> {
  success: true
  data?: T
  [key: string]: unknown
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

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

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
  [key: string]: unknown
}

// Handler-specific type definitions
export type HandlerParams<T = Record<string, unknown>> = T & Record<string, unknown>

export type HandlerResponse<T = unknown> = SuccessResponse<T> | ErrorResponse

export type PlayFabHandler<TParams = HandlerParams, TResponse = unknown> = (
  params: TParams
) => Promise<TResponse & { success: boolean }>

// Specific parameter types for common patterns
export interface SearchParams extends PaginatedRequest {
  Filter?: string
  OrderBy?: string
  Search?: string
}

export interface ItemParams {
  Id: string
  ETag?: string
}

export interface CollectionParams {
  CollectionId?: string
  Count?: number
}

export interface PlayerParams {
  PlayFabId?: string
  EntityId?: string
  EntityType?: string
}

export interface ConfirmationRequired {
  ConfirmDeletion?: boolean
  ConfirmBan?: boolean
}

// Re-export all PlayFab response types
export * from './playfab-responses.js'