import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_PLAYERS_IN_SEGMENTS_TOOL: Tool = {
  name: "get_players_in_segments",
  description:
    "Retrieves a paginated list of player profiles in a specific segment." +
    "Use SegmentId to specify the segment. Use ContinuationToken for pagination.",
  inputSchema: {
    type: "object",
    properties: {
      SegmentId: {
        type: "string",
        description: "The ID of the segment to retrieve players from. You can get this from the get_all_segments tool."
      },
      ContinuationToken: {
        type: "string",
        description: "Token for retrieving the next page of results. Use null or omit for the first request."
      },
    },
    required: [
      "SegmentId"
    ],
  },
}
