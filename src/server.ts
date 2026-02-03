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
import * as catalogTools from "./tools/catalog/index.js";
import * as inventoryTools from "./tools/inventory/index.js";
import * as playerTools from "./tools/player/index.js";
import * as titleTools from "./tools/title/index.js";
import * as catalogHandlers from "./handlers/catalog/index.js";
import * as inventoryHandlers from "./handlers/inventory/index.js";
import * as playerHandlers from "./handlers/player/index.js";
import * as titleHandlers from "./handlers/title/index.js";
import { createLogger, logToolCall, PerformanceLogger } from "./utils/logger.js";
import { router } from "./utils/router.js";

const logger = createLogger('server');

// Register all handlers
router.registerBatch({
  // Catalog handlers
  'search_items': catalogHandlers.SearchItems as any,
  'create_draft_item': catalogHandlers.CreateDraftItem as any,
  'update_draft_item': catalogHandlers.UpdateDraftItem as any,
  'delete_item': catalogHandlers.DeleteItem as any,
  'publish_draft_item': catalogHandlers.PublishDraftItem as any,
  'get_item': catalogHandlers.GetItem as any,
  'update_catalog_config': catalogHandlers.UpdateCatalogConfig as any,
  'get_catalog_config': catalogHandlers.GetCatalogConfig as any,
  'batch_create_draft_items': catalogHandlers.BatchCreateDraftItems as any,
  
  // Inventory handlers
  'add_inventory_items': inventoryHandlers.AddInventoryItems as any,
  'get_inventory_items': inventoryHandlers.GetInventoryItems as any,
  'get_inventory_collection_ids': inventoryHandlers.GetInventoryCollectionIds as any,
  'delete_inventory_items': inventoryHandlers.DeleteInventoryItems as any,
  'subtract_inventory_items': inventoryHandlers.SubtractInventoryItems as any,
  'update_inventory_items': inventoryHandlers.UpdateInventoryItems as any,
  'execute_inventory_operations': inventoryHandlers.ExecuteInventoryOperations as any,
  'grant_items_to_users': inventoryHandlers.GrantItemsToUsers as any,
  
  // Player handlers
  'get_title_player_account_ids': playerHandlers.GetTitlePlayerAccountIdsFromPlayFabIds as any,
  'get_all_segments': playerHandlers.GetAllSegments as any,
  'get_players_in_segments': playerHandlers.GetPlayersInSegments as any,
  'ban_users': playerHandlers.BanUsers as any,
  'revoke_all_bans_for_user': playerHandlers.RevokeAllBansForUser as any,
  'get_user_account_info': playerHandlers.GetUserAccountInfo as any,
  'get_user_data': playerHandlers.GetUserData as any,
  'update_user_data': playerHandlers.UpdateUserData as any,
  
  // Title handlers
  'get_title_data': titleHandlers.GetTitleData as any,
  'set_title_data': titleHandlers.SetTitleData as any,
  'get_title_internal_data': titleHandlers.GetTitleInternalData as any,
  'set_title_internal_data': titleHandlers.SetTitleInternalData as any,
  'get_title_news': titleHandlers.GetTitleNews as any,
  'add_localized_news': titleHandlers.AddLocalizedNews as any,
});

export const server = new Server(
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
    catalogTools.SEARCH_ITEMS_TOOL,
    catalogTools.CREATE_DRAFT_ITEM_TOOL,
    catalogTools.UPDATE_DRAFT_ITEM_TOOL,
    catalogTools.DELETE_ITEM_TOOL,
    catalogTools.PUBLISH_DRAFT_ITEM_TOOL,
    catalogTools.GET_ITEM_TOOL,
    catalogTools.UPDATE_CATALOG_CONFIG_TOOL,
    catalogTools.GET_CATALOG_CONFIG_TOOL,
    catalogTools.BATCH_CREATE_DRAFT_ITEMS_TOOL,
    inventoryTools.ADD_INVENTORY_ITEMS_TOOL,
    inventoryTools.GET_INVENTORY_ITEMS_TOOL,
    inventoryTools.GET_INVENTORY_COLLECTION_IDS_TOOL,
    inventoryTools.DELETE_INVENTORY_ITEMS_TOOL,
    inventoryTools.SUBTRACT_INVENTORY_ITEMS_TOOL,
    inventoryTools.UPDATE_INVENTORY_ITEMS_TOOL,
    inventoryTools.EXECUTE_INVENTORY_OPERATIONS_TOOL,
    inventoryTools.GRANT_ITEMS_TO_USERS_TOOL,
    playerTools.GET_TITLE_PLAYER_ACCOUNT_IDS_FROM_PLAYFAB_IDS_TOOL,
    playerTools.GET_ALL_SEGMENTS_TOOL,
    playerTools.GET_PLAYERS_IN_SEGMENTS_TOOL,
    playerTools.BAN_USERS_TOOL,
    playerTools.REVOKE_ALL_BANS_FOR_USER_TOOL,
    playerTools.GET_USER_ACCOUNT_INFO_TOOL,
    playerTools.GET_USER_DATA_TOOL,
    playerTools.UPDATE_USER_DATA_TOOL,
    titleTools.SET_TITLE_DATA_TOOL,
    titleTools.GET_TITLE_DATA_TOOL,
    titleTools.SET_TITLE_INTERNAL_DATA_TOOL,
    titleTools.GET_TITLE_INTERNAL_DATA_TOOL,
    titleTools.ADD_LOCALIZED_NEWS_TOOL,
    titleTools.GET_TITLE_NEWS_TOOL
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const perfLogger = new PerformanceLogger(`Tool call: ${name}`);
  const startTime = Date.now();

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

        // Check if handler exists
        if (!router.has(name)) {
          reject(new Error(`Unknown tool: ${name}`));
          return;
        }

        // Execute handler using router
        router.execute(name, args)
          .then(toolResult => resolve(toolResult))
          .catch(toolError => reject(toolError));
      })
    })

    const duration = Date.now() - startTime;
    logToolCall(name, args, result, duration);
    perfLogger.end({ tool: name });

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logToolCall(name, args, null, duration, error);
    perfLogger.error(error, { tool: name });
    
    const isDevelopment = process.env['NODE_ENV'] !== 'production'
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const errorDetails = isDevelopment && error instanceof Error ? `\n${error.stack}` : ''
    
    return {
      content: [{ type: "text", text: `Error occurred: ${errorMessage}${errorDetails}` }],
      isError: true,
    }
  }
})

export async function runServer() {
  logger.info('Starting PlayFab MCP Server...')
  const transport = new StdioServerTransport()
  await server.connect(transport)
  logger.info('PlayFab MCP Server running on stdio')
}
