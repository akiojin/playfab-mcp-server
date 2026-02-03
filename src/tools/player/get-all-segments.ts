import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_ALL_SEGMENTS_TOOL: Tool = {
  name: "get_all_segments",
  description:
    "Retrieves an array of player segment definitions. " +
    "Results from this can be used in subsequent API calls " +
    "such as GetPlayersInSegment which requires a Segment ID. " +
    "While segment names can change the ID for that segment will not change.",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
}
