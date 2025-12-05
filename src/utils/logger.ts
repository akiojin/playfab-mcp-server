/**
 * MCP SDK Logging utility
 * Uses server.sendLoggingMessage to send logs to MCP clients
 */
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { LoggingLevel } from "@modelcontextprotocol/sdk/types.js";

let serverInstance: Server | null = null;

/**
 * Set the MCP server instance for logging
 */
export function setServer(server: Server): void {
  serverInstance = server;
}

/**
 * Get the current server instance (for testing)
 */
export function getServer(): Server | null {
  return serverInstance;
}

/**
 * Create a logger for a specific module
 */
export function createLogger(module: string) {
  const log = (level: LoggingLevel, message: string, data?: unknown) => {
    if (!serverInstance) return;
    serverInstance.sendLoggingMessage({
      level,
      logger: module,
      data: data !== undefined ? { message, ...(typeof data === 'object' && data !== null ? data : { value: data }) } : message,
    }).catch(() => {
      // Silently ignore logging errors
    });
  };

  return {
    debug: (message: string, data?: unknown) => log("debug", message, data),
    info: (message: string, data?: unknown) => log("info", message, data),
    warn: (message: string, data?: unknown) => log("warning", message, data),
    error: (message: string, data?: unknown) => log("error", message, data),
    fatal: (message: string, data?: unknown) => log("emergency", message, data),
  };
}

/**
 * Logger type for external use
 */
export type Logger = ReturnType<typeof createLogger>;

/**
 * Performance logging helper
 */
export class PerformanceLogger {
  private startTime: number;
  private operationName: string;
  private logger: Logger;

  constructor(operationName: string, module = "performance") {
    this.startTime = Date.now();
    this.operationName = operationName;
    this.logger = createLogger(module);
    this.logger.debug(`Operation started: ${operationName}`);
  }

  end(additionalData?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    this.logger.info(`Operation completed: ${this.operationName}`, {
      duration_ms: duration,
      ...additionalData,
    });
  }

  error(error: unknown, additionalData?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    this.logger.error(`Operation failed: ${this.operationName}`, {
      duration_ms: duration,
      error: error instanceof Error ? { message: error.message, name: error.name } : error,
      ...additionalData,
    });
  }
}

/**
 * Log PlayFab API calls
 */
export function logAPICall(
  method: string,
  _request: unknown,
  _response: unknown,
  duration: number,
  error?: unknown
): void {
  const logger = createLogger("api");
  if (error) {
    logger.error(`PlayFab API call failed: ${method}`, {
      method,
      duration_ms: duration,
      error: error instanceof Error ? { message: error.message } : error,
    });
  } else {
    logger.info(`PlayFab API call succeeded: ${method}`, {
      method,
      duration_ms: duration,
    });
  }
}

/**
 * Log MCP tool calls
 */
export function logToolCall(
  toolName: string,
  _args: unknown,
  _result: unknown,
  duration: number,
  error?: unknown
): void {
  const logger = createLogger("mcp");
  if (error) {
    logger.error(`MCP tool call failed: ${toolName}`, {
      tool: toolName,
      duration_ms: duration,
      error: error instanceof Error ? { message: error.message } : error,
    });
  } else {
    logger.debug(`MCP tool call completed: ${toolName}`, {
      tool: toolName,
      duration_ms: duration,
    });
  }
}
