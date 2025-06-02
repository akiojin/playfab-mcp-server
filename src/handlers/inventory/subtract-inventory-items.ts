import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function SubtractInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SubtractInventoryItems({
      Amount: params.Amount,
      CollectionId: params.CollectionId,
      DurationInSeconds: params.DurationInSeconds,
      Entity: {
        Id: params.TitlePlayerAccountId,
        Type: "title_player_account"
      },
      Item: params.Item,
      IdempotencyId: params.IdempotencyId,
      DeleteEmptyStacks: true,
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
