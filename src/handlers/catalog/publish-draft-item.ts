import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function PublishDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.PublishDraftItem({
      Id: params.ItemId,
      ETag: params.ETag,
      CustomTags: { mcp: 'true' }
    }, (error) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
      })
    })
  })
}
