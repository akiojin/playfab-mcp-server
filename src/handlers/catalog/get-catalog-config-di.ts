/**
 * GetCatalogConfig handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetCatalogConfigParams, GetCatalogConfigResult } from '../../types/handler-types.js';

export class GetCatalogConfigHandler extends BaseHandler<GetCatalogConfigParams, GetCatalogConfigResult> {
  constructor() {
    super('GetCatalogConfig');
  }
  
  async execute(params: GetCatalogConfigParams): Promise<HandlerResponse<GetCatalogConfigResult>> {
    try {
      this.logInfo('Getting catalog configuration');
      
      // Build request
      const request = this.addCustomTags({});
      
      // Make API call
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).GetCatalogConfig,
        request,
        'GetCatalogConfig'
      );
      
      this.logInfo('Catalog configuration retrieved successfully');
      
      return {
        success: true,
        config: result.Config || {},
      };
    } catch (error) {
      this.logError('Failed to get catalog configuration', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getCatalogConfigHandler = new GetCatalogConfigHandler();

// Export handler function for backward compatibility
export const GetCatalogConfig = getCatalogConfigHandler.toHandler();