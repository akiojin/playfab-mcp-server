/**
 * Dependency Injection Setup
 * Configures all services in the DI container
 */

import { container, TOKENS } from '../utils/container.js';
import { createLogger, type Logger } from '../utils/logger.js';
import { router } from '../utils/router.js';
import { PlayFab, PlayFabAdminAPI, PlayFabEconomyAPI, PlayFabServerAPI, PlayFabAuthenticationAPI, PlayFabProfileAPI } from '../config/playfab.js';

// Import utilities
import * as inputValidator from '../utils/input-validator.js';
import * as errorUtils from '../utils/errors.js';
import * as playfabWrapper from '../utils/playfab-wrapper.js';

export interface AppConfig {
  titleId: string;
  developerSecretKey: string;
  environment: string;
  logLevel: string;
}

/**
 * Initialize the DI container with all services
 */
export function setupDependencies(config?: Partial<AppConfig>): void {
  // Configuration
  const appConfig: AppConfig = {
    titleId: process.env['PLAYFAB_TITLE_ID'] || '',
    developerSecretKey: process.env['PLAYFAB_DEV_SECRET_KEY'] || '',
    environment: process.env['NODE_ENV'] || 'development',
    logLevel: process.env['LOG_LEVEL'] || 'info',
    ...config
  };
  
  // Validate required config
  if (!appConfig.titleId || !appConfig.developerSecretKey) {
    throw new Error('Missing required PlayFab configuration: PLAYFAB_TITLE_ID and PLAYFAB_DEV_SECRET_KEY must be set');
  }
  
  // Configure PlayFab SDK
  PlayFab.settings.titleId = appConfig.titleId;
  PlayFab.settings.developerSecretKey = appConfig.developerSecretKey;
  
  // Register core services
  container
    .value(TOKENS.Config, appConfig)
    .singleton(TOKENS.Logger, () => createLogger('app'))
    .singleton(TOKENS.Router, () => router);
  
  // Register PlayFab API clients
  container
    .value(TOKENS.PlayFabAdminAPI, PlayFabAdminAPI)
    .value(TOKENS.PlayFabEconomyAPI, PlayFabEconomyAPI)
    .value(TOKENS.PlayFabAuthenticationAPI, PlayFabAuthenticationAPI)
    .value(TOKENS.PlayFabProfileAPI, PlayFabProfileAPI)
    .value(TOKENS.PlayFabServerAPI, PlayFabServerAPI);
  
  // Register utilities
  container
    .value(TOKENS.PlayFabWrapper, playfabWrapper)
    .value(TOKENS.InputValidator, inputValidator)
    .value(TOKENS.ErrorHandler, errorUtils);
}

/**
 * Create a logger with dependency injection
 */
export function createInjectedLogger(module: string) {
  return createLogger(module);
}

/**
 * Get PlayFab APIs from container
 */
export function getPlayFabAPIs() {
  return {
    adminAPI: container.get(TOKENS.PlayFabAdminAPI),
    economyAPI: container.get(TOKENS.PlayFabEconomyAPI),
    authenticationAPI: container.get(TOKENS.PlayFabAuthenticationAPI),
    profileAPI: container.get(TOKENS.PlayFabProfileAPI),
    serverAPI: container.get(TOKENS.PlayFabServerAPI),
  };
}

/**
 * Create a handler context with injected dependencies
 */
export interface HandlerContext {
  logger: ReturnType<typeof createLogger>;
  config: AppConfig;
  apis: ReturnType<typeof getPlayFabAPIs>;
  utils: {
    validator: typeof inputValidator;
    errors: typeof errorUtils;
    wrapper: typeof playfabWrapper;
  };
}

export function createHandlerContext(handlerName: string): HandlerContext {
  return {
    logger: createInjectedLogger(handlerName),
    config: container.get(TOKENS.Config),
    apis: getPlayFabAPIs(),
    utils: {
      validator: container.get(TOKENS.InputValidator),
      errors: container.get(TOKENS.ErrorHandler),
      wrapper: container.get(TOKENS.PlayFabWrapper),
    },
  };
}