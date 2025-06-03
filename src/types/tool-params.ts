/**
 * Auto-generated TypeScript types for tool input parameters
 * Generated from MCP tool schemas
 */

import { HandlerParams } from './index.js';

// Base parameter interfaces derived from tool schemas

export interface SearchItemsBaseParams {
  /** Number of items to retrieve per page. Maximum is 50. Default is 10. */
  Count?: number;
  /** Token for retrieving the next page of results. Use null or omit for the first request. */
  ContinuationToken?: string;
  /** OData filter string to refine the search. Example: 'type eq 'ugc'' */
  Filter?: string;
  /** OData orderBy string to sort results. Example: 'rating/average asc' */
  OrderBy?: string;
  /** Text to search for in the catalog. Example: 'sword' */
  Search?: string;
}

export interface AddInventoryItemsBaseParams {
  /** The unique Title Player Account ID of the player to whom the item will be added. Example: 'E8F301D78C4C2346' */
  TitlePlayerAccountId: string;
  /** How many of the item to add. Must be a positive integer. Example: 1 */
  Amount: number;
  /** The collection to add the item to. Use 'default' unless you have a custom collection. */
  CollectionId?: string;
  /** How long (in seconds) until the item expires. Omit for permanent items. */
  DurationInSeconds?: number;
  /** A unique string to prevent duplicate requests. Use a UUID. */
  IdempotencyId?: string;
  /** The item to add, as an InventoryItemReference object. At minimum, specify the Id (item ID). */
  Item: Record<string, unknown>;
  /** Values to apply to a new stack created by this request. Use for custom display properties, etc. Optional. */
  NewStackValues?: Record<string, unknown>;
}

export interface GetInventoryItemsBaseParams {
  /** The optional custom tags associated with the request. */
  CustomTags?: Record<string, string>;
  /** The entity to perform this action on. */
  Entity: {
    /** The ID of the entity. */
    Id: string;
    /** The type of the entity. */
    Type: string;
  };
  /** An opaque token used to retrieve the next page of items. */
  ContinuationToken?: string;
  /** Number of items to retrieve. This value is optional. Maximum page size is 50. Default value is 10. */
  Count?: number;
  /** The inventory collection to retrieve items from. */
  CollectionId?: string;
  /** The filter expression. */
  Filter?: string;
}

export interface CreateDraftItemBaseParams {
  /** Whether the item should be published immediately. */
  Publish?: boolean;
  /** The item to create. */
  Item: Record<string, unknown>;
}

export interface GetItemBaseParams {
  /** ID of the catalog item to retrieve. */
  Id: string;
  /** An opaque token used to retrieve a particular revision of the item. */
  Entity?: Record<string, unknown>;
}

export interface UpdateDraftItemBaseParams {
  /** ID of the catalog item to update. */
  Id: string;
  /** The updated item properties. */
  Item: Record<string, unknown>;
}

export interface DeleteItemBaseParams {
  /** ID of the catalog item to delete. */
  Id: string;
}

export interface PublishDraftItemBaseParams {
  /** ID of the catalog item to publish. */
  Id: string;
  /** An opaque token used to retrieve a particular revision of the item. */
  ETag?: string;
}

export interface GetTitleDataBaseParams {
  /** Specific keys to retrieve from the title data. */
  Keys?: string[];
}

export interface SetTitleDataBaseParams {
  /** Key-value pairs to be written to the title data. */
  KeysAndValues: Record<string, string>;
}

export interface GetUserDataBaseParams {
  /** PlayFab unique identifier of the user whose custom data is being retrieved. */
  PlayFabId: string;
  /** Specific keys to search for in the custom user data. */
  Keys?: string[];
  /** The version that currently exists according to the caller. */
  IfChangedFromDataVersion?: number;
}

export interface UpdateUserDataBaseParams {
  /** PlayFab unique identifier of the user whose custom data is being updated. */
  PlayFabId: string;
  /** Key-value pairs to be written to the custom data. */
  Data?: Record<string, string>;
  /** Permission to be applied to all user data keys written in this request. */
  Permission?: 'Private' | 'Public';
  /** Optional list of Data-keys to remove from UserData. */
  KeysToRemove?: string[];
}

export interface BanUsersBaseParams {
  /** List of ban requests to be applied. Maximum 100. */
  Bans: Array<{
    /** PlayFab ID of the user to apply the ban to. */
    PlayFabId: string;
    /** The reason why this user is being banned. */
    Reason?: string;
    /** The duration (in hours) for the ban. Defaults to permanent ban. */
    DurationInHours?: number;
    /** The IP address range for the ban. */
    IPAddress?: string;
    /** The MAC address for the ban. */
    MACAddress?: string;
  }>;
}

export interface GetAllSegmentsBaseParams {
  // No parameters required for this endpoint
}

export interface GetPlayersInSegmentsBaseParams {
  /** Segment ID for which to retrieve player list. */
  SegmentId: string;
  /** Number of seconds to keep the continuation token active. */
  SecondsToLive?: number;
  /** Maximum number of profiles to load. */
  MaxBatchSize?: number;
  /** Continuation token if retrieving subsequent pages of results. */
  ContinuationToken?: string;
}

// Extended interfaces with HandlerParams
export interface SearchItemsParams extends HandlerParams<SearchItemsBaseParams> {}
export interface AddInventoryItemsParams extends HandlerParams<AddInventoryItemsBaseParams> {}
export interface GetInventoryItemsParams extends HandlerParams<GetInventoryItemsBaseParams> {}
export interface CreateDraftItemParams extends HandlerParams<CreateDraftItemBaseParams> {}
export interface GetItemParams extends HandlerParams<GetItemBaseParams> {}
export interface UpdateDraftItemParams extends HandlerParams<UpdateDraftItemBaseParams> {}
export interface DeleteItemParams extends HandlerParams<DeleteItemBaseParams> {}
export interface PublishDraftItemParams extends HandlerParams<PublishDraftItemBaseParams> {}
export interface GetTitleDataParams extends HandlerParams<GetTitleDataBaseParams> {}
export interface SetTitleDataParams extends HandlerParams<SetTitleDataBaseParams> {}
export interface GetUserDataParams extends HandlerParams<GetUserDataBaseParams> {}
export interface UpdateUserDataParams extends HandlerParams<UpdateUserDataBaseParams> {}
export interface BanUsersParams extends HandlerParams<BanUsersBaseParams> {}
export interface GetAllSegmentsParams extends HandlerParams<GetAllSegmentsBaseParams> {}
export interface GetPlayersInSegmentsParams extends HandlerParams<GetPlayersInSegmentsBaseParams> {}

// Type mappings for easy lookup
export interface ToolParamsMap {
  'search_items': SearchItemsParams;
  'add_inventory_items': AddInventoryItemsParams;
  'get_inventory_items': GetInventoryItemsParams;
  'create_draft_item': CreateDraftItemParams;
  'get_item': GetItemParams;
  'update_draft_item': UpdateDraftItemParams;
  'delete_item': DeleteItemParams;
  'publish_draft_item': PublishDraftItemParams;
  'get_title_data': GetTitleDataParams;
  'set_title_data': SetTitleDataParams;
  'get_user_data': GetUserDataParams;
  'update_user_data': UpdateUserDataParams;
  'ban_users': BanUsersParams;
  'get_all_segments': GetAllSegmentsParams;
  'get_players_in_segments': GetPlayersInSegmentsParams;
}

// Helper type to get params type for a specific tool
export type GetToolParams<T extends keyof ToolParamsMap> = ToolParamsMap[T];