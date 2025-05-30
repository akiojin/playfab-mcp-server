#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js"
import * as dotenv from "dotenv"
import * as pf from "playfab-sdk"

const PlayFab = pf.PlayFab as PlayFabModule.IPlayFab
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin
const PlayFabAuthenticationAPI = pf.PlayFabAuthentication as PlayFabAuthenticationModule.IPlayFabAuthentication
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy
const PlayFabProfileAPI = pf.PlayFabProfiles as PlayFabProfilesModule.IPlayFabProfiles

dotenv.config()

PlayFab.settings.titleId = process.env.PLAYFAB_TITLE_ID!
PlayFab.settings.developerSecretKey = process.env.PLAYFAB_DEV_SECRET_KEY!

const SEARCH_ITEMS_TOOL: Tool = {
  name: "search_items",
  description:
    "Executes a search against the public catalog using the provided search parameters and returns a set of paginated results. " +
    "Use Count for page size, Filter for OData-style filtering, OrderBy for sorting, and Search for text search. " +
    "More info: https://learn.microsoft.com/en-us/gaming/playfab/features/economy-v2/catalog/search",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Number of items to retrieve per page. Maximum is 50. Default is 10."
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
      Filter: {
        type: "string",
        description: "OData filter string to refine the search. Example: 'type eq \'ugc\''"
      },
      OrderBy: {
        type: "string",
        description: "OData orderBy string to sort results. Example: 'rating/average asc'"
      },
      Search: {
        type: "string",
        description: "Text to search for in the catalog. Example: 'sword'"
      }
    },
    required: [
      "Count"
    ],
  },
}

const GET_ALL_SEGMENTS_TOOL: Tool = {
  name: "get_all_segments",
  description:
    "Retrieves an array of player segment definitions. " +
    "Results from this can be used in subsequent API calls " +
    "such as GetPlayersInSegment which requires a Segment ID. " +
    "While segment names can change the ID for that segment will not change.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
}

const GET_PLAYERS_IN_SEGMENTS_TOOL: Tool = {
  name: "get_players_in_segments",
  description:
    "Retrieves a paginated list of player profiles in a specific segment." +
    "Use SegmentId to specify the segment. Use ContinuationToken for pagination.",
  inputSchema: {
    type: "object",
    properties: {
      SegmentId: {
        type: "string",
        description: "The ID of the segment to retrieve players from. You can get this from the get_all_segments tool."
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
    },
    required: [
      "SegmentId"
    ],
  },
}

const ADD_INVENTORY_ITEMS_TOOL: Tool = {
  name: "add_inventory_items",
  description:
    "Adds an item to a player's inventory." +
    "You must specify the Item (InventoryItemReference object) and TitlePlayerAccountId." +
    "Other parameters are optional." +
    "See: https://learn.microsoft.com/ja-jp/rest/api/playfab/economy/inventory/add-inventory-items?view=playfab-rest",
  inputSchema: {
    type: "object",
    properties: {
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player to whom the item will be added. Example: 'E8F301D78C4C2346'"
      },
      Amount: {
        type: "number",
        description: "How many of the item to add. Must be a positive integer. Example: 1"
      },
      CollectionId: {
        type: "string",
        description: "The collection to add the item to. Use 'default' unless you have a custom collection."
      },
      DurationInSeconds: {
        type: "number",
        description: "How long (in seconds) until the item expires. Omit for permanent items."
      },
      IdempotencyId: {
        type: "string",
        description: "A unique string to prevent duplicate requests. Use a UUID."
      },
      Item: {
        type: "object",
        description: "The item to add, as an InventoryItemReference object. At minimum, specify the Id (item ID)." +
        "StackId defaults to 'default', grouping items into the same stack; to create a separate stack for the same item ID, provide a unique StackId (e.g. a UUID)." +
        "AlternateId is for alternative item identifiers (e.g. external keys)." +
        "Example: { 'Id': 'item_12345' } or { 'Id': 'item_12345', 'StackId': 'unique_stack_001' }." +
        "See: https://learn.microsoft.com/ja-jp/rest/api/playfab/economy/inventory/add-inventory-items?view=playfab-rest#inventoryitemreference"
      },
      NewStackValues: {
        type: "object",
        description: "Values to apply to a new stack created by this request. Use for custom display properties, etc. Optional."
      }
    },
    required: [
      "TitlePlayerAccountId",
      "Item"
    ],
  },
}

const GET_INVENTORY_ITEMS_TOOL: Tool = {
  name: "get_inventory_items",
  description:
    "Retrieves the current inventory items for a specific player." +
    "You must provide the TitlePlayerAccountId." +
    "You can optionally specify a collection (CollectionId), a page size (Count), and a ContinuationToken for pagination.",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Number of items to retrieve per page. Maximum is 50. Default is 10. Example: 10"
      },
      CollectionId: {
        type: "string",
        description: "The collection ID to retrieve items from. Use 'default' unless you have a custom collection. Example: 'default'"
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player whose inventory you want to retrieve. Example: 'E8F301D78C4C2346'"
      }
    },
    required: [
      "Count",
      "TitlePlayerAccountId",
    ],
  },
}

const GET_INVENTORY_COLLECTION_IDS_TOOL: Tool = {
  name: "get_inventory_collection_ids",
  description:
    "Retrieves all inventory collection IDs for a specific player." +
    "Use this to list all collections before fetching items from them.",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Number of collection IDs to retrieve per page. Maximum is 50. Default is 10."
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player."
      }
    },
    required: [
      "Count",
      "TitlePlayerAccountId",
    ],
  },
}

const GET_TITLE_PLAYER_ACCOUNT_ID_FROM_PLAYFAB_ID_TOOL: Tool = {
  name: "get_title_player_account_id_from_playfab_id",
  description: "Converts a PlayFabId (master player account ID) to a TitlePlayerAccountId (used for inventory and other APIs).",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFabId (master player account ID) to convert. Example: '276427AE27FF98AC'"
      }
    },
    required: [ "PlayFabId" ],
  },
}

const DELETE_INVENTORY_ITEMS_TOOL: Tool = {
  name: "delete_inventory_items",
  description:
    "Deletes items from a player's inventory. " +
    "You must specify the Item (InventoryItemReference object) and TitlePlayerAccountId. " +
    "Warning: This permanently removes items from the player's inventory.",
  inputSchema: {
    type: "object",
    properties: {
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player whose items will be deleted."
      },
      CollectionId: {
        type: "string",
        description: "The collection to delete items from. Use 'default' unless you have a custom collection."
      },
      Item: {
        type: "object",
        description: "The item to delete, as an InventoryItemReference object. Specify the Id and optionally StackId."
      },
      IdempotencyId: {
        type: "string",
        description: "A unique string to prevent duplicate requests. Use a UUID."
      }
    },
    required: [
      "TitlePlayerAccountId",
      "Item"
    ],
  },
}

const SUBTRACT_INVENTORY_ITEMS_TOOL: Tool = {
  name: "subtract_inventory_items",
  description:
    "Subtracts a specific amount of items from a player's inventory. " +
    "Use this to reduce item quantities without completely removing them.",
  inputSchema: {
    type: "object",
    properties: {
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player."
      },
      Amount: {
        type: "number",
        description: "How many of the item to subtract. Must be a positive integer."
      },
      CollectionId: {
        type: "string",
        description: "The collection to subtract items from. Use 'default' unless you have a custom collection."
      },
      Item: {
        type: "object",
        description: "The item to subtract, as an InventoryItemReference object."
      },
      IdempotencyId: {
        type: "string",
        description: "A unique string to prevent duplicate requests. Use a UUID."
      },
      DurationInSeconds: {
        type: "number",
        description: "How long (in seconds) until the subtraction expires. Omit for permanent subtraction."
      }
    },
    required: [
      "TitlePlayerAccountId",
      "Amount",
      "Item"
    ],
  },
}

const UPDATE_INVENTORY_ITEMS_TOOL: Tool = {
  name: "update_inventory_items",
  description:
    "Updates properties of existing inventory items. " +
    "Use this to modify item metadata, display properties, or custom data.",
  inputSchema: {
    type: "object",
    properties: {
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player."
      },
      CollectionId: {
        type: "string",
        description: "The collection containing the items. Use 'default' unless you have a custom collection."
      },
      Item: {
        type: "object",
        description: "The item to update, as an InventoryItemReference object with Id and optionally StackId."
      },
      IdempotencyId: {
        type: "string",
        description: "A unique string to prevent duplicate requests. Use a UUID."
      }
    },
    required: [
      "TitlePlayerAccountId",
      "Item"
    ],
  },
}

const GRANT_ITEMS_TO_USERS_TOOL: Tool = {
  name: "grant_items_to_users",
  description:
    "Grants items to multiple players (Admin API). " +
    "Use this to distribute rewards, currencies, or items to players. " +
    "Note: For virtual currencies in Economy v2, use the currency item ID.",
  inputSchema: {
    type: "object",
    properties: {
      ItemGrants: {
        type: "array",
        description: "Array of item grant requests.",
        items: {
          type: "object",
          properties: {
            PlayFabId: { type: "string", description: "PlayFab ID of the player" },
            ItemId: { type: "string", description: "Item ID to grant (including currency items)" },
            Annotation: { type: "string", description: "Optional annotation for the grant" },
            Data: { 
              type: "object", 
              description: "Optional custom data for the item",
              additionalProperties: { type: "string" }
            }
          },
          required: ["PlayFabId", "ItemId"]
        }
      }
    },
    required: ["ItemGrants"],
  },
}

const REVOKE_INVENTORY_ITEMS_TOOL: Tool = {
  name: "revoke_inventory_items",
  description:
    "Revokes items from a player's inventory (Admin API). " +
    "Use this to remove items that were incorrectly granted or for administrative purposes.",
  inputSchema: {
    type: "object",
    properties: {
      Items: {
        type: "array",
        description: "Array of items to revoke.",
        items: {
          type: "object",
          properties: {
            PlayFabId: { type: "string", description: "PlayFab ID of the player" },
            ItemInstanceId: { type: "string", description: "Instance ID of the item to revoke" }
          },
          required: ["PlayFabId", "ItemInstanceId"]
        }
      }
    },
    required: ["Items"],
  },
}

const EXECUTE_INVENTORY_OPERATIONS_TOOL: Tool = {
  name: "execute_inventory_operations",
  description:
    "Execute multiple inventory operations in a single batch request. " +
    "Supports up to 50 operations per request. Operations are atomic - all succeed or all fail.",
  inputSchema: {
    type: "object",
    properties: {
      Operations: {
        type: "array",
        description: "Array of operations to execute.",
        items: {
          type: "object",
          properties: {
            Add: {
              type: "object",
              description: "Add operation details",
              properties: {
                Item: { type: "object" },
                Amount: { type: "number" },
                DurationInSeconds: { type: "number" }
              }
            },
            Delete: {
              type: "object",
              description: "Delete operation details",
              properties: {
                Item: { type: "object" }
              }
            },
            Subtract: {
              type: "object",
              description: "Subtract operation details",
              properties: {
                Item: { type: "object" },
                Amount: { type: "number" }
              }
            },
            Update: {
              type: "object",
              description: "Update operation details",
              properties: {
                Item: { type: "object" }
              }
            }
          }
        }
      },
      Entity: {
        type: "object",
        description: "Target entity for operations",
        properties: {
          Id: { type: "string", description: "Title Player Account ID" },
          Type: { type: "string", enum: ["title_player_account"] }
        },
        required: ["Id", "Type"]
      },
      CollectionId: {
        type: "string",
        description: "Collection ID (default: 'default')"
      },
      IdempotencyId: {
        type: "string",
        description: "Unique ID to prevent duplicate operations"
      }
    },
    required: ["Operations", "Entity"],
  },
}

const BAN_USERS_TOOL: Tool = {
  name: "ban_users",
  description:
    "Bans one or more players from the game. " +
    "Can ban by PlayFab ID, IP address, or MAC address. " +
    "Includes reason and duration options.",
  inputSchema: {
    type: "object",
    properties: {
      Bans: {
        type: "array",
        description: "Array of ban requests.",
        items: {
          type: "object",
          properties: {
            PlayFabId: { type: "string", description: "PlayFab ID to ban" },
            IPAddress: { type: "string", description: "IP address to ban" },
            MACAddress: { type: "string", description: "MAC address to ban" },
            Reason: { type: "string", description: "Reason for the ban" },
            DurationInHours: { type: "number", description: "Ban duration in hours (optional, permanent if not specified)" }
          }
        }
      }
    },
    required: ["Bans"],
  },
}

const REVOKE_ALL_BANS_FOR_USER_TOOL: Tool = {
  name: "revoke_all_bans_for_user",
  description:
    "Removes all active bans for a specific player. " +
    "This unbans the player completely.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player to unban."
      }
    },
    required: ["PlayFabId"],
  },
}

const GET_USER_ACCOUNT_INFO_TOOL: Tool = {
  name: "get_user_account_info",
  description:
    "Retrieves detailed account information for a player. " +
    "Includes profile data, statistics, and linked accounts.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player."
      }
    },
    required: ["PlayFabId"],
  },
}

const GET_USER_DATA_TOOL: Tool = {
  name: "get_user_data",
  description:
    "Retrieves custom data stored for a player. " +
    "Can retrieve specific keys or all data.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player."
      },
      Keys: {
        type: "array",
        items: { type: "string" },
        description: "Specific data keys to retrieve (optional, retrieves all if not specified)."
      }
    },
    required: ["PlayFabId"],
  },
}

const UPDATE_USER_DATA_TOOL: Tool = {
  name: "update_user_data",
  description:
    "Updates custom data for a player. " +
    "Can set multiple key-value pairs at once.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player."
      },
      Data: {
        type: "object",
        description: "Key-value pairs of data to update.",
        additionalProperties: { type: "string" }
      },
      Permission: {
        type: "string",
        enum: ["Private", "Public"],
        description: "Data permission level. Default is 'Private'."
      }
    },
    required: ["PlayFabId", "Data"],
  },
}

const SET_TITLE_DATA_TOOL: Tool = {
  name: "set_title_data",
  description:
    "Sets global configuration data for the title. " +
    "This data is accessible by all players and can be used for game settings, configurations, etc.",
  inputSchema: {
    type: "object",
    properties: {
      Key: {
        type: "string",
        description: "The key for the title data."
      },
      Value: {
        type: "string",
        description: "The value to set (JSON string for complex data)."
      }
    },
    required: ["Key", "Value"],
  },
}

const GET_TITLE_DATA_TOOL: Tool = {
  name: "get_title_data",
  description:
    "Retrieves global configuration data for the title. " +
    "Can retrieve specific keys or all title data.",
  inputSchema: {
    type: "object",
    properties: {
      Keys: {
        type: "array",
        items: { type: "string" },
        description: "Specific keys to retrieve (optional, retrieves all if not specified)."
      }
    },
  },
}

const SET_TITLE_INTERNAL_DATA_TOOL: Tool = {
  name: "set_title_internal_data",
  description:
    "Sets server-only title data that is not accessible by clients. " +
    "Use this for sensitive configuration like API keys, server settings, etc.",
  inputSchema: {
    type: "object",
    properties: {
      Key: {
        type: "string",
        description: "The key for the internal data."
      },
      Value: {
        type: "string",
        description: "The value to set (JSON string for complex data)."
      }
    },
    required: ["Key", "Value"],
  },
}

const GET_TITLE_INTERNAL_DATA_TOOL: Tool = {
  name: "get_title_internal_data",
  description:
    "Retrieves server-only title data. " +
    "This data is not accessible by game clients.",
  inputSchema: {
    type: "object",
    properties: {
      Keys: {
        type: "array",
        items: { type: "string" },
        description: "Specific keys to retrieve (optional, retrieves all if not specified)."
      }
    },
  },
}



async function SearchItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SearchItems(params, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
      } else {
        resolve({
          success: true,
          items: result.data.Items,
          continuationToken: result.data.ContinuationToken
        })
      }
    })
  })
}

async function GetAllSegments(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetAllSegments({}, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
      } else {
        resolve({
          success: true,
          segments: result.data.Segments || []
        })
      }
    })
  })
}

async function GetPlayersInSegments(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetPlayersInSegment(params, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        players: result.data.PlayerProfiles,
        continuationToken: result.data.ContinuationToken,
        profilesInSegment: result.data.ProfilesInSegment
      })
    })
  })
}

async function GetInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetInventoryItems({
      Count: params.Count,
      CollectionId: params.CollectionId,
      ContinuationToken: params.ContinuationToken,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        inventory: result.data.Items,
        continuationToken: result.data.ContinuationToken,
      })
    })
  })
}

async function GetInventoryCollectionIds(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetInventoryCollectionIds(params, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        collectionIds: result.data.CollectionIds,
        continuationToken: result.data.ContinuationToken,
      })
    })
  })
}

async function GetTitlePlayerAccountIdFromPlayFabId(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds(
      {
        TitleId: PlayFab.settings.titleId,
        MasterPlayerAccountIds: [params.PlayFabId],
      },
      (error, result) => {
        if (error) {
          reject(JSON.stringify(error, null, 2))
          return
        }
        const accounts = result.data.TitlePlayerAccounts || {}
        const account = accounts[params.PlayFabId]
        if (account && account.Id) {
          resolve({
            success: true,
            titlePlayerAccountId: account.Id,
          })
        } else {
          reject("TitlePlayerAccountId not found")
        }
      }
    )
  })
}

async function AddInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.AddInventoryItems({
      Amount: params.Amount,
      CollectionId: params.CollectionId,
      DurationInSeconds: params.DurationInSeconds,
      IdempotencyId: params.IdempotencyId,
      Item: params.Item,
      NewStackValues: params.NewStackValues,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}

async function DeleteInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.DeleteInventoryItems({
      CollectionId: params.CollectionId,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
      Item: params.Item,
      IdempotencyId: params.IdempotencyId,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}

async function SubtractInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SubtractInventoryItems({
      Amount: params.Amount,
      CollectionId: params.CollectionId,
      DurationInSeconds: params.DurationInSeconds,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
      Item: params.Item,
      IdempotencyId: params.IdempotencyId,
      DeleteEmptyStacks: true,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}

async function UpdateInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.UpdateInventoryItems({
      CollectionId: params.CollectionId,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
      Item: params.Item,
      IdempotencyId: params.IdempotencyId,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}

async function GrantItemsToUsers(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GrantItemsToUsers({
      ItemGrants: params.ItemGrants,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        itemGrantResults: result.data.ItemGrantResults,
      })
    })
  })
}

async function RevokeInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.RevokeInventoryItems({
      Items: params.Items,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        errors: result.data.Errors,
      })
    })
  })
}

async function ExecuteInventoryOperations(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.ExecuteInventoryOperations({
      Operations: params.Operations,
      Entity: params.Entity,
      CollectionId: params.CollectionId,
      IdempotencyId: params.IdempotencyId,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}

async function BanUsers(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.BanUsers({
      Bans: params.Bans,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        banData: result.data.BanData,
      })
    })
  })
}

async function RevokeAllBansForUser(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.RevokeAllBansForUser({
      PlayFabId: params.PlayFabId,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        banData: result.data.BanData,
      })
    })
  })
}

async function GetUserAccountInfo(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetUserAccountInfo({
      PlayFabId: params.PlayFabId,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        userInfo: result.data.UserInfo,
      })
    })
  })
}

async function GetUserData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetUserData({
      PlayFabId: params.PlayFabId,
      Keys: params.Keys,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        data: result.data.Data,
        dataVersion: result.data.DataVersion,
      })
    })
  })
}

async function UpdateUserData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.UpdateUserData({
      PlayFabId: params.PlayFabId,
      Data: params.Data,
      Permission: params.Permission || "Private",
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        dataVersion: result.data.DataVersion,
      })
    })
  })
}

async function SetTitleData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.SetTitleData({
      Key: params.Key,
      Value: params.Value,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
      })
    })
  })
}

async function GetTitleData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetTitleData({
      Keys: params.Keys,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        data: result.data.Data,
      })
    })
  })
}

async function SetTitleInternalData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.SetTitleInternalData({
      Key: params.Key,
      Value: params.Value,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
      })
    })
  })
}

async function GetTitleInternalData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetTitleInternalData({
      Keys: params.Keys,
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        data: result.data.Data,
      })
    })
  })
}



const server = new Server(
  {
    name: "playfab-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    SEARCH_ITEMS_TOOL,
    GET_ALL_SEGMENTS_TOOL,
    GET_PLAYERS_IN_SEGMENTS_TOOL,
    ADD_INVENTORY_ITEMS_TOOL,
    DELETE_INVENTORY_ITEMS_TOOL,
    SUBTRACT_INVENTORY_ITEMS_TOOL,
    UPDATE_INVENTORY_ITEMS_TOOL,
    GET_INVENTORY_ITEMS_TOOL,
    GET_INVENTORY_COLLECTION_IDS_TOOL,
    GET_TITLE_PLAYER_ACCOUNT_ID_FROM_PLAYFAB_ID_TOOL,
    GRANT_ITEMS_TO_USERS_TOOL,
    REVOKE_INVENTORY_ITEMS_TOOL,
    EXECUTE_INVENTORY_OPERATIONS_TOOL,
    BAN_USERS_TOOL,
    REVOKE_ALL_BANS_FOR_USER_TOOL,
    GET_USER_ACCOUNT_INFO_TOOL,
    GET_USER_DATA_TOOL,
    UPDATE_USER_DATA_TOOL,
    SET_TITLE_DATA_TOOL,
    GET_TITLE_DATA_TOOL,
    SET_TITLE_INTERNAL_DATA_TOOL,
    GET_TITLE_INTERNAL_DATA_TOOL,
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await new Promise((resolve, reject) => {
      PlayFabAuthenticationAPI.GetEntityToken({
        CustomTags: {
          user: PlayFab.buildIdentifier,
        }
      }, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        let toolPromise: Promise<any>;
        switch (name) {
          case "search_items":
            toolPromise = SearchItems(args);
            break;
          case "get_all_segments":
            toolPromise = GetAllSegments(args);
            break;
          case "get_players_in_segments":
            toolPromise = GetPlayersInSegments(args);
            break;
          case "add_inventory_items":
            toolPromise = AddInventoryItems(args);
            break;
          case "get_inventory_items":
            toolPromise = GetInventoryItems(args);
            break;
          case "get_inventory_collection_ids":
            toolPromise = GetInventoryCollectionIds(args);
            break;
          case "get_title_player_account_id_from_playfab_id":
            toolPromise = GetTitlePlayerAccountIdFromPlayFabId(args);
            break;
          case "delete_inventory_items":
            toolPromise = DeleteInventoryItems(args);
            break;
          case "subtract_inventory_items":
            toolPromise = SubtractInventoryItems(args);
            break;
          case "update_inventory_items":
            toolPromise = UpdateInventoryItems(args);
            break;
          case "grant_items_to_users":
            toolPromise = GrantItemsToUsers(args);
            break;
          case "revoke_inventory_items":
            toolPromise = RevokeInventoryItems(args);
            break;
          case "execute_inventory_operations":
            toolPromise = ExecuteInventoryOperations(args);
            break;
          case "ban_users":
            toolPromise = BanUsers(args);
            break;
          case "revoke_all_bans_for_user":
            toolPromise = RevokeAllBansForUser(args);
            break;
          case "get_user_account_info":
            toolPromise = GetUserAccountInfo(args);
            break;
          case "get_user_data":
            toolPromise = GetUserData(args);
            break;
          case "update_user_data":
            toolPromise = UpdateUserData(args);
            break;
          case "set_title_data":
            toolPromise = SetTitleData(args);
            break;
          case "get_title_data":
            toolPromise = GetTitleData(args);
            break;
          case "set_title_internal_data":
            toolPromise = SetTitleInternalData(args);
            break;
          case "get_title_internal_data":
            toolPromise = GetTitleInternalData(args);
            break;
          default:
            reject({
              content: [{ type: "text", text: `Unknown tool: ${name}` }],
              isError: true,
            });
            return;
        }
        toolPromise
          .then(toolResult => resolve(toolResult))
          .catch(toolError => reject(toolError));
      })
    })

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error occurred: ${error}` }],
      isError: true,
    }
  }
})

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("PlayFab Server running on stdio")
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error)
  process.exit(1)
})
