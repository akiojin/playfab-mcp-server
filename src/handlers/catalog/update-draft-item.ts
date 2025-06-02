import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function UpdateDraftItem(params: any) {
  const request = addCustomTags({
    Item: {
      Id: params.ItemId,
      ...params.Item
    },
    Publish: params.Publish
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.UpdateDraftItem,
    request,
    'UpdateDraftItem'
  );
  
  return {
    success: true,
    item: result.Item,
  };
}
