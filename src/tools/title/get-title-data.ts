import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_TITLE_DATA_TOOL: Tool = {
  name: "get_title_data",
  description:
    "Retrieves global configuration data for the title. " +
    "Can retrieve specific keys or all title data.",
  inputSchema: {
    type: "object",
    properties: {
      Keys: {
        type: "array",
        items: { type: "string" },
        description: "Specific keys to retrieve (optional, retrieves all if not specified)."
      }
    },
  },
}
