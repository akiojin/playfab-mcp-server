import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function BanUsers(params: any) {
  // Validate confirmation
  if (!params.ConfirmBan || params.ConfirmBan !== true) {
    throw new Error("Ban confirmation required. Set ConfirmBan to true to proceed with this operation.");
  }
  
  // Validate all bans have reasons
  if (!params.Bans || !params.Bans.every((ban: any) => ban.Reason && ban.Reason.trim() !== '')) {
    throw new Error("All bans must include a reason for audit trail purposes.");
  }
  
  const request = addCustomTags({
    Bans: params.Bans
  });
  
  const result = await callPlayFabApi(
    PlayFabAdminAPI.BanUsers,
    request,
    'BanUsers'
  );
  
  return {
    success: true,
    banData: result.BanData,
    message: `Successfully banned ${params.Bans.length} user(s).`
  };
}
