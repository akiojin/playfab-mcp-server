/**
 * DeleteItem handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { DeleteItemParams, DeleteItemResult } from '../../types/handler-types.js';

export class DeleteItemHandler extends BaseHandler<DeleteItemParams, DeleteItemResult> {
  constructor() {
    super('DeleteItem');
  }
  
  async execute(params: DeleteItemParams): Promise<HandlerResponse<DeleteItemResult>> {
    try {
      // Validate confirmation
      if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
        return this.createErrorResponse(
          'CONFIRMATION_REQUIRED',
          'Deletion confirmation required. Set ConfirmDeletion to true to proceed with this destructive operation.'
        );
      }
      
      this.logInfo('Deleting catalog item', { itemId: params.ItemId });
      
      // Build request
      const request = this.addCustomTags({
        Id: params.ItemId
      });
      
      // Make API call
      await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).DeleteItem,
        request,
        'DeleteItem'
      );
      
      this.logInfo('Item deleted successfully', { itemId: params.ItemId });
      
      return {
        success: true,
        message: `Item ${params.ItemId} has been permanently deleted from the catalog and all player inventories.`
      };
    } catch (error) {
      this.logError('Failed to delete item', error);
      throw error;
    }
  }
}

// Export singleton instance
export const deleteItemHandler = new DeleteItemHandler();

// Export handler function for backward compatibility
export const DeleteItem = deleteItemHandler.toHandler();