import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_INVENTORY_COLLECTION_IDS_TOOL: Tool = {
  name: "get_inventory_collection_ids",
  description:
    "Retrieves all inventory collection IDs for a specific player." +
    "Use this to list all collections before fetching items from them.",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Number of collection IDs to retrieve per page. Maximum is 50. Default is 10."
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
      TitlePlayerAccountId: {
        type: "string",
        description: "The unique Title Player Account ID of the player."
      }
    },
    required: [
      "Count",
      "TitlePlayerAccountId",
    ],
  },
}
