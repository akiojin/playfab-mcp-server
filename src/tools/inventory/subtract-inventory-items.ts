import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SUBTRACT_INVENTORY_ITEMS_TOOL: Tool = {
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
