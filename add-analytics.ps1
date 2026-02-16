# add-analytics.ps1
# Run from: D:\Projects\Github\playfab-mcp-server
# Usage: powershell -ExecutionPolicy Bypass -File add-analytics.ps1

$ErrorActionPreference = "Stop"
$repoRoot = $PSScriptRoot
if (-not $repoRoot) { $repoRoot = Get-Location }

Write-Host "Adding analytics query tool to PlayFab MCP Server..." -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot" -ForegroundColor Gray

# ============================================================
# 1. Create src/tools/analytics/query-analytics.ts
# ============================================================
$dir = Join-Path $repoRoot "src\tools\analytics"
New-Item -ItemType Directory -Path $dir -Force | Out-Null

$content = @'
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const QUERY_ANALYTICS_TOOL: Tool = {
  name: "query_analytics",
  description:
    "Run KQL (Kusto Query Language) queries against PlayFab Insights / Data Explorer to retrieve analytics event data. " +
    "Use for: Querying player events, telemetry data, PlayStream events, custom events sent from game clients (e.g. UE5). " +
    "Supports full KQL syntax including where, summarize, project, join, render, etc. " +
    "The database is automatically set to your title ID. " +
    "REQUIREMENT: PlayFab Insights must be enabled for your title. " +
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
'@
Set-Content -Path (Join-Path $dir "query-analytics.ts") -Value $content -Encoding UTF8
Write-Host "  Created src/tools/analytics/query-analytics.ts" -ForegroundColor Green

# ============================================================
# 2. Create src/tools/analytics/index.ts
# ============================================================
$content = @'
export { QUERY_ANALYTICS_TOOL } from "./query-analytics.js";
'@
Set-Content -Path (Join-Path $dir "index.ts") -Value $content -Encoding UTF8
Write-Host "  Created src/tools/analytics/index.ts" -ForegroundColor Green

# ============================================================
# 3. Create src/handlers/analytics/query-analytics.ts
# ============================================================
$dir = Join-Path $repoRoot "src\handlers\analytics"
New-Item -ItemType Directory -Path $dir -Force | Out-Null

$content = @'
import { PlayFab, PlayFabAuthenticationAPI } from "../../config/playfab.js";
import { PlayFabHandler } from "../../types/index.js";
import { QueryAnalyticsParams, QueryAnalyticsResult } from "../../types/handler-types.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('query-analytics');

// Cache the entity token for Kusto requests
let cachedEntityToken: string | null = null;
let tokenExpiresAt: Date | null = null;

/**
 * Get a valid entity token string for authenticating with Kusto.
 * This is separate from the SDK's internal token because we need
 * the raw string to pass as X-EntityToken header.
 */
async function getEntityTokenString(): Promise<string> {
  if (cachedEntityToken && tokenExpiresAt && tokenExpiresAt > new Date()) {
    return cachedEntityToken;
  }

  return new Promise<string>((resolve, reject) => {
    PlayFabAuthenticationAPI.GetEntityToken(
      { CustomTags: { mcp: 'true' } },
      (error: unknown, result: { data?: { EntityToken?: string; TokenExpiration?: string } } | null) => {
        if (error) {
          logger.error({ error }, 'Failed to get entity token for Kusto');
          reject(new Error(`Failed to get entity token: ${JSON.stringify(error)}`));
          return;
        }

        if (!result?.data?.EntityToken) {
          reject(new Error('No entity token returned from PlayFab'));
          return;
        }

        cachedEntityToken = result.data.EntityToken;
        if (result.data.TokenExpiration) {
          tokenExpiresAt = new Date(result.data.TokenExpiration);
        }

        resolve(cachedEntityToken);
      }
    );
  });
}

/**
 * Execute a KQL query against PlayFab Insights (Azure Data Explorer)
 * Endpoint: https://insights.playfab.com/v1/rest/query
 * Auth: X-EntityToken header
 * Database: Title ID (uppercase)
 */
async function executeKustoQuery(query: string, timespan?: string): Promise<unknown> {
  const entityToken = await getEntityTokenString();
  const titleId = PlayFab.settings.titleId?.toUpperCase();

  if (!titleId) {
    throw new Error('PlayFab Title ID is not configured');
  }

  const endpoint = `https://insights.playfab.com/v1/rest/query`;

  const body: Record<string, unknown> = {
    db: titleId,
    csl: query,
  };

  if (timespan) {
    body.properties = {
      Options: {
        query_datetimescope_to: new Date().toISOString(),
        queryconsistency: "weakconsistency",
      },
      Parameters: {
        timespan: timespan,
      },
    };
  }

  logger.info({ titleId, queryLength: query.length, timespan }, 'Executing Kusto query');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-EntityToken': entityToken,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, error: errorText }, 'Kusto query failed');

    // Provide actionable error messages
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Kusto auth failed (${response.status}). Ensure PlayFab Insights/Data Explorer is enabled for title ${titleId}. ` +
        `Error: ${errorText}`
      );
    }

    throw new Error(`Kusto query failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Transform Kusto response into a clean table format.
 * Handles both V1 (Tables array) and V2 (frames array) response formats.
 */
function transformKustoResponse(raw: unknown): { columns: string[]; rows: unknown[][]; rowCount: number } {
  const response = raw as {
    Tables?: Array<{
      TableName?: string;
      Columns?: Array<{ ColumnName: string; DataType: string }>;
      Rows?: unknown[][];
    }>;
    frames?: Array<{
      FrameType?: string;
      TableName?: string;
      Columns?: Array<{ ColumnName: string; ColumnType: string }>;
      Rows?: unknown[][];
    }>;
  };

  // V1 response format (Tables array)
  if (response.Tables && response.Tables.length > 0) {
    const primaryTable = response.Tables.find(t => t.TableName === 'PrimaryResult') || response.Tables[0];
    const columns = (primaryTable?.Columns || []).map(c => c.ColumnName);
    const rows = primaryTable?.Rows || [];
    return { columns, rows, rowCount: rows.length };
  }

  // V2 response format (frames array)
  if (response.frames && response.frames.length > 0) {
    const dataFrame = response.frames.find(f => f.FrameType === 'DataTable' && f.TableName === 'PrimaryResult')
      || response.frames.find(f => f.FrameType === 'DataTable')
      || response.frames[0];
    const columns = (dataFrame?.Columns || []).map(c => c.ColumnName);
    const rows = dataFrame?.Rows || [];
    return { columns, rows, rowCount: rows.length };
  }

  // Fallback — return empty
  logger.warn({ responseKeys: Object.keys(response as object) }, 'Unexpected Kusto response format');
  return { columns: [], rows: [], rowCount: 0 };
}

/**
 * Query Analytics handler — executes KQL against PlayFab Insights
 */
export const QueryAnalytics: PlayFabHandler<QueryAnalyticsParams, QueryAnalyticsResult> = async (params) => {
  if (!params.Query || typeof params.Query !== 'string' || params.Query.trim().length === 0) {
    throw new Error('Query parameter is required and must be a non-empty string');
  }

  const rawResult = await executeKustoQuery(params.Query, params.Timespan);
  const transformed = transformKustoResponse(rawResult);

  logger.info({
    columns: transformed.columns.length,
    rows: transformed.rowCount,
  }, 'Kusto query completed');

  return {
    success: true,
    columns: transformed.columns,
    rows: transformed.rows,
    rowCount: transformed.rowCount,
  };
};
'@
Set-Content -Path (Join-Path $dir "query-analytics.ts") -Value $content -Encoding UTF8
Write-Host "  Created src/handlers/analytics/query-analytics.ts" -ForegroundColor Green

# ============================================================
# 4. Create src/handlers/analytics/index.ts
# ============================================================
$content = @'
export { QueryAnalytics } from "./query-analytics.js";
'@
Set-Content -Path (Join-Path $dir "index.ts") -Value $content -Encoding UTF8
Write-Host "  Created src/handlers/analytics/index.ts" -ForegroundColor Green

# ============================================================
# 5. Patch src/types/handler-types.ts — append analytics types
# ============================================================
$handlerTypesPath = Join-Path $repoRoot "src\types\handler-types.ts"
$appendTypes = @'

// Analytics API Types
export interface QueryAnalyticsParams extends HandlerParams {
  Query: string;
  Timespan?: string;
}

export interface QueryAnalyticsResult {
  columns: string[];
  rows: unknown[][];
  rowCount: number;
}
'@

$existingContent = Get-Content $handlerTypesPath -Raw
if ($existingContent -notmatch "QueryAnalyticsParams") {
    Add-Content -Path $handlerTypesPath -Value $appendTypes -Encoding UTF8
    Write-Host "  Patched src/types/handler-types.ts (appended analytics types)" -ForegroundColor Green
} else {
    Write-Host "  Skipped src/types/handler-types.ts (analytics types already present)" -ForegroundColor Yellow
}

# ============================================================
# 6. Patch src/server.ts — add imports, handler registration, tool listing
# ============================================================
$serverPath = Join-Path $repoRoot "src\server.ts"
$serverContent = Get-Content $serverPath -Raw

if ($serverContent -notmatch "analyticsTools") {
    # 6a. Add imports after the last titleHandlers import
    $serverContent = $serverContent -replace `
        '(import \* as titleHandlers from "./handlers/title/index\.js";)', `
        "`$1`nimport * as analyticsTools from `"./tools/analytics/index.js`";`nimport * as analyticsHandlers from `"./handlers/analytics/index.js`";"

    # 6b. Add handler registration after the last title handler in registerBatch
    $serverContent = $serverContent -replace `
        "('add_localized_news': titleHandlers\.AddLocalizedNews as any,)", `
        "`$1`n  `n  // Analytics handlers`n  'query_analytics': analyticsHandlers.QueryAnalytics as any,"

    # 6c. Add tool to ListToolsRequestSchema array
    # Find the last tool entry before the closing ] of the tools array
    $serverContent = $serverContent -replace `
        '(titleTools\.GET_TITLE_NEWS_TOOL,)(\s*\])', `
        "`$1`n    analyticsTools.QUERY_ANALYTICS_TOOL,`$2"

    Set-Content -Path $serverPath -Value $serverContent -Encoding UTF8 -NoNewline
    Write-Host "  Patched src/server.ts (imports, handler registration, tool listing)" -ForegroundColor Green
} else {
    Write-Host "  Skipped src/server.ts (analytics already registered)" -ForegroundColor Yellow
}

# ============================================================
# Done
# ============================================================
Write-Host ""
Write-Host "All done! Now run:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  Then restart Claude Desktop" -ForegroundColor White
Write-Host ""
