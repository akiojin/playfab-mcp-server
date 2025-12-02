/**
 * Logging utility using Pino
 */
import pino from 'pino';
import { isDevelopment, getEnvironmentName } from './env-validator.js';

// Define log levels
const LOG_LEVELS = {
  production: 'info',
  development: 'debug',
  test: 'warn',
} as const;

// Get log level based on environment
const logLevel = LOG_LEVELS[getEnvironmentName() as keyof typeof LOG_LEVELS] || 'info';

// Create logger instance
// MCP仕様: stdoutはMCPメッセージ専用、ログはstderrに出力する必要がある
// See: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
const loggerOptions: pino.LoggerOptions = {
  level: logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  redact: {
    paths: [
      'PLAYFAB_DEV_SECRET_KEY',
      'EntityToken',
      'SessionTicket',
      'Password',
      'Email',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      '*.password',
      '*.secret',
      '*.token',
      '*.key',
    ],
    remove: true,
  },
  transport: isDevelopment() ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'HH:MM:ss.l',
      destination: 2, // stderr (MCP仕様準拠)
    },
  } : undefined,
};

// 本番環境ではtransportを使用しないため、直接stderrを指定
export const logger = isDevelopment()
  ? pino(loggerOptions)
  : pino(loggerOptions, pino.destination(2)); // 2 = stderr

// Create child loggers for different modules
export const createLogger = (module: string) => {
  return logger.child({ module });
};

// Request logging middleware
export interface LogContext {
  requestId?: string;
  method?: string;
  userId?: string;
  entityId?: string;
  titleId?: string;
  [key: string]: unknown;
}

export const createRequestLogger = (context: LogContext) => {
  return logger.child({ ...context });
};

// Performance logging helper
export class PerformanceLogger {
  private startTime: number;
  private logger: pino.Logger;

  constructor(operationName: string, logger: pino.Logger = createLogger('performance')) {
    this.startTime = Date.now();
    this.logger = logger;
    this.logger.debug({ operation: operationName }, 'Operation started');
  }

  end(additionalData?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    this.logger.info({
      duration_ms: duration,
      ...additionalData,
    }, 'Operation completed');
  }

  error(error: unknown, additionalData?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    this.logger.error({
      duration_ms: duration,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: isDevelopment() ? error.stack : undefined,
      } : error,
      ...additionalData,
    }, 'Operation failed');
  }
}

// Structured logging helpers
export const logAPICall = (
  method: string,
  request: unknown,
  response: unknown,
  duration: number,
  error?: unknown
) => {
  const log = createLogger('api');
  
  if (error) {
    log.error({
      method,
      request: isDevelopment() ? request : undefined,
      error: error instanceof Error ? {
        message: error.message,
        code: (error as any).code,
      } : error,
      duration_ms: duration,
    }, `PlayFab API call failed: ${method}`);
  } else {
    log.info({
      method,
      request: isDevelopment() ? request : undefined,
      response: isDevelopment() ? response : undefined,
      duration_ms: duration,
    }, `PlayFab API call succeeded: ${method}`);
  }
};

// Log MCP tool calls
export const logToolCall = (
  toolName: string,
  args: unknown,
  result: unknown,
  duration: number,
  error?: unknown
) => {
  const log = createLogger('mcp');
  
  if (error) {
    log.error({
      tool: toolName,
      args: isDevelopment() ? args : undefined,
      error: error instanceof Error ? {
        message: error.message,
        stack: isDevelopment() ? error.stack : undefined,
      } : error,
      duration_ms: duration,
    }, `MCP tool call failed: ${toolName}`);
  } else {
    log.debug({
      tool: toolName,
      args: isDevelopment() ? args : undefined,
      result: isDevelopment() ? result : undefined,
      duration_ms: duration,
    }, `MCP tool call completed: ${toolName}`);
  }
};