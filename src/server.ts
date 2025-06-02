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
            toolPromise = catalogHandlers.SearchItems(args);
            break;
          case "create_draft_item":
            toolPromise = catalogHandlers.CreateDraftItem(args);
            break;
          case "update_draft_item":
            toolPromise = catalogHandlers.UpdateDraftItem(args);
            break;
          case "delete_item":
            toolPromise = catalogHandlers.DeleteItem(args);
            break;
          case "publish_draft_item":
            toolPromise = catalogHandlers.PublishDraftItem(args);
            break;
          case "get_item":
            toolPromise = catalogHandlers.GetItem(args);
            break;
          case "update_catalog_config":
            toolPromise = catalogHandlers.UpdateCatalogConfig(args);
            break;
          case "get_catalog_config":
            toolPromise = catalogHandlers.GetCatalogConfig();
            break;
          case "batch_create_draft_items":
            toolPromise = catalogHandlers.BatchCreateDraftItems(args);
            break;
          case "add_inventory_items":
            toolPromise = inventoryHandlers.AddInventoryItems(args);
            break;
          case "get_inventory_items":
            toolPromise = inventoryHandlers.GetInventoryItems(args);
            break;
          case "get_inventory_collection_ids":
            toolPromise = inventoryHandlers.GetInventoryCollectionIds(args);
            break;
          case "delete_inventory_items":
            toolPromise = inventoryHandlers.DeleteInventoryItems(args);
            break;
          case "subtract_inventory_items":
            toolPromise = inventoryHandlers.SubtractInventoryItems(args);
            break;
          case "update_inventory_items":
            toolPromise = inventoryHandlers.UpdateInventoryItems(args);
            break;
          case "execute_inventory_operations":
            toolPromise = inventoryHandlers.ExecuteInventoryOperations(args);
            break;
          case "grant_items_to_users":
            toolPromise = inventoryHandlers.GrantItemsToUsers(args);
            break;
          case "get_title_player_account_ids":
            toolPromise = playerHandlers.GetTitlePlayerAccountIdsFromPlayFabIds(args);
            break;
          case "get_all_segments":
            toolPromise = playerHandlers.GetAllSegments();
            break;
          case "get_players_in_segments":
            toolPromise = playerHandlers.GetPlayersInSegments(args);
            break;
          case "ban_users":
            toolPromise = playerHandlers.BanUsers(args);
            break;
          case "revoke_all_bans_for_user":
            toolPromise = playerHandlers.RevokeAllBansForUser(args);
            break;
          case "get_user_account_info":
            toolPromise = playerHandlers.GetUserAccountInfo(args);
            break;
          case "get_user_data":
            toolPromise = playerHandlers.GetUserData(args);
            break;
          case "update_user_data":
            toolPromise = playerHandlers.UpdateUserData(args);
            break;
          case "set_title_data":
            toolPromise = titleHandlers.SetTitleData(args);
            break;
          case "get_title_data":
            toolPromise = titleHandlers.GetTitleData(args);
            break;
          case "set_title_internal_data":
            toolPromise = titleHandlers.SetTitleInternalData(args);
            break;
          case "get_title_internal_data":
            toolPromise = titleHandlers.GetTitleInternalData(args);
            break;
          case "add_localized_news":
            toolPromise = titleHandlers.AddLocalizedNews(args);
            break;
          case "get_title_news":
            toolPromise = titleHandlers.GetTitleNews(args);
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

export async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("PlayFab Server running on stdio")
}
