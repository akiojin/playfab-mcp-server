import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function GetCatalogConfig() {
  return new Promise((resolve, reject) => {
    PlayFabEconomyAPI.GetCatalogConfig({
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        config: result.data.Config,
      })
    })
  })
}