import { PlayFabHandler } from "../../types/index.js";
import { CreateDraftItemParams, CreateDraftItemResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const CreateDraftItem: PlayFabHandler<CreateDraftItemParams, CreateDraftItemResult> = async (params) => {
  // Validate NEUTRAL title is present
  if (!params.Item || !params.Item.Title || !params.Item.Title['NEUTRAL']) {
    throw new Error("Title with NEUTRAL locale is required for creating draft items");
  }
  
  const request = addCustomTags({
    Item: params.Item,
    Publish: params.Publish || false
  });
  
  const result = await callAdminAPI(
    PlayFabEconomyAPI.CreateDraftItem,
    request,
    'CreateDraftItem'
  );
  
  return {
    success: true,
    item: {
      Id: result.Item?.Id || '',
      ETag: result.Item?.ETag
    },
  };
};
