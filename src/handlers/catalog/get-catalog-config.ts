import { PlayFabHandler } from "../../types/index.js";
import { GetCatalogConfigParams, GetCatalogConfigResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const GetCatalogConfig: PlayFabHandler<GetCatalogConfigParams, GetCatalogConfigResult> = async () => {
  const request = addCustomTags({});
  
  const result = await callAdminAPI(
    PlayFabEconomyAPI.GetCatalogConfig,
    request,
    'GetCatalogConfig'
  );
  
  return {
    success: true,
    config: result.Config || {},
  };
};