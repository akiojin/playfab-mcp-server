/**
 * Inventory-related type definitions
 */

export interface InventoryItem {
  Id: string
  StackId?: string
  DisplayProperties?: Record<string, unknown>
  [key: string]: unknown
}

export interface InventoryItemReference {
  Id: string
  StackId?: string
  AlternateId?: {
    Type: string
    Value: string
  }
}

export interface InventoryOperation {
  Add?: {
    Item: InventoryItemReference
    Amount?: number
    DurationInSeconds?: number
  }
  Delete?: {
    Item: InventoryItemReference
  }
  Subtract?: {
    Item: InventoryItemReference
    Amount: number
  }
  Update?: {
    Item: InventoryItemReference
  }
}

export interface EntityKey {
  Id: string
  Type: string
}

export interface InventoryRequest {
  Entity?: EntityKey
  CollectionId?: string
  IdempotencyId?: string
  CustomTags?: Record<string, string>
}