import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const SET_TITLE_DATA_TOOL: Tool = {
  name: "set_title_data",
  description:
    "Sets global game configuration visible to ALL players. Use for: " +
    "1) Game version info, 2) Event schedules, 3) Feature flags, 4) Global settings. " +
    "Format: Key-value pairs. Value can be JSON string for complex data. " +
    "WARNING: This is PUBLIC data - use set_title_internal_data for sensitive configs!",
  inputSchema: {
    type: "object",
    properties: {
      Key: {
        type: "string",
        description: "The key for the title data."
      },
      Value: {
        type: "string",
        description: "The value to set (JSON string for complex data)."
      }
    },
    required: ["Key", "Value"],
  },
}
