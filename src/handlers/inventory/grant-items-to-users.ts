import { PlayFab, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayFabApi } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GrantItemsToUsersParams, GrantItemsToUsersResult } from "../../types/handler-types.js";
import { AddInventoryItems } from "../inventory/add-inventory-items.js";

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

export const GrantItemsToUsers: PlayFabHandler<GrantItemsParams, GrantItemsToUsersResult> = async (params) => {
  const continueOnError = params.ContinueOnError !== false;
  const results: GrantResult[] = [];
  
  for (let i = 0; i < params.Grants.length; i++) {
    const grant = params.Grants[i];
    if (!grant) continue;
    
    try {
      // Get TitlePlayerAccountId if PlayFabId is provided
      let titlePlayerAccountId = grant.TitlePlayerAccountId;
      
      if (grant.PlayFabId && !titlePlayerAccountId) {
        const accountResult = await callPlayFabApi(
          PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds,
          { 
            TitleId: PlayFab.settings.titleId,
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
        
        const result = await AddInventoryItems(addParams);
        grantResults.push({
          itemId: item.ItemId,
          success: true,
          transactionId: result.transactionIds?.[0]
        });
      }
      
      results.push({
        index: i,
        playerId: titlePlayerAccountId,
        success: true,
        itemsGranted: grantResults
      });
    } catch (error) {
      results.push({
        index: i,
        playerId: grant.TitlePlayerAccountId || grant.PlayFabId || 'unknown',
        success: false,
        error: String(error)
      });
      
      if (!continueOnError) {
        break;
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
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
}
