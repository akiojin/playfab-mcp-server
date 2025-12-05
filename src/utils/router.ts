/**
 * Router pattern implementation for MCP tool handlers
 */
import { createLogger } from './logger.js';

const getLogger = () => createLogger('router');

export type ToolHandler<TParams = unknown, TResult = unknown> = (args: TParams) => Promise<TResult>;

export interface Route<TParams = unknown, TResult = unknown> {
  handler: ToolHandler<TParams, TResult>;
  description?: string;
}

export class ToolRouter {
  private routes: Map<string, Route<unknown, unknown>> = new Map();

  /**
   * Register a tool handler
   */
  register<TParams = unknown, TResult = unknown>(
    name: string, 
    handler: ToolHandler<TParams, TResult>, 
    description?: string
  ): void {
    if (this.routes.has(name)) {
      getLogger().warn(`Overwriting existing handler for tool: ${name}`, { tool: name });
    }

    this.routes.set(name, { handler: handler as ToolHandler<unknown, unknown>, description });
    getLogger().debug(`Registered handler for tool: ${name}`, { tool: name, description });
  }

  /**
   * Register multiple handlers at once
   */
  registerBatch(handlers: Record<string, Route<unknown, unknown> | ToolHandler>): void {
    Object.entries(handlers).forEach(([name, value]) => {
      if (typeof value === 'function') {
        this.register(name, value);
      } else {
        this.register(name, value.handler, value.description);
      }
    });
  }

  /**
   * Get a handler by name
   */
  get(name: string): ToolHandler<unknown, unknown> | undefined {
    return this.routes.get(name)?.handler;
  }

  /**
   * Check if a handler exists
   */
  has(name: string): boolean {
    return this.routes.has(name);
  }

  /**
   * Execute a handler
   */
  async execute<TParams = unknown, TResult = unknown>(
    name: string, 
    args: TParams
  ): Promise<TResult> {
    const route = this.routes.get(name);
    
    if (!route) {
      throw new Error(`Unknown tool: ${name}`);
    }

    getLogger().debug(`Executing handler for tool: ${name}`, { tool: name, hasArgs: !!args });

    try {
      return await route.handler(args) as TResult;
    } catch (error) {
      getLogger().error(`Handler failed for tool: ${name}`, { tool: name, error });
      throw error;
    }
  }

  /**
   * Get all registered tool names
   */
  getToolNames(): string[] {
    return Array.from(this.routes.keys());
  }

  /**
   * Get all routes for debugging
   */
  getRoutes(): Array<{ name: string; description?: string }> {
    return Array.from(this.routes.entries()).map(([name, route]) => ({
      name,
      description: route.description,
    }));
  }

  /**
   * Clear all routes
   */
  clear(): void {
    this.routes.clear();
    getLogger().debug('Cleared all routes');
  }

  /**
   * Create middleware chain support
   */
  compose(...middlewares: Array<(next: ToolHandler) => ToolHandler>): (handler: ToolHandler) => ToolHandler {
    return (handler: ToolHandler) => {
      return middlewares.reduceRight((next, middleware) => middleware(next), handler);
    };
  }
}

// Create singleton instance
export const router = new ToolRouter();

// Middleware examples
export const withLogging = <TParams = unknown, TResult = unknown>(
  next: ToolHandler<TParams, TResult>
): ToolHandler<TParams, TResult> => {
  return async (args: TParams) => {
    getLogger().debug('Middleware: withLogging - before', { args });
    const result = await next(args);
    getLogger().debug('Middleware: withLogging - after', { result });
    return result;
  };
};

export const withValidation = <TParams = unknown, TResult = unknown>(
  validator: (args: TParams) => void
) => {
  return (next: ToolHandler<TParams, TResult>): ToolHandler<TParams, TResult> => {
    return async (args: TParams) => {
      validator(args);
      return next(args);
    };
  };
};

export const withRetry = <TParams = unknown, TResult = unknown>(
  retryOptions: Partial<import('./retry.js').RetryOptions> = {}
) => {
  return (next: ToolHandler<TParams, TResult>): ToolHandler<TParams, TResult> => {
    return async (args: TParams) => {
      const { retryWithPlayFabLogic } = await import('./retry.js');
      return retryWithPlayFabLogic(() => next(args), retryOptions);
    };
  };
};