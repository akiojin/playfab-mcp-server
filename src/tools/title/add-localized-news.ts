import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const ADD_LOCALIZED_NEWS_TOOL: Tool = {
  name: "add_localized_news",
  description:
    "Creates news with multi-language support. Automatically handles the base news creation and localization. " +
    "📰 Use for: Game updates, events, maintenance notices, special announcements. " +
    "Creates base news in default language, then adds all specified translations. " +
    "News items are displayed to players in their preferred language. " +
    "⚠️ REQUIREMENT: PlayFab title must have a default language configured in Game Manager before using this tool.",
  inputSchema: {
    type: "object",
    properties: {
      DefaultTitle: {
        type: "string",
        description: "The news title/headline in default language. Keep it concise and attention-grabbing."
      },
      DefaultBody: {
        type: "string",
        description: "The news content/body in default language. Can include details, instructions, or longer descriptions."
      },
      Timestamp: {
        type: "string",
        description: "When the news should be dated (ISO 8601 format). Defaults to current time if not specified."
      },
      Localizations: {
        type: "array",
        description: "Additional language versions of the news (optional for single-language news)",
        items: {
          type: "object",
          properties: {
            Language: {
              type: "string",
              description: "Language code (e.g., 'ja', 'es', 'fr', 'de')"
            },
            Title: {
              type: "string",
              description: "Localized title"
            },
            Body: {
              type: "string",
              description: "Localized body"
            }
          },
          required: ["Language", "Title", "Body"]
        }
      }
    },
    required: ["DefaultTitle", "DefaultBody"],
  },
}
