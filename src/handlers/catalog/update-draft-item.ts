import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function UpdateDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.UpdateDraftItem({
      Item: {
        Id: params.ItemId,
        ...params.Item
      },
      Publish: params.Publish,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        item: result.data.Item,
      })
    })
  })
}
