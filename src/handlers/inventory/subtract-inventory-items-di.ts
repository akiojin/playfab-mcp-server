/**
 * SubtractInventoryItems handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { SubtractInventoryItemsParams, SubtractInventoryItemsResult } from '../../types/handler-types.js';

export class SubtractInventoryItemsHandler extends BaseHandler<SubtractInventoryItemsParams, SubtractInventoryItemsResult> {
  constructor() {
    super('SubtractInventoryItems');
  }
  
  async execute(params: SubtractInventoryItemsParams): Promise<HandlerResponse<SubtractInventoryItemsResult>> {
    try {
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
      
      if (params.Amount === undefined || params.Amount === null) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Amount is required'
        );
      }
      
      const amount = this.validateNumber(params.Amount, 'Amount', { min: 1 });
      if (amount === undefined) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Amount must be a positive number'
        );
      }
      
      if (!params.Item) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Item is required'
        );
      }
      
      this.logInfo('Subtracting inventory items', {
        entityId,
        amount,
        collectionId: params.CollectionId,
        hasItem: !!params.Item
      });
      
      const request = this.addCustomTags({
        Amount: amount,
        CollectionId: params.CollectionId,
        DurationInSeconds: params.DurationInSeconds,
        Entity: {
          Id: entityId,
          Type: "title_player_account"
        },
        Item: params.Item,
        IdempotencyId: params.IdempotencyId,
        DeleteEmptyStacks: true
      });
      
      const result = await this.callPlayerAPI<any, any>(
        (this.context.apis.economyAPI as any).SubtractInventoryItems,
        request,
        'SubtractInventoryItems'
      );
      
      this.logInfo('Inventory items subtracted successfully', {
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
      this.logError('Failed to subtract inventory items', error);
      throw error;
    }
  }
}

// Export singleton instance
export const subtractInventoryItemsHandler = new SubtractInventoryItemsHandler();

// Export handler function for backward compatibility
export const SubtractInventoryItems = subtractInventoryItemsHandler.toHandler();