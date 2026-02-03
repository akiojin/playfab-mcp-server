import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const EXECUTE_INVENTORY_OPERATIONS_TOOL: Tool = {
  name: "execute_inventory_operations",
  description:
    "Execute multiple inventory operations in a single batch request. " +
    "⚡ BULK OPERATION: Process up to 50 operations atomically (all succeed or all fail). " +
    "Perfect for: Complex inventory updates, item exchanges, bulk modifications. " +
    "Supports: Add, Delete, Subtract, Update operations in any combination. " +
    "⚠️ RATE LIMIT: 60 requests per 90 seconds per player entity.",
  inputSchema: {
    type: "object",
    properties: {
      Operations: {
        type: "array",
        description: "Array of operations to execute.",
        items: {
          type: "object",
          properties: {
            Add: {
              type: "object",
              description: "Add operation details",
              properties: {
                Item: { type: "object" },
                Amount: { type: "number" },
                DurationInSeconds: { type: "number" }
              }
            },
            Delete: {
              type: "object",
              description: "Delete operation details",
              properties: {
                Item: { type: "object" }
              }
            },
            Subtract: {
              type: "object",
              description: "Subtract operation details",
              properties: {
                Item: { type: "object" },
                Amount: { type: "number" }
              }
            },
            Update: {
              type: "object",
              description: "Update operation details",
              properties: {
                Item: { type: "object" }
              }
            }
          }
        }
      },
      Entity: {
        type: "object",
        description: "Target entity for operations",
        properties: {
          Id: { type: "string", description: "Title Player Account ID" },
          Type: { type: "string", enum: ["title_player_account"] }
        },
        required: ["Id", "Type"]
      },
      CollectionId: {
        type: "string",
        description: "Collection ID (default: 'default')"
      },
      IdempotencyId: {
        type: "string",
        description: "Unique ID to prevent duplicate operations"
      }
    },
    required: ["Operations", "Entity"],
  },
}
