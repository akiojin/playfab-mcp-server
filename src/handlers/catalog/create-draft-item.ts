import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function CreateDraftItem(params: any) {
  return new Promise((resolve, reject) => {
    // Validate NEUTRAL title is present
    if (!params.Item || !params.Item.Title || !params.Item.Title.NEUTRAL) {
      reject("Error: Title with NEUTRAL locale is required for creating draft items")
      return
    }
    
    PlayFabEconomyAPI.CreateDraftItem({
      Item: params.Item,
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
