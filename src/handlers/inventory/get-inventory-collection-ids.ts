import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function GetInventoryCollectionIds(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetInventoryCollectionIds({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        collectionIds: result.data.CollectionIds,
        continuationToken: result.data.ContinuationToken,
      })
    })
  })
}
