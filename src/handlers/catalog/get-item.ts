import { PlayFabHandler } from "../../types/index.js";
import { GetItemParams, GetItemResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const GetItem: PlayFabHandler<GetItemParams, GetItemResult> = async (params) => {
  const request = addCustomTags({
    Id: params.ItemId
  });
  
  const result = await callAdminAPI(
    PlayFabEconomyAPI.GetItem,
    request,
    'GetItem'
  );
  
  return {
    success: true,
    item: result.Item || {},
  };
};
