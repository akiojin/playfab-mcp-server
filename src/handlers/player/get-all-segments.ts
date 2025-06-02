import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetAllSegments() {
  const request = addCustomTags({});
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetAllSegments,
    request,
    'GetAllSegments'
  );
  
  return {
    success: true,
    segments: result.Segments || []
  };
}