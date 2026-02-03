import { PlayFabHandler } from "../../types/index.js";
import { UpdateCatalogConfigParams, UpdateCatalogConfigResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const UpdateCatalogConfig: PlayFabHandler<UpdateCatalogConfigParams, UpdateCatalogConfigResult> = async (params) => {
  const config = {
    Config: {
      IsCatalogEnabled: true,
      Catalog: {} as {
        ContentTypes?: string[];
        Tags?: string[];
      }
    }
  };
  
  if (params.ContentTypes) {
    config.Config.Catalog.ContentTypes = params.ContentTypes;
  }
  
  if (params.Tags) {
    config.Config.Catalog.Tags = params.Tags;
  }
  
  const request = addCustomTags(config);
  
  await callAdminAPI(
    PlayFabEconomyAPI.UpdateCatalogConfig,
    request,
    'UpdateCatalogConfig'
  );
  
  return {
    success: true,
    message: 'Catalog config updated successfully'
  };
};
