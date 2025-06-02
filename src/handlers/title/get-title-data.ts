import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetTitleData(params: any) {
  const request = addCustomTags({
    Keys: params.Keys
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetTitleData,
    request,
    'GetTitleData'
  );
  
  return {
    success: true,
    data: result.Data,
  };
}
