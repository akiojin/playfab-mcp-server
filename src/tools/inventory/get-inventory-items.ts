import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_INVENTORY_ITEMS_TOOL: Tool = {
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
