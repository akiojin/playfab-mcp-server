import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetInventoryItems(params: any) {
  const request = addCustomTags({
    Count: params.Count,
    CollectionId: params.CollectionId,
    ContinuationToken: params.ContinuationToken,
    Entity: {
      Id: params.TitlePlayerAccountId,
      Type: "title_player_account"
    }
  });
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.GetInventoryItems,
    request,
    'GetInventoryItems'
  );
  
  return {
    success: true,
    inventory: result.Items,
    continuationToken: result.ContinuationToken,
  };
}
