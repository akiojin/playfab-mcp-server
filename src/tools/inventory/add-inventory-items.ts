import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const ADD_INVENTORY_ITEMS_TOOL: Tool = {
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
