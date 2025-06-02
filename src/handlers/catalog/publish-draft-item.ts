import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function PublishDraftItem(params: any) {
  const request = addCustomTags({
    Id: params.ItemId,
    ETag: params.ETag
  });
  
  await callPlayFabApi(
    PlayFabEconomyAPI.PublishDraftItem,
    request,
    'PublishDraftItem'
  );
  
  return {
    success: true,
  };
}
