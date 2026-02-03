import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_USER_DATA_TOOL: Tool = {
  name: "get_user_data",
  description:
    "Retrieves custom data stored for a player. " +
    "Can retrieve specific keys or all data.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player."
      },
      Keys: {
        type: "array",
        items: { type: "string" },
        description: "Specific data keys to retrieve (optional, retrieves all if not specified)."
      }
    },
    required: ["PlayFabId"],
  },
}
