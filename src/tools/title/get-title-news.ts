import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const GET_TITLE_NEWS_TOOL: Tool = {
  name: "get_title_news",
  description:
    "Retrieves current news items for the title. " +
    "Returns all active news in chronological order. " +
    "Use this to review existing news before adding new items.",
  inputSchema: {
    type: "object",
    properties: {
      Count: {
        type: "number",
        description: "Maximum number of news items to retrieve. Default: 10, Max: 100"
      }
    },
  },
}
