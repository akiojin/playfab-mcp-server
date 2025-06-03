/**
 * Type definitions for PlayFab API responses
 */

// Common types
export interface EntityKey {
  Id: string;
  Type: string;
}

export interface EntityLineage {
  CharacterId?: string;
  GroupId?: string;
  MasterPlayerAccountId?: string;
  NamespaceId?: string;
  TitleId?: string;
  TitlePlayerAccountId?: string;
}

// Catalog types
export interface CatalogItem {
  Id: string;
  Type: string;
  AlternateIds?: Array<{
    Type: string;
    Value: string;
  }>;
  Description?: Record<string, string>;
  DisplayProperties?: Record<string, unknown>;
  DisplayVersion?: string;
  ETag?: string;
  IsHidden?: boolean;
  ItemReferences?: Array<{
    Amount?: number;
    Id: string;
    PriceOptions?: Record<string, unknown>;
  }>;
  Keywords?: Record<string, any>;
  Moderation?: {
    Status: string;
    SubmittedVersion?: string;
    RejectionReasons?: string[];
  };
  Prices?: Array<{
    Amounts: Array<{
      ItemId: string;
      Amount: number;
    }>;
    UnitDurationInSeconds?: number;
  }>;
  PurchasabilitySettings?: Record<string, unknown>;
  Rating?: {
    Average?: number;
    Count1Star?: number;
    Count2Star?: number;
    Count3Star?: number;
    Count4Star?: number;
    Count5Star?: number;
    TotalCount?: number;
  };
  StartDate?: string;
  Tags?: string[];
  Title?: Record<string, string>;
  CreatorEntity?: EntityKey;
}

export interface SearchItemsResponse {
  Items: CatalogItem[];
  ContinuationToken?: string;
}

export interface GetItemResponse {
  Item: CatalogItem;
}

export interface CreateDraftItemResponse {
  Item: CatalogItem;
}

export interface UpdateDraftItemResponse {
  Item: CatalogItem;
}

export interface PublishDraftItemResponse {
  Item: CatalogItem;
}

export interface DeleteItemResponse {
  // Empty response
}

export interface CatalogConfig {
  IsCatalogEnabled: boolean;
  CatalogItems: CatalogConfigItem[];
  DeepLinkFormats?: DeepLinkFormat[];
  DisplayPropertyIndexInfos?: DisplayPropertyIndexInfo[];
  AdminEntities?: EntityKey[];
  UserGeneratedContent?: UserGeneratedContentSettings;
  Platforms?: string[];
}

export interface CatalogConfigItem {
  Id: string;
  Type: string;
  IsCatalogEnabled: boolean;
  IsHidden?: boolean;
  ContentType?: string;
  Tags?: string[];
  DisplayProperties?: Record<string, unknown>;
  DisplayPropertyIndexInfos?: DisplayPropertyIndexInfo[];
  Platforms?: string[];
}

export interface DeepLinkFormat {
  Platform: string;
  Format: string;
}

export interface DisplayPropertyIndexInfo {
  Name: string;
  Type: string;
}

export interface UserGeneratedContentSettings {
  IsEnabled: boolean;
  AllowedItemTypes?: string[];
}

export interface UpdateCatalogConfigResponse {
  // Empty response
}

export interface GetCatalogConfigResponse {
  Config: CatalogConfig;
}

// Inventory types
export interface InventoryItem {
  Id?: string;
  Type?: string;
  Amount?: number;
  DisplayProperties?: Record<string, unknown>;
  ExpirationDate?: string;
  StackId?: string;
}

export interface InventoryOperation {
  Add?: {
    Amount: number;
    DurationInSeconds?: number;
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
    };
    NewStackValues?: Record<string, unknown>;
  };
  Delete?: {
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
      StackId?: string;
    };
  };
  Purchase?: {
    Amount?: number;
    DeleteEmptyStacks?: boolean;
    DurationInSeconds?: number;
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
    };
    NewStackValues?: Record<string, unknown>;
    PriceAmounts: Array<{
      ItemId: string;
      Amount: number;
    }>;
    StoreId?: string;
  };
  Subtract?: {
    Amount: number;
    DeleteEmptyStacks?: boolean;
    DurationInSeconds?: number;
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
      StackId?: string;
    };
  };
  Transfer?: {
    Amount: number;
    DeleteEmptyStacks?: boolean;
    GivingEntity: EntityKey;
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
      StackId?: string;
    };
    ReceivingEntity: EntityKey;
  };
  Update?: {
    DurationInSeconds?: number;
    Item: {
      AlternateId?: {
        Type: string;
        Value: string;
      };
      Id?: string;
      StackId?: string;
    };
    NewStackValues?: Record<string, unknown>;
  };
}

export interface GetInventoryItemsResponse {
  Items: InventoryItem[];
  ContinuationToken?: string;
  ETag?: string;
}

export interface AddInventoryItemsResponse {
  ETag?: string;
  IdempotencyId?: string;
  TransactionIds?: string[];
}

export interface SubtractInventoryItemsResponse {
  ETag?: string;
  IdempotencyId?: string;
  TransactionIds?: string[];
}

export interface UpdateInventoryItemsResponse {
  ETag?: string;
  IdempotencyId?: string;
  TransactionIds?: string[];
}

export interface DeleteInventoryItemsResponse {
  ETag?: string;
  IdempotencyId?: string;
  TransactionIds?: string[];
}

export interface ExecuteInventoryOperationsResponse {
  ETag?: string;
  IdempotencyId?: string;
  TransactionIds?: string[];
}

export interface GetInventoryCollectionIdsResponse {
  CollectionIds: string[];
  ContinuationToken?: string;
}

export interface GrantItemsToUsersResponse {
  // Empty response
}

// Player types
export interface PlayerProfile {
  PlayerId: string;
  Created: string;
  LastLogin?: string;
  DisplayName?: string;
  AvatarUrl?: string;
  BannedUntil?: string;
  Statistics?: PlayerStatistic[];
  VirtualCurrencyBalances?: Record<string, number>;
  TotalValueToDateInUSD?: number;
  Tags?: string[];
  Locations?: PlayerLocation[];
  ContactEmailAddresses?: ContactEmailInfo[];
  LinkedAccounts?: LinkedPlatformAccountModel[];
  PlayerExperimentVariants?: string[];
  PublisherId?: string;
  TitleId?: string;
}

export interface PlayerStatistic {
  Id?: string;
  Name?: string;
  Value: number;
  Version: number;
}

export interface PlayerLocation {
  ContinentCode: string;
  CountryCode: string;
  City?: string;
  Latitude?: number;
  Longitude?: number;
}

export interface ContactEmailInfo {
  EmailAddress?: string;
  Name?: string;
  VerificationStatus?: string;
}

export interface LinkedPlatformAccountModel {
  Platform?: string;
  PlatformUserId?: string;
  Username?: string;
  Email?: string;
}

export interface GetUserAccountInfoResponse {
  UserInfo: {
    PlayFabId: string;
    Created: string;
    Username?: string;
    TitleInfo?: {
      DisplayName?: string;
      Created: string;
      LastLogin?: string;
      FirstLogin?: string;
      isBanned?: boolean;
    };
    PrivateInfo?: {
      Email?: string;
    };
    FacebookInfo?: {
      FacebookId?: string;
      FullName?: string;
    };
    GameCenterInfo?: {
      GameCenterId?: string;
    };
    GoogleInfo?: {
      GoogleId?: string;
      GoogleEmail?: string;
      GoogleLocale?: string;
      GoogleGender?: string;
    };
    SteamInfo?: {
      SteamId?: string;
      SteamCountry?: string;
      SteamCurrency?: string;
      SteamName?: string;
    };
    AppleInfo?: {
      AppleSubjectId?: string;
    };
  };
}

export interface BanInfo {
  PlayFabId: string;
  BanId?: string;
  IPAddress?: string;
  MACAddress?: string;
  Created?: string;
  Expires?: string;
  Reason?: string;
  Active: boolean;
}

export interface BanUsersResponse {
  BanData: BanInfo[];
}

export interface RevokeAllBansForUserResponse {
  BanData: BanInfo[];
}

export interface GetAllSegmentsResponse {
  Segments: Array<{
    Id: string;
    Name: string;
  }>;
}

export interface GetPlayersInSegmentResponse {
  ProfilesInSegment: number;
  ContinuationToken?: string;
  PlayerProfiles: PlayerProfile[];
}

export interface GetTitlePlayerAccountIdsResponse {
  TitlePlayerAccounts: Array<{
    Id: string;
    Type: string;
    TypeString: string;
  }>;
}

export interface UserDataRecord {
  Value?: string;
  LastUpdated: string;
  Permission?: string;
}

export interface GetUserDataResponse {
  PlayFabId: string;
  Data?: Record<string, UserDataRecord>;
  DataVersion: number;
}

export interface UpdateUserDataResponse {
  DataVersion: number;
}

// Title data types
export interface GetTitleDataResponse {
  Data?: Record<string, string>;
}

export interface SetTitleDataResponse {
  // Empty response
}

export interface GetTitleInternalDataResponse {
  Data?: Record<string, string>;
}

export interface SetTitleInternalDataResponse {
  // Empty response
}

export interface TitleNewsItem {
  NewsId: string;
  Timestamp: string;
  Title: string;
  Body: string;
  Tags?: string[];
}

export interface GetTitleNewsResponse {
  News: TitleNewsItem[];
}

export interface AddLocalizedNewsResponse {
  // Empty response
}

// Authentication types
export interface GetEntityTokenResponse {
  EntityToken: string;
  TokenExpiration: string;
  Entity?: EntityKey;
}