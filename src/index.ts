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
    PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds(params, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        titlePlayerAccountId: result.data.TitlePlayerAccounts![params.PlayFabId].Id,
      })
    })
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
    GET_INVENTORY_ITEMS_TOOL,
    GET_INVENTORY_COLLECTION_IDS_TOOL,
    GET_TITLE_PLAYER_ACCOUNT_ID_FROM_PLAYFAB_ID_TOOL,
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
