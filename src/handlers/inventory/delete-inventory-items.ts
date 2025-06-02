import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function DeleteInventoryItems(params: any) {
  // Validate confirmation
  if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
    throw new Error("Deletion confirmation required. Set ConfirmDeletion to true to proceed with removing items from player inventory.");
  }
  
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
    PlayFabEconomyAPI.DeleteInventoryItems,
    request,
    'DeleteInventoryItems'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
    message: `Items permanently deleted from player ${params.TitlePlayerAccountId}'s inventory.`
  };
}
