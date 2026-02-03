import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_CATALOG_CONFIG_TOOL: Tool = {
  name: "get_catalog_config",
  description:
    "Retrieves the current catalog configuration. " +
    "Returns the list of available ContentTypes and Tags that can be used when creating or updating items.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
}
