/**
 * Base handler class with dependency injection support
 */

import { HandlerResponse, PlayFabHandler } from '../types/index.js';
import { HandlerContext } from '../config/di-setup.js';
import { createHandlerContext } from '../config/di-setup.js';

export abstract class BaseHandler<TParams, TResult> {
  protected context: HandlerContext;
  
  constructor(handlerName: string) {
    this.context = createHandlerContext(handlerName);
  }
  
  /**
   * Execute the handler logic
   */
  abstract execute(params: TParams): Promise<HandlerResponse<TResult>>;
  
  /**
   * Create a handler function that can be used in the existing system
   */
  toHandler(): PlayFabHandler<TParams, TResult> {
    return (async (params: TParams) => {
      const response = await this.execute(params);
      if (!response.success) {
        throw response;
      }
      // Extract the result data, excluding the success property
      const { success, ...result } = response as any;
      return { ...result, success } as TResult & { success: boolean };
    }) as PlayFabHandler<TParams, TResult>;
  }
  
  /**
   * Helper method to log info
   */
  protected logInfo(message: string, data?: unknown): void {
    this.context.logger.info(message, data);
  }
  
  /**
   * Helper method to log errors
   */
  protected logError(message: string, error?: unknown): void {
    this.context.logger.error(message, { error });
  }
  
  /**
   * Helper method to validate required string
   */
  protected validateRequiredString(value: unknown, fieldName: string, options?: { maxLength?: number }): string {
    return this.context.utils.validator.validateRequiredString(value, fieldName, options);
  }
  
  /**
   * Helper method to validate optional string
   */
  protected validateString(value: unknown, fieldName: string, options?: { maxLength?: number }): string | undefined {
    return this.context.utils.validator.validateString(value, fieldName, options);
  }
  
  /**
   * Helper method to validate number
   */
  protected validateNumber(value: unknown, fieldName: string, options?: { min?: number; max?: number }): number | undefined {
    return this.context.utils.validator.validateNumber(value, fieldName, options);
  }
  
  /**
   * Helper method to validate pagination count
   */
  protected validatePaginationCount(value: unknown, fieldName: string, min?: number, defaultValue?: number): number {
    return this.context.utils.validator.validatePaginationCount(value, fieldName, min, defaultValue);
  }
  
  /**
   * Helper method to create error response
   */
  protected createErrorResponse(code: string, message: string, data?: unknown): HandlerResponse<TResult> {
    return this.context.utils.errors.createErrorResponse(code, message, data);
  }
  
  /**
   * Helper method to add custom tags
   */
  protected addCustomTags<T extends Record<string, unknown>>(request: T): T {
    return this.context.utils.wrapper.addCustomTags(request);
  }
  
  /**
   * Helper method to call admin API
   */
  protected async callAdminAPI<TRequest, TResponse extends PlayFabModule.IPlayFabResultCommon>(
    apiMethod: (request: TRequest, callback: PlayFabModule.ApiCallback<TResponse>) => void,
    request: TRequest,
    methodName: string
  ): Promise<TResponse> {
    return this.context.utils.wrapper.callAdminAPI(apiMethod, request, methodName);
  }
  
  /**
   * Helper method to call player API
   */
  protected async callPlayerAPI<TRequest, TResponse extends PlayFabModule.IPlayFabResultCommon>(
    apiMethod: (request: TRequest, callback: PlayFabModule.ApiCallback<TResponse>) => void,
    request: TRequest,
    methodName: string
  ): Promise<TResponse> {
    return this.context.utils.wrapper.callPlayerAPI(apiMethod, request, methodName);
  }
  
  /**
   * Helper method to call bulk API
   */
  protected async callBulkAPI<TRequest, TResponse extends PlayFabModule.IPlayFabResultCommon>(
    apiMethod: (request: TRequest, callback: PlayFabModule.ApiCallback<TResponse>) => void,
    request: TRequest,
    methodName: string
  ): Promise<TResponse> {
    return this.context.utils.wrapper.callBulkAPI(apiMethod, request, methodName);
  }
}