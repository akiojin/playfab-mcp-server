import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const UPDATE_INVENTORY_ITEMS_TOOL: Tool = {
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
