import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_ITEM_TOOL: Tool = {
  name: "get_item",
  description:
    "Retrieves detailed information about a specific catalog item. " +
    "Returns both draft and published versions if available.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to retrieve"
      }
    },
    required: ["ItemId"],
  },
}
