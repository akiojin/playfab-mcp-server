import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const UPDATE_DRAFT_ITEM_TOOL: Tool = {
  name: "update_draft_item",
  description:
    "Updates an existing draft item in the catalog. " +
    "Changes only affect the draft version until published. " +
    "IMPORTANT: ContentType and Tags must be pre-defined using update_catalog_config before they can be used here. " +
    "💡 TIP: For bulk updates, consider using execute_catalog_operations pattern.",
  inputSchema: {
    type: "object",
    properties: {
      ItemId: {
        type: "string",
        description: "The ID of the item to update"
      },
      Item: {
        type: "object",
        description: "Updated item properties - include only fields you want to change",
        properties: {
          ContentType: {
            type: "string",
            description: "New content type (must be from pre-defined list in update_catalog_config)"
          },
          Tags: {
            type: "array",
            items: { type: "string" },
            description: "New tags to replace existing ones (must be from pre-defined list in update_catalog_config)"
          },
          Title: {
            type: "object",
            additionalProperties: { type: "string" }
          },
          Description: {
            type: "object",
            additionalProperties: { type: "string" }
          },
          IsHidden: {
            type: "boolean"
          },
          IsStackable: {
            type: "boolean"
          },
          DisplayProperties: {
            type: "object",
            additionalProperties: true
          }
        }
      },
      Publish: {
        type: "boolean",
        description: "Whether to publish immediately after update"
      }
    },
    required: ["ItemId", "Item"],
  },
}
