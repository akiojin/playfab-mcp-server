import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { BanUsersParams, BanUsersResult } from "../../types/handler-types.js";

interface ExtendedBanUsersParams extends BanUsersParams {
  ConfirmBan?: boolean;
}

export const BanUsers: PlayFabHandler<ExtendedBanUsersParams, BanUsersResult & { message: string }> = async (params) => {
  // Validate confirmation
  if (!params.ConfirmBan || params.ConfirmBan !== true) {
    throw new Error("Ban confirmation required. Set ConfirmBan to true to proceed with this operation.");
  }
  
  // Validate all bans have reasons
  if (!params.Bans || !params.Bans.every((ban) => ban.Reason && ban.Reason.trim() !== '')) {
    throw new Error("All bans must include a reason for audit trail purposes.");
  }
  
  const request = addCustomTags({
    Bans: params.Bans
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.BanUsersRequest, PlayFabAdminModels.BanUsersResult>(
    PlayFabAdminAPI.BanUsers,
    request,
    'BanUsers'
  );
  
  const transformedBanData: Array<{ PlayFabId: string; BanId?: string }> = (result.BanData || []).map(ban => ({
    PlayFabId: ban.PlayFabId || '',
    BanId: ban.BanId
  }));
  
  return {
    success: true,
    banData: transformedBanData,
    message: `Successfully banned ${params.Bans.length} user(s).`
  };
};
