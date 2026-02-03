import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const BAN_USERS_TOOL: Tool = {
  name: "ban_users",
  description:
    "Bans players from accessing the game. Use when: 1) Player violates terms, 2) Suspicious activity detected, 3) Temporary suspension needed. " +
    "⚠️ DESTRUCTIVE: Prevents players from accessing the game. " +
    "Can ban by: PlayFabId (specific player), IPAddress (block IP), MACAddress (block device). " +
    "Set DurationInHours for temp bans, omit for permanent. Always include clear Reason for records.",
  inputSchema: {
    type: "object",
    properties: {
      Bans: {
        type: "array",
        description: "Array of ban requests.",
        items: {
          type: "object",
          properties: {
            PlayFabId: { type: "string", description: "PlayFab ID to ban" },
            IPAddress: { type: "string", description: "IP address to ban" },
            MACAddress: { type: "string", description: "MAC address to ban" },
            Reason: { type: "string", description: "Reason for the ban (REQUIRED for audit trail)" },
            DurationInHours: { type: "number", description: "Ban duration in hours (optional, permanent if not specified)" }
          },
          required: ["Reason"]
        }
      },
      ConfirmBan: {
        type: "boolean",
        description: "Must be set to true to confirm the ban operation. This is a safety measure."
      }
    },
    required: ["Bans", "ConfirmBan"],
  },
}
