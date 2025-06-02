import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function RevokeAllBansForUser(params: any) {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.RevokeAllBansForUser,
    request,
    'RevokeAllBansForUser'
  );
  
  return {
    success: true,
    banData: result.BanData,
  };
}
