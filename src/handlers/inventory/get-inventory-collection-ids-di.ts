/**
 * GetInventoryCollectionIds handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetInventoryCollectionIdsParams, GetInventoryCollectionIdsResult } from '../../types/handler-types.js';

export class GetInventoryCollectionIdsHandler extends BaseHandler<GetInventoryCollectionIdsParams, GetInventoryCollectionIdsResult> {
  constructor() {
    super('GetInventoryCollectionIds');
  }
  
  async execute(params: GetInventoryCollectionIdsParams): Promise<HandlerResponse<GetInventoryCollectionIdsResult>> {
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
      
      this.logInfo('Getting inventory collection IDs', {
        entityId,
        count: params.Count,
        hasContinuationToken: !!params.ContinuationToken
      });
      
      const request: any = {
        Entity: {
          Id: entityId,
          Type: "title_player_account"
        }
      };
      
      if (params.Count !== undefined) {
        const count = this.validatePaginationCount(params.Count, 'Count', 1, 50);
        request.Count = count;
      }
      
      if (params.ContinuationToken) {
        request.ContinuationToken = params.ContinuationToken;
      }
      
      const requestWithTags = this.addCustomTags(request);
      
      const result = await this.callPlayerAPI<any, any>(
        (this.context.apis.economyAPI as any).GetInventoryCollectionIds,
        requestWithTags,
        'GetInventoryCollectionIds'
      );
      
      this.logInfo('Retrieved inventory collection IDs', {
        entityId,
        collectionCount: result.CollectionIds?.length || 0,
        hasContinuationToken: !!result.ContinuationToken
      });
      
      return {
        success: true,
        collectionIds: result.CollectionIds || [],
        continuationToken: result.ContinuationToken
      };
    } catch (error) {
      this.logError('Failed to get inventory collection IDs', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getInventoryCollectionIdsHandler = new GetInventoryCollectionIdsHandler();

// Export handler function for backward compatibility
export const GetInventoryCollectionIds = getInventoryCollectionIdsHandler.toHandler();