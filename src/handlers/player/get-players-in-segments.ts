import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetPlayersInSegments(params: any) {
  const request = addCustomTags(params);
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.GetPlayersInSegment,
    request,
    'GetPlayersInSegment'
  );
  
  return {
    success: true,
    players: result.PlayerProfiles,
    continuationToken: result.ContinuationToken,
    profilesInSegment: result.ProfilesInSegment
  };
}
