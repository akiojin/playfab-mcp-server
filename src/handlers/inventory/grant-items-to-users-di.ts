/**
 * GrantItemsToUsers handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GrantItemsToUsersParams, GrantItemsToUsersResult } from '../../types/handler-types.js';
import { addInventoryItemsHandler } from './add-inventory-items-di.js';

interface GrantItem {
  ItemId: string;
  Amount?: number;
  DurationInSeconds?: number;
}

interface Grant {
  TitlePlayerAccountId?: string;
  PlayFabId?: string;
  CollectionId?: string;
  Items: GrantItem[];
}

interface GrantItemsParams {
  Grants: Grant[];
  ContinueOnError?: boolean;
}

interface ItemGrantResult {
  itemId: string;
  success: boolean;
  transactionId?: string;
}

interface GrantResult {
  index: number;
  playerId: string;
  success: boolean;
  itemsGranted?: ItemGrantResult[];
  error?: string;
}

export class GrantItemsToUsersHandler extends BaseHandler<GrantItemsParams, GrantItemsToUsersResult> {
  constructor() {
    super('GrantItemsToUsers');
  }
  
  async execute(params: GrantItemsParams): Promise<HandlerResponse<GrantItemsToUsersResult>> {
    try {
      if (!params.Grants || !Array.isArray(params.Grants) || params.Grants.length === 0) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'Grants array is required and must not be empty'
        );
      }
      
      const continueOnError = params.ContinueOnError !== false;
      const results: GrantResult[] = [];
      
      this.logInfo('Starting grant items to users', {
        grantCount: params.Grants.length,
        continueOnError
      });
      
      for (let i = 0; i < params.Grants.length; i++) {
        const grant = params.Grants[i];
        if (!grant) continue;
        
        try {
          // Get TitlePlayerAccountId if PlayFabId is provided
          let titlePlayerAccountId = grant.TitlePlayerAccountId;
          
          if (grant.PlayFabId && !titlePlayerAccountId) {
            this.logInfo('Converting PlayFabId to TitlePlayerAccountId', { 
              playFabId: grant.PlayFabId,
              grantIndex: i 
            });
            
            const accountResult = await this.callAdminAPI<any, any>(
              (this.context.apis.profileAPI as any).GetTitlePlayersFromMasterPlayerAccountIds,
              { 
                TitleId: this.context.config.titleId,
                MasterPlayerAccountIds: [grant.PlayFabId] 
              },
              'GetTitlePlayersFromMasterPlayerAccountIds'
            );
            
            const accounts = accountResult.TitlePlayerAccounts || {};
            const account = accounts[grant.PlayFabId];
            
            if (!account || !account.Id) {
              throw new Error(`No TitlePlayerAccount found for PlayFabId: ${grant.PlayFabId}`);
            }
            
            titlePlayerAccountId = account.Id;
          }
          
          if (!titlePlayerAccountId) {
            throw new Error('Either TitlePlayerAccountId or PlayFabId must be provided');
          }
          
          if (!grant.Items || !Array.isArray(grant.Items) || grant.Items.length === 0) {
            throw new Error('Items array is required and must not be empty');
          }
          
          // Process each item for the player
          const grantResults: ItemGrantResult[] = [];
          for (const item of grant.Items) {
            const addParams = {
              TitlePlayerAccountId: titlePlayerAccountId,
              Amount: item.Amount || 1,
              CollectionId: grant.CollectionId || 'default',
              Item: { Id: item.ItemId },
              DurationInSeconds: item.DurationInSeconds,
              IdempotencyId: `grant_${Date.now()}_${i}_${item.ItemId}`
            };
            
            const result = await addInventoryItemsHandler.execute(addParams);
            
            if (result.success) {
              grantResults.push({
                itemId: item.ItemId,
                success: true,
                transactionId: (result as any).transactionIds?.[0]
              });
            } else {
              throw new Error(`Failed to grant item ${item.ItemId}`);
            }
          }
          
          this.logInfo('Successfully granted items to user', {
            grantIndex: i,
            playerId: titlePlayerAccountId,
            itemCount: grantResults.length
          });
          
          results.push({
            index: i,
            playerId: titlePlayerAccountId,
            success: true,
            itemsGranted: grantResults
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          this.logError('Failed to grant items to user', {
            grantIndex: i,
            playerId: grant.TitlePlayerAccountId || grant.PlayFabId || 'unknown',
            error: errorMessage
          });
          
          results.push({
            index: i,
            playerId: grant.TitlePlayerAccountId || grant.PlayFabId || 'unknown',
            success: false,
            error: errorMessage
          });
          
          if (!continueOnError) {
            break;
          }
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      this.logInfo('Grant items to users completed', {
        totalGrants: results.length,
        successCount,
        failureCount
      });
      
      return {
        success: true,
        itemGrantResults: results.map(r => ({
          PlayFabId: r.playerId,
          Result: r.success,
          ItemGrantResults: r.itemsGranted?.map(ig => ({
            ItemId: ig.itemId,
            ItemInstanceId: ig.transactionId
          }))
        }))
      };
    } catch (error) {
      this.logError('Failed to grant items to users', error);
      throw error;
    }
  }
}

// Export singleton instance
export const grantItemsToUsersHandler = new GrantItemsToUsersHandler();

// Export handler function for backward compatibility
export const GrantItemsToUsers = grantItemsToUsersHandler.toHandler();