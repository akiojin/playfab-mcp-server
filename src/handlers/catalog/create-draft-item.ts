import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function CreateDraftItem(params: any) {
  // Validate NEUTRAL title is present
  if (!params.Item || !params.Item.Title || !params.Item.Title.NEUTRAL) {
    throw new Error("Title with NEUTRAL locale is required for creating draft items");
  }
  
  const request = addCustomTags({
    Item: params.Item,
    Publish: params.Publish
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.CreateDraftItem,
    request,
    'CreateDraftItem'
  );
  
  return {
    success: true,
    item: result.Item,
  };
}
