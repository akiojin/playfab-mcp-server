import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function GetItem(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetItem({
      Id: params.ItemId,
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
