import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { UpdateUserDataParams, UpdateUserDataResult } from "../../types/handler-types.js";

export const UpdateUserData: PlayFabHandler<UpdateUserDataParams, UpdateUserDataResult> = async (params) => {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId,
    Data: params.Data,
    KeysToRemove: params.KeysToRemove,
    Permission: params.Permission || "Private"
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.UpdateUserDataRequest, PlayFabAdminModels.UpdateUserDataResult>(
    PlayFabAdminAPI.UpdateUserData,
    request,
    'UpdateUserData'
  );
  
  return {
    success: true,
    dataVersion: result.DataVersion || 0,
  };
};
