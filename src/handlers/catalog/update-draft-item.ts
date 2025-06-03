import { PlayFabHandler } from "../../types/index.js";
import { UpdateDraftItemParams, UpdateDraftItemResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const UpdateDraftItem: PlayFabHandler<UpdateDraftItemParams, UpdateDraftItemResult> = async (params) => {
  const request = addCustomTags({
    Item: {
      Id: params.ItemId,
      ...params.Item
    },
    Publish: params.Publish || false
  });
  
  const result = await callAdminAPI(
    PlayFabEconomyAPI.UpdateDraftItem,
    request,
    'UpdateDraftItem'
  );
  
  return {
    success: true,
    item: {
      Id: result.Item?.Id || '',
      ETag: result.Item?.ETag
    },
  };
};
