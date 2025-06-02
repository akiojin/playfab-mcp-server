import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function SubtractInventoryItems(params: any) {
  const request = addCustomTags({
    Amount: params.Amount,
    CollectionId: params.CollectionId,
    DurationInSeconds: params.DurationInSeconds,
    Entity: {
      Id: params.TitlePlayerAccountId,
      Type: "title_player_account"
    },
    Item: params.Item,
    IdempotencyId: params.IdempotencyId,
    DeleteEmptyStacks: true
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.SubtractInventoryItems,
    request,
    'SubtractInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
  };
}
