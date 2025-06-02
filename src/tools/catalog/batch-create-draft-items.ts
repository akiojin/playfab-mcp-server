import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const BATCH_CREATE_DRAFT_ITEMS_TOOL: Tool = {
  name: "batch_create_draft_items",
  description:
    "Creates one or more draft items in the catalog. Works for both single and bulk operations. " +
    "⚡ RECOMMENDED: Use this for all item creation (single or multiple). " +
    "Efficiently handles up to 50 items with automatic error handling for each item. " +
    "Failed items won't stop the entire batch - you'll get status for each item.",
  inputSchema: {
    type: "object",
    properties: {
      Items: {
        type: "array",
        description: "Array of items to create (1-50 items). For single item, just pass array with one element.",
        minItems: 1,
        maxItems: 50,
        items: {
          type: "object",
          properties: {
            Item: {
              type: "object",
              description: "The catalog item definition (same as create_draft_item)",
              required: ["Title"]
            },
            Publish: {
              type: "boolean",
              description: "Whether to publish this item immediately after creation"
            }
          },
          required: ["Item"]
        }
      },
      ContinueOnError: {
        type: "boolean",
        description: "If true, continues processing remaining items even if some fail. Default: true"
      }
    },
    required: ["Items"],
  },
}
