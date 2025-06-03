/**
 * Handler Factory for creating handlers with dependency injection
 */

import { BaseHandler } from './base-handler.js';
import { PlayFabHandler } from '../types/index.js';

export class HandlerFactory {
  private static handlers = new Map<string, BaseHandler<any, any>>();
  
  /**
   * Register a handler class
   */
  static register<TParams, TResult>(
    name: string,
    HandlerClass: new () => BaseHandler<TParams, TResult>
  ): void {
    if (!this.handlers.has(name)) {
      this.handlers.set(name, new HandlerClass());
    }
  }
  
  /**
   * Get a handler instance
   */
  static get<TParams, TResult>(name: string): BaseHandler<TParams, TResult> | undefined {
    return this.handlers.get(name);
  }
  
  /**
   * Get a handler function
   */
  static getHandler<TParams, TResult>(name: string): PlayFabHandler<TParams, TResult> | undefined {
    const handler = this.handlers.get(name);
    return handler?.toHandler();
  }
  
  /**
   * Clear all handlers (useful for testing)
   */
  static clear(): void {
    this.handlers.clear();
  }
  
  /**
   * Get all registered handler names
   */
  static getHandlerNames(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Decorator for auto-registering handlers
 */
export function RegisterHandler(name: string) {
  return function <T extends new () => BaseHandler<any, any>>(constructor: T) {
    HandlerFactory.register(name, constructor);
    return constructor;
  };
}