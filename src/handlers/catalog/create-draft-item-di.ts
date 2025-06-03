/**
 * CreateDraftItem handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { CreateDraftItemParams, CreateDraftItemResult } from '../../types/handler-types.js';

export class CreateDraftItemHandler extends BaseHandler<CreateDraftItemParams, CreateDraftItemResult> {
  constructor() {
    super('CreateDraftItem');
  }
  
  async execute(params: CreateDraftItemParams): Promise<HandlerResponse<CreateDraftItemResult>> {
    try {
      // Validate NEUTRAL title is present
      if (!params.Item || !params.Item.Title || !params.Item.Title['NEUTRAL']) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Title with NEUTRAL locale is required for creating draft items'
        );
      }
      
      this.logInfo('Creating draft item', { 
        hasTitle: !!params.Item.Title,
        publish: params.Publish || false 
      });
      
      // Build request
      const request = this.addCustomTags({
        Item: params.Item,
        Publish: params.Publish || false
      });
      
      // Make API call
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).CreateDraftItem,
        request,
        'CreateDraftItem'
      );
      
      this.logInfo('Draft item created successfully', { 
        itemId: result.Item?.Id,
        published: params.Publish || false 
      });
      
      return {
        success: true,
        item: {
          Id: result.Item?.Id || '',
          ETag: result.Item?.ETag
        },
      };
    } catch (error) {
      this.logError('Failed to create draft item', error);
      throw error;
    }
  }
}

// Export singleton instance
export const createDraftItemHandler = new CreateDraftItemHandler();

// Export handler function for backward compatibility
export const CreateDraftItem = createDraftItemHandler.toHandler();