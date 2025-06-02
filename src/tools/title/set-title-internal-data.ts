import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SET_TITLE_INTERNAL_DATA_TOOL: Tool = {
  name: "set_title_internal_data",
  description:
    "Sets server-only title data that is not accessible by clients. " +
    "Use this for sensitive configuration like API keys, server settings, etc.",
  inputSchema: {
    type: "object",
    properties: {
      Key: {
        type: "string",
        description: "The key for the internal data."
      },
      Value: {
        type: "string",
        description: "The value to set (JSON string for complex data)."
      }
    },
    required: ["Key", "Value"],
  },
}
