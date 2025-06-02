import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SEARCH_ITEMS_TOOL: Tool = {
  name: "search_items",
  description:
    "Searches for items in the PlayFab catalog (Economy v2). Use this when you need to find items by name, type, or other properties. " +
    "Common uses: Finding all weapons, searching for items containing 'sword', filtering by price range. " +
    "Returns item details including ID, name, description, and prices. " +
    "Supports pagination for large result sets. Use the returned items' IDs with inventory management tools.",
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
