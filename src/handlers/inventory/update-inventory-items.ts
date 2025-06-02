import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function UpdateInventoryItems(params: any) {
  const request = addCustomTags({
    CollectionId: params.CollectionId,
    Entity: {
      Id: params.TitlePlayerAccountId,
      Type: "title_player_account"
    },
    Item: params.Item,
    IdempotencyId: params.IdempotencyId
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.UpdateInventoryItems,
    request,
    'UpdateInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
  };
}
