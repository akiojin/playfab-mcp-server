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
const PlayFabServerAPI = pf.PlayFabServer as PlayFabServerModule.IPlayFabServer

dotenv.config()

PlayFab.settings.titleId = process.env['PLAYFAB_TITLE_ID']!
PlayFab.settings.developerSecretKey = process.env['PLAYFAB_DEV_SECRET_KEY']!

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
    "⚠️ DEPRECATED: Use grant_items_to_users instead (works for single player too). " +
    "Grants items or virtual currency to a player's inventory. " +
    "Note: In Economy v2, virtual currencies are items - use their item IDs, not currency codes. " +
    "⚠️ RATE LIMIT: 100 requests per 60 seconds per player entity.",
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
    "You can optionally specify a collection (CollectionId), a page size (Count), and a ContinuationToken for pagination. " +
    "⚠️ RATE LIMIT: 100 requests per 60 seconds per player entity.",
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

const GET_TITLE_PLAYER_ACCOUNT_IDS_FROM_PLAYFAB_IDS_TOOL: Tool = {
  name: "get_title_player_account_ids_from_playfab_ids",
  description: 
    "Converts one or more PlayFabIds to TitlePlayerAccountIds. IMPORTANT: Use this before any inventory operations! " +
    "PlayFabId (from login/user info) ≠ TitlePlayerAccountId (needed for inventory). " +
    "Supports both single ID (string) and multiple IDs (array). " +
    "Example flow: Get PlayFabId from user data → Convert with this tool → Use result for inventory APIs.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabIds: {
        oneOf: [
          {
            type: "string",
            description: "Single PlayFabId to convert"
          },
          {
            type: "array",
            items: { type: "string" },
            description: "Array of PlayFabIds to convert"
          }
        ],
        description: "Single PlayFabId (string) or array of PlayFabIds to convert. Example: '276427AE27FF98AC' or ['id1', 'id2']"
      }
    },
    required: [ "PlayFabIds" ],
  },
}

const DELETE_INVENTORY_ITEMS_TOOL: Tool = {
  name: "delete_inventory_items",
  description:
    "Deletes items from a player's inventory. " +
    "⚠️ DESTRUCTIVE: This permanently removes items from the player's inventory. " +
    "You must specify the Item (InventoryItemReference object) and TitlePlayerAccountId. " +
    "⚠️ RATE LIMIT: 100 requests per 60 seconds per player entity.",
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
      },
      ConfirmDeletion: {
        type: "boolean",
        description: "Must be set to true to confirm deletion from player inventory. This is a safety measure."
      }
    },
    required: [
      "TitlePlayerAccountId",
      "Item",
      "ConfirmDeletion"
    ],
  },
}

const SUBTRACT_INVENTORY_ITEMS_TOOL: Tool = {
  name: "subtract_inventory_items",
  description:
    "Subtracts a specific amount of items from a player's inventory. " +
    "Use this to reduce item quantities without completely removing them. " +
    "⚠️ RATE LIMIT: 100 requests per 60 seconds per player entity.",
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
    "Use this to modify item metadata, display properties, or custom data. " +
    "⚠️ RATE LIMIT: 100 requests per 60 seconds per player entity.",
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
    "⚡ BULK OPERATION: Process up to 50 operations atomically (all succeed or all fail). " +
    "Perfect for: Complex inventory updates, item exchanges, bulk modifications. " +
    "Supports: Add, Delete, Subtract, Update operations in any combination. " +
    "⚠️ RATE LIMIT: 60 requests per 90 seconds per player entity.",
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
    "⚠️ DESTRUCTIVE: Prevents players from accessing the game. " +
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
            Reason: { type: "string", description: "Reason for the ban (REQUIRED for audit trail)" },
            DurationInHours: { type: "number", description: "Ban duration in hours (optional, permanent if not specified)" }
          },
          required: ["Reason"]
        }
      },
      ConfirmBan: {
        type: "boolean",
        description: "Must be set to true to confirm the ban operation. This is a safety measure."
      }
    },
    required: ["Bans", "ConfirmBan"],
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
    "⚠️ DEPRECATED: Use batch_create_draft_items instead (works for single items too). " +
    "Creates a new draft item in the catalog. Draft items must be published before they can be used. " +
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here.",
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
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here. " +
    "💡 TIP: For bulk updates, consider using execute_catalog_operations pattern.",
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
    "⚠️ DESTRUCTIVE: This cannot be undone! The item will be removed from all player inventories. " +
    "Requires explicit confirmation to proceed.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to delete"
      },
      ConfirmDeletion: {
        type: "boolean",
        description: "Must be set to true to confirm the deletion. This is a safety measure to prevent accidental deletions."
      }
    },
    required: ["ItemId", "ConfirmDeletion"],
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

const BATCH_CREATE_DRAFT_ITEMS_TOOL: Tool = {
  name: "batch_create_draft_items",
  description:
    "Creates one or more draft items in the catalog. Works for both single and bulk operations. " +
    "⚡ RECOMMENDED: Use this for all item creation (single or multiple). " +
    "Efficiently handles up to 50 items with automatic error handling for each item. " +
    "Failed items won't stop the entire batch - you'll get status for each item.",
  inputSchema: {
    type: "object",
    properties: {
      Items: {
        type: "array",
        description: "Array of items to create (1-50 items). For single item, just pass array with one element.",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          properties: {
            Item: {
              type: "object",
              description: "The catalog item definition (same as create_draft_item)",
              required: ["Title"]
            },
            Publish: {
              type: "boolean",
              description: "Whether to publish this item immediately after creation"
            }
          },
          required: ["Item"]
        }
      },
      ContinueOnError: {
        type: "boolean",
        description: "If true, continues processing remaining items even if some fail. Default: true"
      }
    },
    required: ["Items"],
  },
}

const GRANT_ITEMS_TO_USERS_TOOL: Tool = {
  name: "grant_items_to_users",
  description:
    "Grants items to one or more players. Works for both single and bulk operations. " +
    "⚡ RECOMMENDED: Use this for all item granting (single or multiple players). " +
    "Supports patterns: 1) Items to single player, 2) Same items to many players, 3) Different items to different players. " +
    "For complex single-player operations (mix of add/delete/update), use execute_inventory_operations. " +
    "⚠️ RATE LIMIT: Individual AddInventoryItems calls are subject to 100 requests per 60 seconds per player.",
  inputSchema: {
    type: "object",
    properties: {
      Grants: {
        type: "array",
        description: "Array of grant operations (1-100). For single player, just pass array with one element.",
        minItems: 1,
        maxItems: 100,
        items: {
          type: "object",
          properties: {
            TitlePlayerAccountId: {
              type: "string",
              description: "The player to grant items to"
            },
            Items: {
              type: "array",
              description: "Items to grant to this player",
              items: {
                type: "object",
                properties: {
                  ItemId: {
                    type: "string",
                    description: "The item ID to grant"
                  },
                  Amount: {
                    type: "number",
                    description: "How many to grant"
                  },
                  DurationInSeconds: {
                    type: "number",
                    description: "Optional expiration time"
                  }
                },
                required: ["ItemId"]
              }
            },
            CollectionId: {
              type: "string",
              description: "Collection ID (default: 'default')"
            }
          },
          required: ["TitlePlayerAccountId", "Items"]
        }
      },
      ContinueOnError: {
        type: "boolean",
        description: "If true, continues processing remaining grants even if some fail. Default: true"
      }
    },
    required: ["Grants"],
  },
}


const ADD_LOCALIZED_NEWS_TOOL: Tool = {
  name: "add_localized_news",
  description:
    "Creates news with multi-language support. Automatically handles the base news creation and localization. " +
    "📰 Use for: Game updates, events, maintenance notices, special announcements. " +
    "Creates base news in default language, then adds all specified translations. " +
    "News items are displayed to players in their preferred language. " +
    "⚠️ REQUIREMENT: PlayFab title must have a default language configured in Game Manager before using this tool.",
  inputSchema: {
    type: "object",
    properties: {
      DefaultTitle: {
        type: "string",
        description: "The news title/headline in default language. Keep it concise and attention-grabbing."
      },
      DefaultBody: {
        type: "string",
        description: "The news content/body in default language. Can include details, instructions, or longer descriptions."
      },
      Timestamp: {
        type: "string",
        description: "When the news should be dated (ISO 8601 format). Defaults to current time if not specified."
      },
      Localizations: {
        type: "array",
        description: "Additional language versions of the news (optional for single-language news)",
        items: {
          type: "object",
          properties: {
            Language: {
              type: "string",
              description: "Language code (e.g., 'ja', 'es', 'fr', 'de')"
            },
            Title: {
              type: "string",
              description: "Localized title"
            },
            Body: {
              type: "string",
              description: "Localized body"
            }
          },
          required: ["Language", "Title", "Body"]
        }
      }
    },
    required: ["DefaultTitle", "DefaultBody"],
  },
}

const GET_TITLE_NEWS_TOOL: Tool = {
  name: "get_title_news",
  description:
    "Retrieves current news items for the title. " +
    "Returns all active news in chronological order. " +
    "Use this to review existing news before adding new items.",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Maximum number of news items to retrieve. Default: 10, Max: 100"
      }
    },
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

async function GetAllSegments() {
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

async function GetTitlePlayerAccountIdsFromPlayFabIds(params: any) {
  return new Promise((resolve, reject) => {
    // Normalize input to array
    const playFabIds = Array.isArray(params.PlayFabIds) 
      ? params.PlayFabIds 
      : [params.PlayFabIds]
    
    if (playFabIds.length === 0) {
      reject("No PlayFabIds provided")
      return
    }
    
    PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds(
      {
        TitleId: PlayFab.settings.titleId,
        MasterPlayerAccountIds: playFabIds,
        CustomTags: { mcp: 'true' }
      },
      (error, result) => {
        if (error) {
          reject(JSON.stringify(error, null, 2))
          return
        }
        
        const accounts = result.data.TitlePlayerAccounts || {}
        const mappings = []
        const notFound = []
        
        for (const playFabId of playFabIds) {
          const account = accounts[playFabId]
          if (account && account.Id) {
            mappings.push({
              playFabId: playFabId,
              titlePlayerAccountId: account.Id,
              entityType: account.Type || 'title_player_account'
            })
          } else {
            notFound.push(playFabId)
          }
        }
        
        resolve({
          success: true,
          mappings: mappings,
          notFound: notFound,
          totalRequested: playFabIds.length,
          totalFound: mappings.length
        })
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
    // Validate confirmation
    if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
      reject("Error: Deletion confirmation required. Set ConfirmDeletion to true to proceed with removing items from player inventory.")
      return
    }
    
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
        message: `Items permanently deleted from player ${params.TitlePlayerAccountId}'s inventory.`
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
    // Validate confirmation
    if (!params.ConfirmBan || params.ConfirmBan !== true) {
      reject("Error: Ban confirmation required. Set ConfirmBan to true to proceed with this operation.")
      return
    }
    
    // Validate all bans have reasons
    if (!params.Bans || !params.Bans.every((ban: any) => ban.Reason && ban.Reason.trim() !== '')) {
      reject("Error: All bans must include a reason for audit trail purposes.")
      return
    }
    
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
        message: `Successfully banned ${params.Bans.length} user(s).`
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
    // Validate confirmation
    if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
      reject("Error: Deletion confirmation required. Set ConfirmDeletion to true to proceed with this destructive operation.")
      return
    }
    
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
        message: `Item ${params.ItemId} has been permanently deleted from the catalog and all player inventories.`
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

async function BatchCreateDraftItems(params: any) {
  const continueOnError = params.ContinueOnError !== false
  const results = []
  
  for (let i = 0; i < params.Items.length; i++) {
    const itemData = params.Items[i]
    
    try {
      // Validate NEUTRAL title
      if (!itemData.Item || !itemData.Item.Title || !itemData.Item.Title.NEUTRAL) {
        throw new Error("Title with NEUTRAL locale is required")
      }
      
      const result: any = await CreateDraftItem(itemData)
      results.push({
        index: i,
        success: true,
        item: result.item,
        itemId: result.item?.Id
      })
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: String(error)
      })
      
      if (!continueOnError) {
        break
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  return {
    success: failureCount === 0,
    totalProcessed: results.length,
    successCount,
    failureCount,
    results,
    message: `Batch creation completed: ${successCount} succeeded, ${failureCount} failed out of ${params.Items.length} items.`
  }
}

async function GrantItemsToUsers(params: any) {
  const continueOnError = params.ContinueOnError !== false
  const results = []
  
  for (let i = 0; i < params.Grants.length; i++) {
    const grant = params.Grants[i]
    
    try {
      // Process each item for the player
      const grantResults = []
      for (const item of grant.Items) {
        const addParams = {
          TitlePlayerAccountId: grant.TitlePlayerAccountId,
          Amount: item.Amount || 1,
          CollectionId: grant.CollectionId || 'default',
          Item: { Id: item.ItemId },
          DurationInSeconds: item.DurationInSeconds,
          IdempotencyId: `grant_${Date.now()}_${i}_${item.ItemId}`
        }
        
        const result: any = await AddInventoryItems(addParams)
        grantResults.push({
          itemId: item.ItemId,
          success: true,
          transactionId: result.transactionIds?.[0]
        })
      }
      
      results.push({
        index: i,
        playerId: grant.TitlePlayerAccountId,
        success: true,
        itemsGranted: grantResults
      })
    } catch (error) {
      results.push({
        index: i,
        playerId: grant.TitlePlayerAccountId,
        success: false,
        error: String(error)
      })
      
      if (!continueOnError) {
        break
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  return {
    success: failureCount === 0,
    totalProcessed: results.length,
    successCount,
    failureCount,
    results,
    message: `Batch grant completed: ${successCount} players processed successfully, ${failureCount} failed out of ${params.Grants.length} total.`
  }
}


async function AddLocalizedNews(params: any) {
  return new Promise(async (resolve, reject) => {
    try {
      // First, create the news in the default language
      const addNewsResult = await new Promise<any>((res, rej) => {
        PlayFabAdminAPI.AddNews({
          Title: params.DefaultTitle,
          Body: params.DefaultBody,
          Timestamp: params.Timestamp || new Date().toISOString(),
          CustomTags: { mcp: 'true' }
        }, (error, result) => {
          if (error) {
            rej(error)
          } else {
            res(result)
          }
        })
      })
      
      const newsId = addNewsResult.data.NewsId
      const localizations = params.Localizations || []
      const localizationResults: Array<{
        language: string
        success: boolean
        error?: any
      }> = []
      
      // Add localizations if provided
      for (const localization of localizations) {
        try {
          await new Promise<void>((res) => {
            PlayFabAdminAPI.AddLocalizedNews({
              NewsId: newsId,
              Language: localization.Language,
              Title: localization.Title,
              Body: localization.Body,
              CustomTags: { mcp: 'true' }
            }, (error) => {
              if (error) {
                localizationResults.push({
                  language: localization.Language,
                  success: false,
                  error: error
                })
                res() // Continue with other languages
              } else {
                localizationResults.push({
                  language: localization.Language,
                  success: true
                })
                res()
              }
            })
          })
        } catch (err) {
          // Continue with other localizations
        }
      }
      
      resolve({
        success: true,
        newsId: newsId,
        localizations: localizationResults,
        message: `News item "${params.DefaultTitle}" has been successfully added with ${localizationResults.filter(r => r.success).length} localization(s).`
      })
    } catch (error: any) {
      // Check for specific PlayFab errors
      if (error && error.errorCode === 1393) {
        reject("PlayFab Error: Default language not configured. Please set a default language in PlayFab Game Manager under 'Settings > General' before creating news items with localization.")
      } else if (error && error.errorMessage) {
        reject(`PlayFab Error: ${error.errorMessage} (Code: ${error.errorCode || 'Unknown'})`)
      } else {
        reject(JSON.stringify(error, null, 2))
      }
    }
  })
}

async function GetTitleNews(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabServerAPI.GetTitleNews({
      Count: params.Count || 10
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        news: result.data.News,
        totalCount: result.data.News?.length || 0
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
    GET_TITLE_PLAYER_ACCOUNT_IDS_FROM_PLAYFAB_IDS_TOOL,
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
    BATCH_CREATE_DRAFT_ITEMS_TOOL,
    GRANT_ITEMS_TO_USERS_TOOL,
    ADD_LOCALIZED_NEWS_TOOL,
    GET_TITLE_NEWS_TOOL,
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
            toolPromise = GetAllSegments();
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
          case "get_title_player_account_ids_from_playfab_ids":
            toolPromise = GetTitlePlayerAccountIdsFromPlayFabIds(args);
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
          case "batch_create_draft_items":
            toolPromise = BatchCreateDraftItems(args);
            break;
          case "grant_items_to_users":
            toolPromise = GrantItemsToUsers(args);
            break;
          case "add_localized_news":
            toolPromise = AddLocalizedNews(args);
            break;
          case "get_title_news":
            toolPromise = GetTitleNews(args);
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
