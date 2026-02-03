import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { RevokeAllBansForUserParams, RevokeAllBansForUserResult } from "../../types/handler-types.js";

export const RevokeAllBansForUser: PlayFabHandler<RevokeAllBansForUserParams, RevokeAllBansForUserResult> = async (params) => {
  const request = addCustomTags({
    PlayFabId: params.PlayFabId
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.RevokeAllBansForUserRequest, PlayFabAdminModels.RevokeAllBansForUserResult>(
    PlayFabAdminAPI.RevokeAllBansForUser,
    request,
    'RevokeAllBansForUser'
  );
  
  const transformedBanData: Array<{
    BanId: string;
    PlayFabId: string;
    Created: string;
    Expires?: string;
    IPAddress?: string;
    MACAddress?: string;
    Reason?: string;
    Active: boolean;
  }> = (result.BanData || []).map(ban => ({
    BanId: ban.BanId || '',
    PlayFabId: ban.PlayFabId || '',
    Created: ban.Created || '',
    Expires: ban.Expires,
    IPAddress: ban.IPAddress,
    MACAddress: (ban as any).MACAddress,
    Reason: ban.Reason,
    Active: ban.Active || false
  }));
  
  return {
    success: true,
    banData: transformedBanData,
  };
};
