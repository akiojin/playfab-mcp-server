import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function AddInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.AddInventoryItems({
      Amount: params.Amount,
      CollectionId: params.CollectionId,
      DurationInSeconds: params.DurationInSeconds,
      IdempotencyId: params.IdempotencyId,
      Item: params.Item,
      NewStackValues: params.NewStackValues,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
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
