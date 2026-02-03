import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetPlayersInSegmentsParams, GetPlayersInSegmentsResult } from "../../types/handler-types.js";

export const GetPlayersInSegments: PlayFabHandler<GetPlayersInSegmentsParams, GetPlayersInSegmentsResult> = async (params) => {
  const request = addCustomTags({
    SegmentId: params.SegmentId,
    SecondsToLive: params.SecondsToLive,
    MaxBatchSize: params.MaxBatchSize,
    ContinuationToken: params.ContinuationToken
  });
  
  const result = await callAdminAPI<PlayFabAdminModels.GetPlayersInSegmentRequest, PlayFabAdminModels.GetPlayersInSegmentResult>(
    PlayFabAdminAPI.GetPlayersInSegment,
    request,
    'GetPlayersInSegment'
  );
  
  return {
    success: true,
    playerProfiles: result.PlayerProfiles || [],
    continuationToken: result.ContinuationToken,
    profilesInSegment: result.ProfilesInSegment || 0
  };
};
