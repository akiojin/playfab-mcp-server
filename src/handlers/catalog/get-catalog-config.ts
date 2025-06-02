import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetCatalogConfig() {
  const request = addCustomTags({});
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.GetCatalogConfig,
    request,
    'GetCatalogConfig'
  );
  
  return {
    success: true,
    config: result.Config,
  };
}