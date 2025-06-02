import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetUserData(params: any) {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId,
    Keys: params.Keys
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetUserData,
    request,
    'GetUserData'
  );
  
  return {
    success: true,
    data: result.Data,
    dataVersion: result.DataVersion,
  };
}
