/**
 * Router pattern implementation for MCP tool handlers
 */
import { createLogger } from './logger.js';

const logger = createLogger('router');

export type ToolHandler = (args: any) => Promise<any>;

export interface Route {
  handler: ToolHandler;
  description?: string;
}

export class ToolRouter {
  private routes: Map<string, Route> = new Map();

  /**
   * Register a tool handler
   */
  register(name: string, handler: ToolHandler, description?: string): void {
    if (this.routes.has(name)) {
      logger.warn({ tool: name }, `Overwriting existing handler for tool: ${name}`);
    }
    
    this.routes.set(name, { handler, description });
    logger.debug({ tool: name, description }, `Registered handler for tool: ${name}`);
  }

  /**
   * Register multiple handlers at once
   */
  registerBatch(handlers: Record<string, Route | ToolHandler>): void {
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
  get(name: string): ToolHandler | undefined {
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
  async execute(name: string, args: any): Promise<any> {
    const route = this.routes.get(name);
    
    if (!route) {
      throw new Error(`Unknown tool: ${name}`);
    }

    logger.debug({ tool: name, hasArgs: !!args }, `Executing handler for tool: ${name}`);
    
    try {
      return await route.handler(args);
    } catch (error) {
      logger.error({ tool: name, error }, `Handler failed for tool: ${name}`);
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
    logger.debug('Cleared all routes');
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
export const withLogging = (next: ToolHandler): ToolHandler => {
  return async (args: any) => {
    logger.debug({ args }, 'Middleware: withLogging - before');
    const result = await next(args);
    logger.debug({ result }, 'Middleware: withLogging - after');
    return result;
  };
};

export const withValidation = (validator: (args: any) => void) => {
  return (next: ToolHandler): ToolHandler => {
    return async (args: any) => {
      validator(args);
      return next(args);
    };
  };
};

export const withRetry = (maxRetries = 3, delay = 1000) => {
  return (next: ToolHandler): ToolHandler => {
    return async (args: any) => {
      let lastError: any;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await next(args);
        } catch (error) {
          lastError = error;
          logger.warn({ attempt: i + 1, maxRetries, error }, 'Retry attempt failed');
          
          if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
          }
        }
      }
      
      throw lastError;
    };
  };
};