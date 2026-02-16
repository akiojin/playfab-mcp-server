import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const QUERY_ANALYTICS_TOOL: Tool = {
  name: "query_analytics",
  description:
    "Run KQL (Kusto Query Language) queries against PlayFab Insights / Data Explorer to retrieve analytics event data. " +
    "Use for: Querying player events, telemetry data, PlayStream events, custom events sent from game clients (e.g. UE5). " +
    "Supports full KQL syntax including where, summarize, project, join, render, etc. " +
    "The database is automatically set to your title ID. " +
    "REQUIREMENT: PlayFab Insights must be enabled for your title. " +
    "REQUIREMENT: Azure AD credentials (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET) must be configured. " +
    "Example queries: " +
    "'events.all | take 10' - Get recent events. " +
    "'events.all | where FullName_Name == \"player_logged_in\" | summarize count() by bin(Timestamp, 1h)' - Hourly logins. " +
    "'events.all | where FullName_Namespace == \"custom\" | project Timestamp, FullName_Name, EventData' - Custom events.",
  inputSchema: {
    type: "object",
    properties: {
      Query: {
        type: "string",
        description: "KQL query to execute against PlayFab Insights. The default table is 'events.all' which contains all PlayStream and telemetry events."
      },
      Timespan: {
        type: "string",
        description: "Optional ISO 8601 duration for the query time range (e.g., 'PT1H' for last hour, 'P1D' for last day, 'P7D' for last week). Defaults to last 24 hours if not specified."
      }
    },
    required: ["Query"],
  },
};
