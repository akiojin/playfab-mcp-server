import { PlayFab, PlayFabEconomyAPI, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayerAPI, callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetInventoryCollectionIdsParams, GetInventoryCollectionIdsResult } from "../../types/handler-types.js";

export const GetInventoryCollectionIds: PlayFabHandler<GetInventoryCollectionIdsParams, GetInventoryCollectionIdsResult> = async (params) => {
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
  if (params.ContinuationToken) request.ContinuationToken = params.ContinuationToken;
  
  const requestWithTags = addCustomTags(request);
  
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.GetInventoryCollectionIds,
    requestWithTags,
    'GetInventoryCollectionIds'
  );
  
  return {
    success: true,
    collectionIds: result.CollectionIds || [],
    continuationToken: result.ContinuationToken
  };
}
