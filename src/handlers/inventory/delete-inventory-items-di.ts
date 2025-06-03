/**
 * DeleteInventoryItems handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { DeleteInventoryItemsParams, DeleteInventoryItemsResult } from '../../types/handler-types.js';

interface DeleteInventoryParams extends DeleteInventoryItemsParams {
  ConfirmDeletion?: boolean;
}

export class DeleteInventoryItemsHandler extends BaseHandler<DeleteInventoryParams, DeleteInventoryItemsResult> {
  constructor() {
    super('DeleteInventoryItems');
  }
  
  async execute(params: DeleteInventoryParams): Promise<HandlerResponse<DeleteInventoryItemsResult>> {
    try {
      // Validate confirmation
      if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
        return this.createErrorResponse(
          'CONFIRMATION_REQUIRED',
          'Deletion confirmation required. Set ConfirmDeletion to true to proceed with removing items from player inventory.'
        );
      }
      
      let entityId = params.TitlePlayerAccountId;
      
      // If PlayFabId is provided, convert it to TitlePlayerAccountId
      if (params.PlayFabId && !entityId) {
        this.logInfo('Converting PlayFabId to TitlePlayerAccountId', { 
          playFabId: params.PlayFabId 
        });
        
        const accountResult = await this.callAdminAPI<any, any>(
          (this.context.apis.profileAPI as any).GetTitlePlayersFromMasterPlayerAccountIds,
          { 
            TitleId: this.context.config.titleId,
            MasterPlayerAccountIds: [params.PlayFabId] 
          },
          'GetTitlePlayersFromMasterPlayerAccountIds'
        );
        
        const accounts = accountResult.TitlePlayerAccounts || {};
        const account = accounts[params.PlayFabId];
        
        if (!account || !account.Id) {
          return this.createErrorResponse(
            'PLAYER_NOT_FOUND',
            `No TitlePlayerAccount found for PlayFabId: ${params.PlayFabId}`
          );
        }
        
        entityId = account.Id;
      }
      
      if (!entityId) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Either TitlePlayerAccountId or PlayFabId must be provided'
        );
      }
      
      if (!params.Item) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Item is required'
        );
      }
      
      this.logInfo('Deleting inventory items', {
        entityId,
        collectionId: params.CollectionId,
        hasItem: !!params.Item,
        hasDeleteTimestamp: !!params.DeleteTimestamp
      });
      
      const request = this.addCustomTags({
        CollectionId: params.CollectionId,
        Entity: {
          Id: entityId,
          Type: "title_player_account"
        },
        Item: params.Item,
        IdempotencyId: params.IdempotencyId,
        DeleteTimestamp: params.DeleteTimestamp
      });
      
      const result = await this.callPlayerAPI<any, any>(
        (this.context.apis.economyAPI as any).DeleteInventoryItems,
        request,
        'DeleteInventoryItems'
      );
      
      this.logInfo('Inventory items deleted successfully', {
        entityId,
        eTag: result.ETag,
        transactionIds: result.TransactionIds
      });
      
      return {
        success: true,
        eTag: result.ETag,
        idempotencyId: result.IdempotencyId,
        transactionIds: result.TransactionIds
      };
    } catch (error) {
      this.logError('Failed to delete inventory items', error);
      throw error;
    }
  }
}

// Export singleton instance
export const deleteInventoryItemsHandler = new DeleteInventoryItemsHandler();

// Export handler function for backward compatibility
export const DeleteInventoryItems = deleteInventoryItemsHandler.toHandler();