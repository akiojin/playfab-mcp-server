import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetInventoryCollectionIds(params: any) {
  const request = addCustomTags(params);
  
  const result = await callPlayFabApi(
    PlayFabEconomyAPI.GetInventoryCollectionIds,
    request,
    'GetInventoryCollectionIds'
  );
  
  return {
    success: true,
    collectionIds: result.CollectionIds,
    continuationToken: result.ContinuationToken,
  };
}
