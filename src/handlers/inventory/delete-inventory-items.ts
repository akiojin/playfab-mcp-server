import { PlayFab, PlayFabEconomyAPI, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayerAPI, callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { DeleteInventoryItemsParams, DeleteInventoryItemsResult } from "../../types/handler-types.js";

interface DeleteInventoryParams extends DeleteInventoryItemsParams {
  ConfirmDeletion?: boolean;
}

export const DeleteInventoryItems: PlayFabHandler<DeleteInventoryParams, DeleteInventoryItemsResult> = async (params) => {
  // Validate confirmation
  if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
    throw new Error("Deletion confirmation required. Set ConfirmDeletion to true to proceed with removing items from player inventory.");
  }
  
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
    IdempotencyId: params.IdempotencyId,
    DeleteTimestamp: params.DeleteTimestamp
  });
  
  const result = await callPlayerAPI(
    PlayFabEconomyAPI.DeleteInventoryItems,
    request,
    'DeleteInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds
  };
}
