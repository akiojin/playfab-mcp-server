import { PlayFabHandler } from "../../types/index.js";
import { PublishDraftItemParams, PublishDraftItemResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const PublishDraftItem: PlayFabHandler<PublishDraftItemParams, PublishDraftItemResult> = async (params) => {
  const request = addCustomTags({
    Id: params.ItemId,
    ETag: params.ETag
  });
  
  await callAdminAPI(
    PlayFabEconomyAPI.PublishDraftItem,
    request,
    'PublishDraftItem'
  );
  
  return {
    success: true,
  };
};
