import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function UpdateInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.UpdateInventoryItems({
      CollectionId: params.CollectionId,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
      Item: params.Item,
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
