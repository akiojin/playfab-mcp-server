import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetItem(params: any) {
  const request = addCustomTags({
    Id: params.ItemId
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.GetItem,
    request,
    'GetItem'
  );
  
  return {
    success: true,
    item: result.Item,
  };
}
