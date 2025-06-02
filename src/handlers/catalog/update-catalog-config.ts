import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function UpdateCatalogConfig(params: any) {
  const config: any = {
    Config: {
      IsCatalogEnabled: true,
      Catalog: {}
    }
  };
  
  if (params.ContentTypes) {
    config.Config.Catalog.ContentTypes = params.ContentTypes;
  }
  
  if (params.Tags) {
    config.Config.Catalog.Tags = params.Tags;
  }
  
  const request = addCustomTags(config);
  
  await callPlayFabApi(
    PlayFabEconomyAPI.UpdateCatalogConfig,
    request,
    'UpdateCatalogConfig'
  );
  
  return {
    success: true,
  };
}
