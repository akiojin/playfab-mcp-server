import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetUserAccountInfoParams, GetUserAccountInfoResult } from "../../types/handler-types.js";

export const GetUserAccountInfo: PlayFabHandler<GetUserAccountInfoParams, GetUserAccountInfoResult> = async (params) => {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId,
    Username: params.Username,
    Email: params.Email,
    TitleDisplayName: params.TitleDisplayName
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.LookupUserAccountInfoRequest, PlayFabAdminModels.LookupUserAccountInfoResult>(
    PlayFabAdminAPI.GetUserAccountInfo,
    request,
    'GetUserAccountInfo'
  );
  
  return {
    success: true,
    userInfo: result.UserInfo || {} as any,
  };
};
