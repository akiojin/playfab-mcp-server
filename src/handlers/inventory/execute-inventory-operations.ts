import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function ExecuteInventoryOperations(params: any) {
  const request = addCustomTags({
    Operations: params.Operations,
    Entity: params.Entity,
    CollectionId: params.CollectionId,
    IdempotencyId: params.IdempotencyId
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.ExecuteInventoryOperations,
    request,
    'ExecuteInventoryOperations'
  );
  
  return {
    success: true,
    eTag: result.ETag,
    idempotencyId: result.IdempotencyId,
    transactionIds: result.TransactionIds,
  };
}
