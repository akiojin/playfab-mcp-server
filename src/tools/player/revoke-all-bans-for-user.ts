import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const REVOKE_ALL_BANS_FOR_USER_TOOL: Tool = {
  name: "revoke_all_bans_for_user",
  description:
    "Removes all active bans for a specific player. " +
    "This unbans the player completely.",
  inputSchema: {
    type: "object",
    properties: {
      PlayFabId: {
        type: "string",
        description: "The PlayFab ID of the player to unban."
      }
    },
    required: ["PlayFabId"],
  },
}
