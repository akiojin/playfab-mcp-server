/**
 * UpdateCatalogConfig handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { UpdateCatalogConfigParams, UpdateCatalogConfigResult } from '../../types/handler-types.js';

export class UpdateCatalogConfigHandler extends BaseHandler<UpdateCatalogConfigParams, UpdateCatalogConfigResult> {
  constructor() {
    super('UpdateCatalogConfig');
  }
  
  async execute(params: UpdateCatalogConfigParams): Promise<HandlerResponse<UpdateCatalogConfigResult>> {
    try {
      this.logInfo('Updating catalog configuration', { 
        hasContentTypes: !!params.ContentTypes,
        hasTags: !!params.Tags 
      });
      
      // Build configuration
      const config = {
        Config: {
          IsCatalogEnabled: true,
          Catalog: {} as {
            ContentTypes?: string[];
            Tags?: string[];
          }
        }
      };
      
      if (params.ContentTypes) {
        config.Config.Catalog.ContentTypes = params.ContentTypes;
      }
      
      if (params.Tags) {
        config.Config.Catalog.Tags = params.Tags;
      }
      
      // Build request
      const request = this.addCustomTags(config);
      
      // Make API call
      await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).UpdateCatalogConfig,
        request,
        'UpdateCatalogConfig'
      );
      
      this.logInfo('Catalog configuration updated successfully');
      
      return {
        success: true,
        message: 'Catalog config updated successfully'
      };
    } catch (error) {
      this.logError('Failed to update catalog configuration', error);
      throw error;
    }
  }
}

// Export singleton instance
export const updateCatalogConfigHandler = new UpdateCatalogConfigHandler();

// Export handler function for backward compatibility
export const UpdateCatalogConfig = updateCatalogConfigHandler.toHandler();