import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function SetTitleData(params: any) {
  const request = addCustomTags({
    Key: params.Key,
    Value: params.Value
  });
  
  await callPlayFabApi(
    PlayFabAdminAPI.SetTitleData,
    request,
    'SetTitleData'
  );
  
  return {
    success: true,
  };
}
