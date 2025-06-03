import { PlayFab, PlayFabEconomyAPI, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayerAPI, callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { UpdateInventoryItemsParams, UpdateInventoryItemsResult } from "../../types/handler-types.js";

export const UpdateInventoryItems: PlayFabHandler<UpdateInventoryItemsParams, UpdateInventoryItemsResult> = async (params) => {
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
    CollectionId: params.CollectionId,
    Entity: {
      Id: entityId,
      Type: "title_player_account"
    },
    Item: params.Item,
    IdempotencyId: params.IdempotencyId
  });
  
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.UpdateInventoryItems,
    request,
    'UpdateInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds
  };
}
