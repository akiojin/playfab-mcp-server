import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const CREATE_DRAFT_ITEM_TOOL: Tool = {
  name: "create_draft_item",
  description:
    "⚠️ DEPRECATED: Use batch_create_draft_items instead (works for single items too). " +
    "Creates a new draft item in the catalog. Draft items must be published before they can be used. " +
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here.",
  inputSchema: {
    type: "object",
    properties: {
      Item: {
        type: "object",
        description: "The catalog item definition",
        properties: {
          Type: {
            type: "string",
            description: "Item type: 'bundle', 'catalogItem', 'currency', 'store', 'ugc', or 'subscription'"
          },
          ContentType: {
            type: "string",
            description: "Content type from pre-defined list (must be defined in update_catalog_config first, use get_catalog_config to see available types)"
          },
          AlternateIds: {
            type: "array",
            items: {
              type: "object",
              properties: {
                Type: { type: "string" },
                Value: { type: "string" }
              }
            },
            description: "Alternative IDs like 'FriendlyId' or marketplace names"
          },
          Title: {
            type: "object",
            description: "Localized titles. REQUIRED: Must include 'NEUTRAL' locale. Example: { 'NEUTRAL': 'Sword of Fire', 'en-US': 'Sword of Fire', 'ja-JP': '炎の剣' }",
            additionalProperties: { type: "string" },
            properties: {
              NEUTRAL: {
                type: "string",
                description: "Default title (REQUIRED)"
              }
            },
            required: ["NEUTRAL"]
          },
          Description: {
            type: "object",
            description: "Localized descriptions (max 10000 chars per locale)",
            additionalProperties: { type: "string" }
          },
          Tags: {
            type: "array",
            items: { type: "string" },
            description: "Tags to categorize the item (must be from pre-defined list in update_catalog_config, max 32 tags)"
          },
          DisplayProperties: {
            type: "object",
            description: "Custom display properties (max 10KB)",
            additionalProperties: true
          },
          DefaultStackId: {
            type: "string",
            description: "Default stack ID for inventory. Use static ID (e.g., 'default') to stack items together, or '{guid}' to keep each item separate. Example: consumables use 'default', equipment uses '{guid}'"
          },
          IsHidden: {
            type: "boolean",
            description: "Whether the item is hidden from players"
          },
          Platforms: {
            type: "array",
            items: { type: "string" },
            description: "Supported platforms"
          },
          StartDate: {
            type: "string",
            description: "When the item becomes available (ISO 8601 format)"
          },
          EndDate: {
            type: "string",
            description: "When the item expires (ISO 8601 format)"
          },
          PriceOptions: {
            type: "object",
            description: "Pricing configuration",
            properties: {
              Prices: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    Amounts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          ItemId: { type: "string" },
                          Amount: { type: "number" }
                        },
                        required: ["Amount"]
                      }
                    },
                    UnitAmount: { type: "number" },
                    UnitDurationInSeconds: { type: "number" }
                  }
                }
              }
            }
          }
        }
      },
      Publish: {
        type: "boolean",
        description: "Whether to publish immediately after creation (default: false)"
      }
    },
    required: [],
  },
}
