/**
 * GetPlayersInSegments handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetPlayersInSegmentsParams, GetPlayersInSegmentsResult } from '../../types/handler-types.js';

export class GetPlayersInSegmentsHandler extends BaseHandler<GetPlayersInSegmentsParams, GetPlayersInSegmentsResult> {
  constructor() {
    super('GetPlayersInSegments');
  }
  
  async execute(params: GetPlayersInSegmentsParams): Promise<HandlerResponse<GetPlayersInSegmentsResult>> {
    try {
      this.logInfo('Getting players in segment', { 
        segmentId: params.SegmentId,
        maxBatchSize: params.MaxBatchSize,
        hasContinuationToken: !!params.ContinuationToken
      });
      
      // Build request object
      const request = this.addCustomTags({
        SegmentId: params.SegmentId,
        SecondsToLive: params.SecondsToLive,
        MaxBatchSize: params.MaxBatchSize,
        ContinuationToken: params.ContinuationToken
      });
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.GetPlayersInSegmentRequest, PlayFabAdminModels.GetPlayersInSegmentResult>(
        (this.context.apis.adminAPI as any).GetPlayersInSegment,
        request,
        'GetPlayersInSegment'
      );
      
      this.logInfo('Players in segment retrieved', { 
        segmentId: params.SegmentId,
        profileCount: result.PlayerProfiles?.length || 0,
        totalProfiles: result.ProfilesInSegment || 0,
        hasContinuationToken: !!result.ContinuationToken
      });
      
      return {
        success: true,
        playerProfiles: result.PlayerProfiles || [],
        continuationToken: result.ContinuationToken,
        profilesInSegment: result.ProfilesInSegment || 0
      };
    } catch (error) {
      this.logError('Failed to get players in segment', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getPlayersInSegmentsHandler = new GetPlayersInSegmentsHandler();

// Export the handler function for backward compatibility
export const GetPlayersInSegments = getPlayersInSegmentsHandler.toHandler();