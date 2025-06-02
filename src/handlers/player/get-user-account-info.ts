import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetUserAccountInfo(params: any) {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetUserAccountInfo,
    request,
    'GetUserAccountInfo'
  );
  
  return {
    success: true,
    userInfo: result.UserInfo,
  };
}
