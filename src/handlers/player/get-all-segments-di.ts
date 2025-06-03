/**
 * GetAllSegments handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetAllSegmentsParams, GetAllSegmentsResult } from '../../types/handler-types.js';

export class GetAllSegmentsHandler extends BaseHandler<GetAllSegmentsParams, GetAllSegmentsResult> {
  constructor() {
    super('GetAllSegments');
  }
  
  async execute(_params: GetAllSegmentsParams): Promise<HandlerResponse<GetAllSegmentsResult>> {
    try {
      this.logInfo('Getting all segments');
      
      // Build request object
      const request = this.addCustomTags({});
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.GetAllSegmentsRequest, PlayFabAdminModels.GetAllSegmentsResult>(
        (this.context.apis.adminAPI as any).GetAllSegments,
        request,
        'GetAllSegments'
      );
      
      const transformedSegments: Array<{ Id: string; Name: string; Description?: string }> = (result.Segments || []).map(segment => ({
        Id: segment.Id || '',
        Name: segment.Name || '',
        Description: (segment as any).Description
      }));
      
      this.logInfo('Segments retrieved', { 
        segmentCount: transformedSegments.length
      });
      
      return {
        success: true,
        segments: transformedSegments
      };
    } catch (error) {
      this.logError('Failed to get all segments', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getAllSegmentsHandler = new GetAllSegmentsHandler();

// Export the handler function for backward compatibility
export const GetAllSegments = getAllSegmentsHandler.toHandler();