/**
 * GetItem handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetItemParams, GetItemResult } from '../../types/handler-types.js';

export class GetItemHandler extends BaseHandler<GetItemParams, GetItemResult> {
  constructor() {
    super('GetItem');
  }
  
  async execute(params: GetItemParams): Promise<HandlerResponse<GetItemResult>> {
    try {
      this.logInfo('Getting catalog item', { itemId: params.ItemId });
      
      // Build request
      const request = this.addCustomTags({
        Id: params.ItemId
      });
      
      // Make API call
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).GetItem,
        request,
        'GetItem'
      );
      
      this.logInfo('Item retrieved successfully', { itemId: params.ItemId });
      
      return {
        success: true,
        item: result.Item || {},
      };
    } catch (error) {
      this.logError('Failed to get item', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getItemHandler = new GetItemHandler();

// Export handler function for backward compatibility
export const GetItem = getItemHandler.toHandler();