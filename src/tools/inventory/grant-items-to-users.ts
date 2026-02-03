import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GRANT_ITEMS_TO_USERS_TOOL: Tool = {
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
