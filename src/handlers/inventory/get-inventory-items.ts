import { PlayFab, PlayFabEconomyAPI, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayerAPI, callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetInventoryItemsParams, GetInventoryItemsResult } from "../../types/handler-types.js";

export const GetInventoryItems: PlayFabHandler<GetInventoryItemsParams, GetInventoryItemsResult> = async (params) => {
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
  
  const request: any = {
    Entity: {
      Id: entityId,
      Type: "title_player_account"
    }
  };
  
  if (params.Count !== undefined) request.Count = params.Count;
  if (params.CollectionId) request.CollectionId = params.CollectionId;
  if (params.ContinuationToken) request.ContinuationToken = params.ContinuationToken;
  if (params.Filter) request.Filter = params.Filter;
  
  const requestWithTags = addCustomTags(request);
  
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.GetInventoryItems,
    requestWithTags,
    'GetInventoryItems'
  );
  
  return {
    success: true,
    items: result.Items || [],
    continuationToken: result.ContinuationToken,
    eTag: result.ETag
  };
}
