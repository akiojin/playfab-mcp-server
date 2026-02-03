/**
 * Simple Dependency Injection Container
 */

type Constructor<T = {}> = new (...args: any[]) => T;
type Factory<T> = () => T;
type Token<T> = string | symbol | Constructor<T>;

interface ServiceDefinition<T> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

export class Container {
  private services = new Map<Token<any>, ServiceDefinition<any>>();
  
  /**
   * Register a singleton service
   */
  singleton<T>(token: Token<T>, factory: Factory<T>): this {
    this.services.set(token, {
      factory,
      singleton: true,
    });
    return this;
  }
  
  /**
   * Register a transient service (new instance each time)
   */
  transient<T>(token: Token<T>, factory: Factory<T>): this {
    this.services.set(token, {
      factory,
      singleton: false,
    });
    return this;
  }
  
  /**
   * Register a value as a singleton
   */
  value<T>(token: Token<T>, value: T): this {
    this.services.set(token, {
      factory: () => value,
      singleton: true,
      instance: value,
    });
    return this;
  }
  
  /**
   * Get a service instance
   */
  get<T>(token: Token<T>): T {
    const definition = this.services.get(token);
    
    if (!definition) {
      throw new Error(`Service not found: ${String(token)}`);
    }
    
    // Return cached singleton instance if available
    if (definition.singleton && definition.instance !== undefined) {
      return definition.instance;
    }
    
    // Create new instance
    const instance = definition.factory();
    
    // Cache singleton instance
    if (definition.singleton) {
      definition.instance = instance;
    }
    
    return instance;
  }
  
  /**
   * Check if a service is registered
   */
  has<T>(token: Token<T>): boolean {
    return this.services.has(token);
  }
  
  /**
   * Create a child container that inherits from this one
   */
  createChild(): Container {
    const child = new Container();
    // Copy all service definitions to child
    for (const [token, definition] of this.services) {
      child.services.set(token, { ...definition });
    }
    return child;
  }
  
  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
  }
}

// Global container instance
export const container = new Container();

// Service tokens
export const TOKENS = {
  // Core services
  Logger: Symbol('Logger'),
  Config: Symbol('Config'),
  
  // PlayFab API clients
  PlayFabAdminAPI: Symbol('PlayFabAdminAPI'),
  PlayFabEconomyAPI: Symbol('PlayFabEconomyAPI'),
  PlayFabAuthenticationAPI: Symbol('PlayFabAuthenticationAPI'),
  PlayFabProfileAPI: Symbol('PlayFabProfileAPI'),
  PlayFabServerAPI: Symbol('PlayFabServerAPI'),
  
  // Utilities
  PlayFabWrapper: Symbol('PlayFabWrapper'),
  InputValidator: Symbol('InputValidator'),
  ErrorHandler: Symbol('ErrorHandler'),
  Router: Symbol('Router'),
} as const;