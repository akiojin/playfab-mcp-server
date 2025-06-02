import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function DeleteInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    // Validate confirmation
    if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
      reject("Error: Deletion confirmation required. Set ConfirmDeletion to true to proceed with removing items from player inventory.")
      return
    }
    
    PlayFabEconomyAPI.DeleteInventoryItems({
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
        message: `Items permanently deleted from player ${params.TitlePlayerAccountId}'s inventory.`
      })
    })
  })
}
