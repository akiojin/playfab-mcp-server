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
const PlayFabServerAPI = pf.PlayFabServer as PlayFabServerModule.IPlayFabServer

dotenv.config()

PlayFab.settings.titleId = process.env.PLAYFAB_TITLE_ID!
PlayFab.settings.developerSecretKey = process.env.PLAYFAB_DEV_SECRET_KEY!

const SEARCH_ITEMS_TOOL: Tool = {
  name: "search_items",
  description: "PlayFab search items",
  inputSchema: {
    type: "object",
    properties: {
      count: {
        type: "number",
        description:
          "Number of items to retrieve. This value is optional. " +
          "Maximum page size is 50. Default value is 10."
      },
      continuationToken: {
        type: "string",
        description: "An opaque token used to retrieve the next page of items, if any are available."
      },
      filter: {
        type: "string",
        description:
          "An OData filter used to refine the search query (For example: \"type eq 'ugc'\"). " +
          "More info about Filter Complexity limits can be found here: " +
          "https://learn.microsoft.com/en-us/gaming/playfab/features/economy-v2/catalog/search#limits"
      },
      orderBy: {
        type: "string",
        description:
          "An OData orderBy used to order the results of the search query. " +
          "For example: \"rating/average asc\""
      },
      search: {
        type: "string",
        description: "The text to search for."
      }
    },
    required: [
      "count"
    ],
  },
}

const GET_ALL_SEGMENTS_TOOL: Tool = {
  name: "get_all_segments",
  description: "PlayFab get all segments",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
}

const GET_PLAYERS_IN_SEGMENTS_TOOL: Tool = {
  name: "get_players_in_segments",
  description:
    "Allows for paging through all players in a given segment. " +
    "This API creates a snapshot of all player profiles that match the segment definition " +
    "at the time of its creation and lives through the Total Seconds to Live, " +
    "refreshing its life span on each subsequent use of the Continuation Token. " +
    "Profiles that change during the course of paging will not be reflected in the results. " +
    "AB Test segments are currently not supported by this operation. " +
    "NOTE: This API is limited to being called 30 times in one minute. " +
    "You will be returned an error if you exceed this threshold.",
  inputSchema: {
    type: "object",
    properties: {
      segmentId: {
        type: "string",
        description: "The ID of the segment to retrieve players from."
      },
      continuationToken: {
        type: "string",
        description: "An opaque token used to retrieve the next page of items, if any are available."
      },
    },
    required: [
      "segmentId"
    ],
  },
}

async function SearchItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SearchItems({
        Search: params.search,
        Filter: params.filter,
        OrderBy: params.orderBy,
        Count: params.count,
      }, (error, result) => {
        if (error) {
          console.error("Error searching items:", error)
          reject(error)
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
        console.error("Error getting all segments:", error)
        reject(error)
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
      SegmentId: params.segmentId,
      ContinuationToken: params.continuationToken,
    }, (error, result) => {
      if (error) {
        reject(error)
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
      }, async (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        switch (name) {
        case "search_items":
          resolve(await SearchItems(args))
          break
        case "get_all_segments":
          resolve(await GetAllSegments(args))
          break
        case "get_players_in_segments":
          resolve(await GetPlayersInSegments(args))
          break
        default:
          reject({
            content: [{ type: "text", text: `Unknown tool: ${name}` }],
            isError: true,
          })
        }
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
