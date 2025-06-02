import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function GetInventoryItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetInventoryItems({
      Count: params.Count,
      CollectionId: params.CollectionId,
      ContinuationToken: params.ContinuationToken,
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
        inventory: result.data.Items,
        continuationToken: result.data.ContinuationToken,
      })
    })
  })
}
