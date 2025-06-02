import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_TITLE_INTERNAL_DATA_TOOL: Tool = {
  name: "get_title_internal_data",
  description:
    "Retrieves server-only title data. " +
    "This data is not accessible by game clients.",
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
