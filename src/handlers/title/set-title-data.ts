import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { SetTitleDataParams, SetTitleDataResult } from "../../types/handler-types.js";

export const SetTitleData: PlayFabHandler<SetTitleDataParams, SetTitleDataResult> = async (params) => {
  // Convert Record<string, string> to TitleDataKeyValue[]
  const keyValues = Object.entries(params.KeysAndValues).map(([key, value]) => ({
    Key: key,
    Value: value
  }));
  
  const request = addCustomTags({
    KeyValues: keyValues
  });
  
  await callPlayFabApi(
    PlayFabAdminAPI.SetTitleDataAndOverrides,
    request,
    'SetTitleData'
  );
  
  return {
    success: true,
    message: 'Title data updated successfully',
  };
};
