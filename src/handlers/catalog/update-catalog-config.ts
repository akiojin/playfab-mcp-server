import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function UpdateCatalogConfig(params: any) {
  return new Promise((resolve, reject) => {
    const config: any = {
      Config: {
        IsCatalogEnabled: true,
        Catalog: {}
      }
    }
    
    if (params.ContentTypes) {
      config.Config.Catalog.ContentTypes = params.ContentTypes
    }
    
    if (params.Tags) {
      config.Config.Catalog.Tags = params.Tags
    }
    
    PlayFabEconomyAPI.UpdateCatalogConfig({
      ...config,
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
