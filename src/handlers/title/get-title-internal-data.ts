import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetTitleInternalData(params: any) {
  const request = addCustomTags({
    Keys: params.Keys
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetTitleInternalData,
    request,
    'GetTitleInternalData'
  );
  
  return {
    success: true,
    data: result.Data,
  };
}
