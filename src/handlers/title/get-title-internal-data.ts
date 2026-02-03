import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetTitleInternalDataParams, GetTitleInternalDataResult } from "../../types/handler-types.js";

export const GetTitleInternalData: PlayFabHandler<GetTitleInternalDataParams, GetTitleInternalDataResult> = async (params) => {
  const request = addCustomTags({
    Keys: params.Keys
  });
  
  const result = await callAdminAPI(
    PlayFabAdminAPI.GetTitleInternalData,
    request,
    'GetTitleInternalData'
  );
  
  // Convert null values to empty strings to match the type definition
  const data: Record<string, string> = {};
  if (result.Data) {
    Object.entries(result.Data).forEach(([key, value]) => {
      data[key] = value || '';
    });
  }
  
  return {
    success: true,
    data
  };
};
