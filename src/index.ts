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
    "Searches for items in the PlayFab catalog (Economy v2). Use this when you need to find items by name, type, or other properties. " +
    "Common uses: Finding all weapons, searching for items containing 'sword', filtering by price range. " +
    "Returns item details including ID, name, description, and prices. " +
    "Supports pagination for large result sets. Use the returned items' IDs with inventory management tools.",
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
    "Grants items or virtual currency to a player's inventory. Use this when you need to: " +
    "1) Give rewards to players, 2) Add purchased items, 3) Grant virtual currency (use currency item ID). " +
    "For bulk operations across multiple players, use grant_items_to_users instead. " +
    "Note: In Economy v2, virtual currencies are items - use their item IDs, not currency codes.",
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
        "StackId determines how items stack: if not specified, uses the item's DefaultStackId. Same StackId = items stack together, different StackId = separate stacks." +
        "Use a unique StackId (e.g., UUID) to force a new stack even for stackable items." +
        "AlternateId is for alternative item identifiers (e.g. external keys)." +
        "Example: { 'Id': 'potion_health' } (uses DefaultStackId) or { 'Id': 'sword_rare', 'StackId': 'unique_001' } (custom stack)"
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
  description: 
    "Converts a PlayFabId to TitlePlayerAccountId. IMPORTANT: Use this before any inventory operations! " +
    "PlayFabId (from login/user info) ≠ TitlePlayerAccountId (needed for inventory). " +
    "Example flow: Get PlayFabId from user data → Convert with this tool → Use result for inventory APIs.",
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
    "Bans players from accessing the game. Use when: 1) Player violates terms, 2) Suspicious activity detected, 3) Temporary suspension needed. " +
    "Can ban by: PlayFabId (specific player), IPAddress (block IP), MACAddress (block device). " +
    "Set DurationInHours for temp bans, omit for permanent. Always include clear Reason for records.",
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
    "Sets global game configuration visible to ALL players. Use for: " +
    "1) Game version info, 2) Event schedules, 3) Feature flags, 4) Global settings. " +
    "Format: Key-value pairs. Value can be JSON string for complex data. " +
    "WARNING: This is PUBLIC data - use set_title_internal_data for sensitive configs!",
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

const CREATE_DRAFT_ITEM_TOOL: Tool = {
  name: "create_draft_item",
  description:
    "Creates a new draft item in the catalog. Draft items must be published before they can be used. " +
    "Use this to: 1) Add new items to your game, 2) Create virtual currency items, 3) Define bundles. " +
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here. " +
    "After creation, use publish_draft_item to make it available to players.",
  inputSchema: {
    type: "object",
    properties: {
      Item: {
        type: "object",
        description: "The catalog item definition",
        properties: {
          Type: {
            type: "string",
            description: "Item type: 'bundle', 'catalogItem', 'currency', 'store', 'ugc', or 'subscription'"
          },
          ContentType: {
            type: "string",
            description: "Content type from pre-defined list (must be defined in update_catalog_config first, use get_catalog_config to see available types)"
          },
          AlternateIds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                Type: { type: "string" },
                Value: { type: "string" }
              }
            },
            description: "Alternative IDs like 'FriendlyId' or marketplace names"
          },
          Title: {
            type: "object",
            description: "Localized titles. REQUIRED: Must include 'NEUTRAL' locale. Example: { 'NEUTRAL': 'Sword of Fire', 'en-US': 'Sword of Fire', 'ja-JP': '炎の剣' }",
            additionalProperties: { type: "string" },
            properties: {
              NEUTRAL: {
                type: "string",
                description: "Default title (REQUIRED)"
              }
            },
            required: ["NEUTRAL"]
          },
          Description: {
            type: "object",
            description: "Localized descriptions (max 10000 chars per locale)",
            additionalProperties: { type: "string" }
          },
          Tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to categorize the item (must be from pre-defined list in update_catalog_config, max 32 tags)"
          },
          DisplayProperties: {
            type: "object",
            description: "Custom display properties (max 10KB)",
            additionalProperties: true
          },
          DefaultStackId: {
            type: "string",
            description: "Default stack ID for inventory. Use static ID (e.g., 'default') to stack items together, or '{guid}' to keep each item separate. Example: consumables use 'default', equipment uses '{guid}'"
          },
          IsHidden: {
            type: "boolean",
            description: "Whether the item is hidden from players"
          },
          Platforms: {
            type: "array",
            items: { type: "string" },
            description: "Supported platforms"
          },
          StartDate: {
            type: "string",
            description: "When the item becomes available (ISO 8601 format)"
          },
          EndDate: {
            type: "string",
            description: "When the item expires (ISO 8601 format)"
          },
          PriceOptions: {
            type: "object",
            description: "Pricing configuration",
            properties: {
              Prices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    Amounts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ItemId: { type: "string" },
                          Amount: { type: "number" }
                        },
                        required: ["Amount"]
                      }
                    },
                    UnitAmount: { type: "number" },
                    UnitDurationInSeconds: { type: "number" }
                  }
                }
              }
            }
          }
        }
      },
      Publish: {
        type: "boolean",
        description: "Whether to publish immediately after creation (default: false)"
      }
    },
    required: [],
  },
}

const UPDATE_DRAFT_ITEM_TOOL: Tool = {
  name: "update_draft_item",
  description:
    "Updates an existing draft item in the catalog. " +
    "Changes only affect the draft version until published. " +
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to update"
      },
      Item: {
        type: "object",
        description: "Updated item properties - include only fields you want to change",
        properties: {
          ContentType: {
            type: "string",
            description: "New content type (must be from pre-defined list in update_catalog_config)"
          },
          Tags: {
            type: "array",
            items: { type: "string" },
            description: "New tags to replace existing ones (must be from pre-defined list in update_catalog_config)"
          },
          Title: {
            type: "object",
            additionalProperties: { type: "string" }
          },
          Description: {
            type: "object",
            additionalProperties: { type: "string" }
          },
          IsHidden: {
            type: "boolean"
          },
          IsStackable: {
            type: "boolean"
          },
          DisplayProperties: {
            type: "object",
            additionalProperties: true
          }
        }
      },
      Publish: {
        type: "boolean",
        description: "Whether to publish immediately after update"
      }
    },
    required: ["ItemId", "Item"],
  },
}

const DELETE_ITEM_TOOL: Tool = {
  name: "delete_item",
  description:
    "Permanently deletes an item from the catalog. " +
    "WARNING: This cannot be undone! The item will be removed from all player inventories.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to delete"
      }
    },
    required: ["ItemId"],
  },
}

const PUBLISH_DRAFT_ITEM_TOOL: Tool = {
  name: "publish_draft_item",
  description:
    "Publishes a draft item, making it available to players. " +
    "Once published, the item can be purchased and used in the game.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the draft item to publish"
      },
      ETag: {
        type: "string",
        description: "Optional ETag for concurrency control"
      }
    },
    required: ["ItemId"],
  },
}

const GET_ITEM_TOOL: Tool = {
  name: "get_item",
  description:
    "Retrieves detailed information about a specific catalog item. " +
    "Returns both draft and published versions if available.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to retrieve"
      }
    },
    required: ["ItemId"],
  },
}

const UPDATE_CATALOG_CONFIG_TOOL: Tool = {
  name: "update_catalog_config",
  description:
    "Updates the catalog configuration, including available ContentTypes and Tags. " +
    "ContentTypes define the categories of items in your catalog (e.g., 'Game Item', 'Currency', 'Bundle'). " +
    "Tags define the available tags that can be used on items. " +
    "Maximum 128 ContentTypes (40 chars each), Maximum 1024 Tags (32 chars each).",
  inputSchema: {
    type: "object",
    properties: {
      ContentTypes: {
        type: "array",
        items: { type: "string" },
        description: "List of content types available in the catalog. Example: ['Game Item', 'Currency', 'Bundle']"
      },
      Tags: {
        type: "array",
        items: { type: "string" },
        description: "List of tags available for items. Example: ['weapon', 'armor', 'consumable', 'epic', 'rare']"
      }
    },
    required: [],
  },
}

const GET_CATALOG_CONFIG_TOOL: Tool = {
  name: "get_catalog_config",
  description:
    "Retrieves the current catalog configuration. " +
    "Returns the list of available ContentTypes and Tags that can be used when creating or updating items.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
}




async function SearchItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SearchItems({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
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
    PlayFabAdminAPI.GetAllSegments({
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
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
    PlayFabAdminAPI.GetPlayersInSegment({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
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
      CustomTags: { mcp: 'true' }
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
    PlayFabEconomyAPI.GetInventoryCollectionIds({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
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
        CustomTags: { mcp: 'true' }
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
      CustomTags: { mcp: 'true' }
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
      CustomTags: { mcp: 'true' }
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
      CustomTags: { mcp: 'true' }
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
      CustomTags: { mcp: 'true' }
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


async function ExecuteInventoryOperations(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.ExecuteInventoryOperations({
      Operations: params.Operations,
      Entity: params.Entity,
      CollectionId: params.CollectionId,
      IdempotencyId: params.IdempotencyId,
      CustomTags: { mcp: 'true' }
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
      CustomTags: { mcp: 'true' }
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
      PlayFabId: params.PlayFabId
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
      PlayFabId: params.PlayFabId
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
      Keys: params.Keys
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
      CustomTags: { mcp: 'true' }
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
      Value: params.Value
    }, (error) => {
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
      Keys: params.Keys
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
      Value: params.Value
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
      Keys: params.Keys
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

async function CreateDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    // Validate NEUTRAL title is present
    if (!params.Item || !params.Item.Title || !params.Item.Title.NEUTRAL) {
      reject("Error: Title with NEUTRAL locale is required for creating draft items")
      return
    }
    
    PlayFabEconomyAPI.CreateDraftItem({
      Item: params.Item,
      Publish: params.Publish,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        item: result.data.Item,
      })
    })
  })
}

async function UpdateDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.UpdateDraftItem({
      Item: {
        Id: params.ItemId,
        ...params.Item
      },
      Publish: params.Publish,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        item: result.data.Item,
      })
    })
  })
}

async function DeleteItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.DeleteItem({
      Id: params.ItemId,
      CustomTags: { mcp: 'true' }
    }, (error) => {
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

async function PublishDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.PublishDraftItem({
      Id: params.ItemId,
      ETag: params.ETag,
      CustomTags: { mcp: 'true' }
    }, (error) => {
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

async function GetItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetItem({
      Id: params.ItemId,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        item: result.data.Item,
      })
    })
  })
}

async function UpdateCatalogConfig(params: any) {
  return new Promise((resolve, reject) => {
    const config: any = {
      Config: {
        IsCatalogEnabled: true,
        Catalog: {}
      }
    }
    
    if (params.ContentTypes) {
      config.Config.Catalog.ContentTypes = params.ContentTypes
    }
    
    if (params.Tags) {
      config.Config.Catalog.Tags = params.Tags
    }
    
    PlayFabEconomyAPI.UpdateCatalogConfig({
      ...config,
      CustomTags: { mcp: 'true' }
    }, (error) => {
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

async function GetCatalogConfig() {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetCatalogConfig({
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        config: result.data.Config,
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
    CREATE_DRAFT_ITEM_TOOL,
    UPDATE_DRAFT_ITEM_TOOL,
    DELETE_ITEM_TOOL,
    PUBLISH_DRAFT_ITEM_TOOL,
    GET_ITEM_TOOL,
    UPDATE_CATALOG_CONFIG_TOOL,
    GET_CATALOG_CONFIG_TOOL,
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await new Promise((resolve, reject) => {
      PlayFabAuthenticationAPI.GetEntityToken({
        CustomTags: {
          user: PlayFab.buildIdentifier,
          mcp: 'true'
        }
      }, (error) => {
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
          case "create_draft_item":
            toolPromise = CreateDraftItem(args);
            break;
          case "update_draft_item":
            toolPromise = UpdateDraftItem(args);
            break;
          case "delete_item":
            toolPromise = DeleteItem(args);
            break;
          case "publish_draft_item":
            toolPromise = PublishDraftItem(args);
            break;
          case "get_item":
            toolPromise = GetItem(args);
            break;
          case "update_catalog_config":
            toolPromise = UpdateCatalogConfig(args);
            break;
          case "get_catalog_config":
            toolPromise = GetCatalogConfig();
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
