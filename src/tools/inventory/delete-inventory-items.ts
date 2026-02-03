import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const DELETE_INVENTORY_ITEMS_TOOL: Tool = {
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
