import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_USER_ACCOUNT_INFO_TOOL: Tool = {
  name: "get_user_account_info",
  description:
    "Retrieves detailed account information for a player. " +
    "Includes profile data, statistics, and linked accounts.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player."
      }
    },
    required: ["PlayFabId"],
  },
}
