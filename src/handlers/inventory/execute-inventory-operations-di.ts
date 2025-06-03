/**
 * ExecuteInventoryOperations handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { ExecuteInventoryOperationsParams, ExecuteInventoryOperationsResult } from '../../types/handler-types.js';

export class ExecuteInventoryOperationsHandler extends BaseHandler<ExecuteInventoryOperationsParams, ExecuteInventoryOperationsResult> {
  constructor() {
    super('ExecuteInventoryOperations');
  }
  
  async execute(params: ExecuteInventoryOperationsParams): Promise<HandlerResponse<ExecuteInventoryOperationsResult>> {
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
      
      if (!params.Operations || !Array.isArray(params.Operations) || params.Operations.length === 0) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Operations array is required and must not be empty'
        );
      }
      
      this.logInfo('Executing inventory operations', {
        entityId,
        collectionId: params.CollectionId,
        operationCount: params.Operations.length,
        operationTypes: params.Operations.map(op => op.Type)
      });
      
      const request: any = {
        Operations: params.Operations,
        Entity: {
          Id: entityId,
          Type: 'title_player_account'
        }
      };
      
      if (params.CollectionId) request.CollectionId = params.CollectionId;
      if (params.IdempotencyId) request.IdempotencyId = params.IdempotencyId;
      
      const requestWithTags = this.addCustomTags(request);
      
      const result = await this.callPlayerAPI<any, any>(
        (this.context.apis.economyAPI as any).ExecuteInventoryOperations,
        requestWithTags,
        'ExecuteInventoryOperations'
      );
      
      this.logInfo('Inventory operations executed successfully', {
        entityId,
        eTag: result.ETag,
        transactionIds: result.TransactionIds
      });
      
      return {
        success: true,
        eTag: result.ETag,
        idempotencyId: result.IdempotencyId,
        transactionIds: result.TransactionIds,
      };
    } catch (error) {
      this.logError('Failed to execute inventory operations', error);
      throw error;
    }
  }
}

// Export singleton instance
export const executeInventoryOperationsHandler = new ExecuteInventoryOperationsHandler();

// Export handler function for backward compatibility
export const ExecuteInventoryOperations = executeInventoryOperationsHandler.toHandler();