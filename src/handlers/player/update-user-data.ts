import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function UpdateUserData(params: any) {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId,
    Data: params.Data,
    Permission: params.Permission || "Private"
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.UpdateUserData,
    request,
    'UpdateUserData'
  );
  
  return {
    success: true,
    dataVersion: result.DataVersion,
  };
}
