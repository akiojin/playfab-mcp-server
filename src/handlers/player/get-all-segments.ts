import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetAllSegmentsParams, GetAllSegmentsResult } from "../../types/handler-types.js";

export const GetAllSegments: PlayFabHandler<GetAllSegmentsParams, GetAllSegmentsResult> = async (_params) => {
  const request = addCustomTags({});
  
  const result = await callAdminAPI<PlayFabAdminModels.GetAllSegmentsRequest, PlayFabAdminModels.GetAllSegmentsResult>(
    PlayFabAdminAPI.GetAllSegments,
    request,
    'GetAllSegments'
  );
  
  const transformedSegments: Array<{ Id: string; Name: string; Description?: string }> = (result.Segments || []).map(segment => ({
    Id: segment.Id || '',
    Name: segment.Name || '',
    Description: (segment as any).Description
  }));
  
  return {
    success: true,
    segments: transformedSegments
  };
};