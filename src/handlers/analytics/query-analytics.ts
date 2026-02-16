import { PlayFab } from "../../config/playfab.js";
import { PlayFabHandler } from "../../types/index.js";
import { QueryAnalyticsParams, QueryAnalyticsResult } from "../../types/handler-types.js";
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('query-analytics');

// Cache the AAD access token for Kusto requests
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Get a valid AAD access token for authenticating with Kusto (insights.playfab.com).
 * Uses OAuth2 client credentials flow against Azure AD.
 * Requires AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET env vars.
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && tokenExpiresAt > now + 60_000) {
    return cachedAccessToken;
  }

  const tenantId = process.env['AZURE_TENANT_ID'];
  const clientId = process.env['AZURE_CLIENT_ID'];
  const clientSecret = process.env['AZURE_CLIENT_SECRET'];

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error(
      'Azure AD credentials required for Insights queries. ' +
      'Set AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET environment variables. ' +
      'See: https://learn.microsoft.com/en-us/gaming/playfab/data-analytics/legacy/connectivity/connecting-kusto-csharp-to-insights'
    );
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    resource: 'https://help.kusto.windows.net',
  });

  logger.info('Requesting AAD access token for Insights');

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, error: errorText }, 'AAD token request failed');
    throw new Error(`AAD token request failed (${response.status}): ${errorText}`);
  }

  const result = await response.json() as { access_token: string; expires_in: string };
  cachedAccessToken = result.access_token;
  tokenExpiresAt = now + parseInt(result.expires_in, 10) * 1000;

  return cachedAccessToken;
}

/**
 * Execute a KQL query against Azure Data Explorer.
 * Supports both:
 *   - Custom ADX cluster via AZURE_ADX_CLUSTER_URL + AZURE_ADX_DATABASE env vars
 *   - PlayFab Insights fallback via insights.playfab.com with title ID as database
 */
async function executeKustoQuery(query: string, timespan?: string): Promise<unknown> {
  const accessToken = await getAccessToken();

  const clusterUrl = process.env['AZURE_ADX_CLUSTER_URL'] || 'https://insights.playfab.com';
  const database = process.env['AZURE_ADX_DATABASE'] || PlayFab.settings.titleId?.toUpperCase();

  if (!database) {
    throw new Error('Database not configured. Set AZURE_ADX_DATABASE or PLAYFAB_TITLE_ID.');
  }

  const endpoint = `${clusterUrl}/v1/rest/query`;

  const body: Record<string, unknown> = {
    db: database,
    csl: query,
  };

  if (timespan) {
    body['properties'] = {
      Options: {
        query_datetimescope_to: new Date().toISOString(),
        queryconsistency: "weakconsistency",
      },
      Parameters: {
        timespan: timespan,
      },
    };
  }

  logger.info({ clusterUrl, database, queryLength: query.length, timespan }, 'Executing Kusto query');

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error({ status: response.status, error: errorText }, 'Kusto query failed');

    // Provide actionable error messages
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        `Kusto auth failed (${response.status}). Ensure AAD app has access to database '${database}' on cluster '${clusterUrl}'. ` +
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

  // Fallback â€” return empty
  logger.warn({ responseKeys: Object.keys(response as object) }, 'Unexpected Kusto response format');
  return { columns: [], rows: [], rowCount: 0 };
}

/**
 * Query Analytics handler â€” executes KQL against PlayFab Insights
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
