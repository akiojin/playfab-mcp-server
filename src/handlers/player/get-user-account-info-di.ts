/**
 * GetUserAccountInfo handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetUserAccountInfoParams, GetUserAccountInfoResult } from '../../types/handler-types.js';

export class GetUserAccountInfoHandler extends BaseHandler<GetUserAccountInfoParams, GetUserAccountInfoResult> {
  constructor() {
    super('GetUserAccountInfo');
  }
  
  async execute(params: GetUserAccountInfoParams): Promise<HandlerResponse<GetUserAccountInfoResult>> {
    try {
      this.logInfo('Getting user account info', { 
        playFabId: params.PlayFabId,
        username: params.Username,
        email: params.Email,
        titleDisplayName: params.TitleDisplayName
      });
      
      // Build request object
      const request = this.addCustomTags({
        PlayFabId: params.PlayFabId,
        Username: params.Username,
        Email: params.Email,
        TitleDisplayName: params.TitleDisplayName
      });
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.LookupUserAccountInfoRequest, PlayFabAdminModels.LookupUserAccountInfoResult>(
        (this.context.apis.adminAPI as any).GetUserAccountInfo,
        request,
        'GetUserAccountInfo'
      );
      
      this.logInfo('User account info retrieved', { 
        hasUserInfo: !!result.UserInfo,
        playFabId: result.UserInfo?.PlayFabId
      });
      
      return {
        success: true,
        userInfo: result.UserInfo || {} as any,
      };
    } catch (error) {
      this.logError('Failed to get user account info', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getUserAccountInfoHandler = new GetUserAccountInfoHandler();

// Export the handler function for backward compatibility
export const GetUserAccountInfo = getUserAccountInfoHandler.toHandler();