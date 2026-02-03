/**
 * UpdateDraftItem handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { UpdateDraftItemParams, UpdateDraftItemResult } from '../../types/handler-types.js';

export class UpdateDraftItemHandler extends BaseHandler<UpdateDraftItemParams, UpdateDraftItemResult> {
  constructor() {
    super('UpdateDraftItem');
  }
  
  async execute(params: UpdateDraftItemParams): Promise<HandlerResponse<UpdateDraftItemResult>> {
    try {
      this.logInfo('Updating draft item', { 
        itemId: params.ItemId,
        publish: params.Publish || false 
      });
      
      // Build request
      const request = this.addCustomTags({
        Item: {
          Id: params.ItemId,
          ...params.Item
        },
        Publish: params.Publish || false
      });
      
      // Make API call
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).UpdateDraftItem,
        request,
        'UpdateDraftItem'
      );
      
      this.logInfo('Draft item updated successfully', { 
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
      this.logError('Failed to update draft item', error);
      throw error;
    }
  }
}

// Export singleton instance
export const updateDraftItemHandler = new UpdateDraftItemHandler();

// Export handler function for backward compatibility
export const UpdateDraftItem = updateDraftItemHandler.toHandler();