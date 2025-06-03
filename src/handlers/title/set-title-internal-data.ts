import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { SetTitleInternalDataParams, SetTitleInternalDataResult } from "../../types/handler-types.js";

export const SetTitleInternalData: PlayFabHandler<SetTitleInternalDataParams, SetTitleInternalDataResult> = async (params) => {
  // SetTitleInternalData uses single Key/Value pair, not KeyValues array
  // Process each key-value pair individually
  const results = await Promise.all(
    Object.entries(params.KeysAndValues).map(async ([key, value]) => {
      const request = addCustomTags({
        Key: key,
        Value: value
      });
      
      return callPlayFabApi(
        PlayFabAdminAPI.SetTitleInternalData,
        request,
        'SetTitleInternalData'
      );
    })
  );
  
  return {
    success: true,
    message: 'Title internal data updated successfully',
  };
};
