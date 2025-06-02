import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function ExecuteInventoryOperations(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.ExecuteInventoryOperations({
      Operations: params.Operations,
      Entity: params.Entity,
      CollectionId: params.CollectionId,
      IdempotencyId: params.IdempotencyId,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        eTag: result.data.ETag,
        idempotencyId: result.data.IdempotencyId,
        transactionIds: result.data.TransactionIds,
      })
    })
  })
}
