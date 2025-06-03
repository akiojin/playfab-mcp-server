/**
 * Common handler parameter and result type definitions
 */

import { HandlerParams, HandlerResponse, PlayFabHandler } from './index.js';

// Title API Types
export interface GetTitleDataParams extends HandlerParams {
  Keys?: string[];
}

export interface GetTitleDataResult {
  data: Record<string, string>;
}

export interface SetTitleDataParams extends HandlerParams {
  KeysAndValues: Record<string, string>;
}

export interface SetTitleDataResult {
  message: string;
}

export interface GetTitleInternalDataParams extends HandlerParams {
  Keys?: string[];
}

export interface GetTitleInternalDataResult {
  data: Record<string, string>;
}

export interface SetTitleInternalDataParams extends HandlerParams {
  KeysAndValues: Record<string, string>;
}

export interface SetTitleInternalDataResult {
  message: string;
}

export interface GetTitleNewsParams extends HandlerParams {
  Count?: number;
}

export interface GetTitleNewsResult {
  news: Array<{
    NewsId: string;
    Title: string;
    Body: string;
    Timestamp: string;
  }>;
}

// Catalog API Types
export interface UpdateDraftItemParams extends HandlerParams {
  ItemId: string;
  Item: {
    Title?: Record<string, string>;
    Description?: Record<string, string>;
    Type?: string;
    Keywords?: any;
    DisplayProperties?: any;
    ItemReferences?: Array<{
      Id?: string;
      Amount?: number;
    }>;
    Images?: Array<{
      Id?: string;
      Type?: string;
      Url?: string;
      Tag?: string;
    }>;
    Contents?: Array<{
      Id?: string;
      MaxClientVersion?: string;
      MinClientVersion?: string;
      Url?: string;
      UploadUrl?: string;
    }>;
    ContentType?: string;
    Platforms?: string[];
    Tags?: string[];
    StartDate?: string;
    EndDate?: string;
    IsHidden?: boolean;
  };
  Publish?: boolean;
}

export interface UpdateDraftItemResult {
  item: {
    Id: string;
    ETag?: string;
  };
}

export interface CreateDraftItemParams extends HandlerParams {
  Item: {
    Id?: string;
    Title?: Record<string, string>;
    Description?: Record<string, string>;
    Type?: string;
    Keywords?: any;
    DisplayProperties?: any;
    ItemReferences?: Array<{
      Id?: string;
      Amount?: number;
    }>;
    Images?: Array<{
      Id?: string;
      Type?: string;
      Url?: string;
      Tag?: string;
    }>;
    Contents?: Array<{
      Id?: string;
      MaxClientVersion?: string;
      MinClientVersion?: string;
      Url?: string;
      UploadUrl?: string;
    }>;
    ContentType?: string;
    Platforms?: string[];
    Tags?: string[];
    StartDate?: string;
    EndDate?: string;
    IsHidden?: boolean;
  };
  Publish?: boolean;
}

export interface CreateDraftItemResult {
  item: {
    Id: string;
    ETag?: string;
  };
}

export interface BatchCreateDraftItemsParams extends HandlerParams {
  Items: Array<{
    Id?: string;
    Title?: Record<string, string>;
    Description?: Record<string, string>;
    Type?: string;
    Keywords?: any;
    DisplayProperties?: any;
    ItemReferences?: Array<{
      Id?: string;
      Amount?: number;
    }>;
    Images?: Array<{
      Id?: string;
      Type?: string;
      Url?: string;
      Tag?: string;
    }>;
    Contents?: Array<{
      Id?: string;
      MaxClientVersion?: string;
      MinClientVersion?: string;
      Url?: string;
      UploadUrl?: string;
    }>;
    ContentType?: string;
    Platforms?: string[];
    Tags?: string[];
    StartDate?: string;
    EndDate?: string;
    IsHidden?: boolean;
  }>;
  Publish?: boolean;
}

export interface BatchCreateDraftItemsResult {
  items: Array<{
    Id: string;
    ETag?: string;
  }>;
  failedItems: Array<{
    index: number;
    error: string;
  }>;
}

export interface PublishDraftItemParams extends HandlerParams {
  ItemId: string;
  ETag?: string;
}

export interface PublishDraftItemResult {
  success: boolean;
}

export interface DeleteItemParams extends HandlerParams {
  ItemId: string;
  ConfirmDeletion?: boolean;
  Entity?: {
    Id: string;
    Type: string;
  };
}

export interface DeleteItemResult {
  message: string;
}

export interface GetItemParams extends HandlerParams {
  ItemId: string;
  Entity?: {
    Id: string;
    Type: string;
  };
}

export interface GetItemResult {
  item: any;
}

export interface GetCatalogConfigParams extends HandlerParams {
  // No specific parameters
}

export interface GetCatalogConfigResult {
  config: Record<string, unknown>;
}

export interface UpdateCatalogConfigParams extends HandlerParams {
  ContentTypes?: string[];
  Tags?: string[];
}

export interface UpdateCatalogConfigResult {
  message: string;
}

// Player API Types
export interface GetUserAccountInfoParams extends HandlerParams {
  PlayFabId?: string;
  Username?: string;
  Email?: string;
  TitleDisplayName?: string;
}

export interface GetUserAccountInfoResult {
  userInfo: Record<string, unknown>;
}

export interface GetUserDataParams extends HandlerParams {
  PlayFabId: string;
  Keys?: string[];
  IfChangedFromDataVersion?: number;
}

export interface GetUserDataResult {
  data: Record<string, {
    Value: string;
    LastUpdated: string;
    Permission: string;
  }>;
  dataVersion: number;
}

export interface UpdateUserDataParams extends HandlerParams {
  PlayFabId: string;
  Data?: Record<string, string>;
  KeysToRemove?: string[];
  Permission?: 'Private' | 'Public';
}

export interface UpdateUserDataResult {
  dataVersion: number;
}

export interface BanUsersParams extends HandlerParams {
  Bans: Array<{
    PlayFabId: string;
    IPAddress?: string;
    MACAddress?: string;
    Reason?: string;
    DurationInHours?: number;
  }>;
}

export interface BanUsersResult {
  banData: Array<{
    PlayFabId: string;
    BanId?: string;
  }>;
}

export interface RevokeAllBansForUserParams extends HandlerParams {
  PlayFabId: string;
}

export interface RevokeAllBansForUserResult {
  banData: Array<{
    BanId: string;
    PlayFabId: string;
    Created: string;
    Expires?: string;
    IPAddress?: string;
    MACAddress?: string;
    Reason?: string;
    Active: boolean;
  }>;
}

export interface GetPlayersInSegmentsParams extends HandlerParams {
  SegmentId: string;
  SecondsToLive?: number;
  MaxBatchSize?: number;
  ContinuationToken?: string;
}

export interface GetPlayersInSegmentsResult {
  profilesInSegment: number;
  continuationToken?: string;
  playerProfiles: unknown[];
}

export interface GetAllSegmentsParams extends HandlerParams {
  // No specific parameters
}

export interface GetAllSegmentsResult {
  segments: Array<{
    Id: string;
    Name: string;
    Description?: string;
  }>;
}

export interface GetTitlePlayerAccountIdsParams extends HandlerParams {
  PlayFabIds: string[];
}

export interface GetTitlePlayerAccountIdsResult {
  accountData: Array<{
    PlayFabId: string;
    TitlePlayerAccountId?: string;
    Entity?: {
      Id: string;
      Type: string;
      TypeString: string;
    };
  }>;
}

// Inventory API Types
export interface GetInventoryItemsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  CollectionId?: string;
  Count?: number;
  ContinuationToken?: string;
  Filter?: string;
}

export interface GetInventoryItemsResult {
  items: unknown[];
  continuationToken?: string;
  eTag?: string;
}

export interface GetInventoryCollectionIdsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  Count?: number;
  ContinuationToken?: string;
}

export interface GetInventoryCollectionIdsResult {
  collectionIds: string[];
  continuationToken?: string;
}

export interface DeleteInventoryItemsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  IdempotencyId?: string;
  Item: {
    Id?: string;
    StackId?: string;
    InstanceId?: string;
  };
  CollectionId?: string;
  DeleteTimestamp?: number;
}

export interface DeleteInventoryItemsResult {
  eTag?: string;
  idempotencyId?: string;
  transactionIds?: string[];
}

export interface SubtractInventoryItemsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  Amount: number;
  CollectionId?: string;
  DurationInSeconds?: number;
  IdempotencyId?: string;
  Item: {
    Id?: string;
    StackId?: string;
    InstanceId?: string;
  };
}

export interface SubtractInventoryItemsResult {
  eTag?: string;
  idempotencyId?: string;
  transactionIds?: string[];
}

export interface UpdateInventoryItemsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  IdempotencyId?: string;
  Item: {
    Id?: string;
    StackId?: string;
    InstanceId?: string;
    DisplayProperties?: any;
    Type?: string;
  };
  CollectionId?: string;
}

export interface UpdateInventoryItemsResult {
  eTag?: string;
  idempotencyId?: string;
  transactionIds?: string[];
}

export interface ExecuteInventoryOperationsParams extends HandlerParams {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  CollectionId?: string;
  IdempotencyId?: string;
  Operations: Array<{
    Type: 'Add' | 'Delete' | 'Subtract' | 'Update' | 'Transfer' | 'Purchase';
    Add?: {
      Amount: number;
      DurationInSeconds?: number;
      Item: Record<string, unknown>;
      NewStackValues?: Record<string, unknown>;
    };
    Delete?: {
      Item: Record<string, unknown>;
    };
    Subtract?: {
      Amount: number;
      DurationInSeconds?: number;
      Item: Record<string, unknown>;
    };
    Update?: {
      Item: Record<string, unknown>;
    };
    Transfer?: {
      Amount: number;
      Item: Record<string, unknown>;
      GivingEntity: {
        Id: string;
        Type: string;
      };
      ReceivingEntity: {
        Id: string;
        Type: string;
      };
    };
    Purchase?: {
      Amount: number;
      DurationInSeconds?: number;
      Item: Record<string, unknown>;
      NewStackValues?: Record<string, unknown>;
      PriceAmounts: Array<{
        Amount: number;
        ItemId: string;
      }>;
      StoreId?: string;
      DeleteEmptyStacks?: boolean;
    };
  }>;
}

export interface ExecuteInventoryOperationsResult {
  eTag?: string;
  idempotencyId?: string;
  transactionIds?: string[];
}

export interface GrantItemsToUsersParams extends HandlerParams {
  CatalogVersion?: string;
  ItemGrants: Array<{
    PlayFabId: string;
    ItemId: string;
    Annotation?: string;
    CharacterId?: string;
    Data?: Record<string, string>;
    KeysToRemove?: string[];
  }>;
}

export interface GrantItemsToUsersResult {
  itemGrantResults: Array<{
    PlayFabId: string;
    Result: boolean;
    ItemGrantResults?: Array<{
      ItemId: string;
      ItemInstanceId?: string;
      ItemClass?: string;
      PurchaseDate?: string;
      Expiration?: string;
      RemainingUses?: number;
      UsesIncrementedBy?: number;
      Annotation?: string;
      CatalogVersion?: string;
      DisplayName?: string;
      UnitCurrency?: string;
      UnitPrice?: number;
      BundleParent?: string;
      CustomData?: Record<string, string>;
    }>;
  }>;
}