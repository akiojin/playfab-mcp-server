import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function SearchItems(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.SearchItems({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
      } else {
        resolve({
          success: true,
          items: result.data.Items,
          continuationToken: result.data.ContinuationToken
        })
      }
    })
  })
}
