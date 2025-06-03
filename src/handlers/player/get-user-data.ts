import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetUserDataParams, GetUserDataResult } from "../../types/handler-types.js";

export const GetUserData: PlayFabHandler<GetUserDataParams, GetUserDataResult> = async (params) => {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId,
    Keys: params.Keys,
    IfChangedFromDataVersion: params.IfChangedFromDataVersion
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.GetUserDataRequest, PlayFabAdminModels.GetUserDataResult>(
    PlayFabAdminAPI.GetUserData,
    request,
    'GetUserData'
  );
  
  const transformedData: Record<string, { Value: string; LastUpdated: string; Permission: string; }> = {};
  if (result.Data) {
    for (const [key, value] of Object.entries(result.Data)) {
      transformedData[key] = {
        Value: value.Value || '',
        LastUpdated: value.LastUpdated || '',
        Permission: value.Permission || 'Private'
      };
    }
  }
  
  return {
    success: true,
    data: transformedData,
    dataVersion: result.DataVersion || 0,
  };
};
