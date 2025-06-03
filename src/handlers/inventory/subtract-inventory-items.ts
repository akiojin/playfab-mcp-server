import { PlayFab, PlayFabEconomyAPI, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayerAPI, callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { SubtractInventoryItemsParams, SubtractInventoryItemsResult } from "../../types/handler-types.js";

export const SubtractInventoryItems: PlayFabHandler<SubtractInventoryItemsParams, SubtractInventoryItemsResult> = async (params) => {
  let entityId = params.TitlePlayerAccountId;
  
  // If PlayFabId is provided, convert it to TitlePlayerAccountId
  if (params.PlayFabId && !entityId) {
    const accountResult = await callPlayFabApi(
      PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds,
      { 
        TitleId: PlayFab.settings.titleId,
        MasterPlayerAccountIds: [params.PlayFabId] 
      },
      'GetTitlePlayersFromMasterPlayerAccountIds'
    );
    
    const accounts = accountResult.TitlePlayerAccounts || {};
    const account = accounts[params.PlayFabId];
    
    if (!account || !account.Id) {
      throw new Error(`No TitlePlayerAccount found for PlayFabId: ${params.PlayFabId}`);
    }
    
    entityId = account.Id;
  }
  
  if (!entityId) {
    throw new Error('Either TitlePlayerAccountId or PlayFabId must be provided');
  }
  
  const request = addCustomTags({
    Amount: params.Amount,
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
  
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.SubtractInventoryItems,
    request,
    'SubtractInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds
  };
}
