/**
 * PublishDraftItem handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { PublishDraftItemParams, PublishDraftItemResult } from '../../types/handler-types.js';

export class PublishDraftItemHandler extends BaseHandler<PublishDraftItemParams, PublishDraftItemResult> {
  constructor() {
    super('PublishDraftItem');
  }
  
  async execute(params: PublishDraftItemParams): Promise<HandlerResponse<PublishDraftItemResult>> {
    try {
      this.logInfo('Publishing draft item', { 
        itemId: params.ItemId,
        hasETag: !!params.ETag 
      });
      
      // Build request
      const request = this.addCustomTags({
        Id: params.ItemId,
        ETag: params.ETag
      });
      
      // Make API call
      await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).PublishDraftItem,
        request,
        'PublishDraftItem'
      );
      
      this.logInfo('Draft item published successfully', { itemId: params.ItemId });
      
      return {
        success: true,
      };
    } catch (error) {
      this.logError('Failed to publish draft item', error);
      throw error;
    }
  }
}

// Export singleton instance
export const publishDraftItemHandler = new PublishDraftItemHandler();

// Export handler function for backward compatibility
export const PublishDraftItem = publishDraftItemHandler.toHandler();