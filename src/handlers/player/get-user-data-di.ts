/**
 * GetUserData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetUserDataParams, GetUserDataResult } from '../../types/handler-types.js';

export class GetUserDataHandler extends BaseHandler<GetUserDataParams, GetUserDataResult> {
  constructor() {
    super('GetUserData');
  }
  
  async execute(params: GetUserDataParams): Promise<HandlerResponse<GetUserDataResult>> {
    try {
      this.logInfo('Getting user data', { playFabId: params.PlayFabId });
      
      // Build request object
      const request = this.addCustomTags({
        PlayFabId: params.PlayFabId,
        Keys: params.Keys
      });
      
      // Make API call
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.adminAPI as any).GetUserData,
        request,
        'GetUserData'
      );
      
      this.logInfo('User data retrieved', { 
        playFabId: params.PlayFabId,
        dataKeys: Object.keys(result.Data || {}).length
      });
      
      return {
        success: true,
        PlayFabId: result.PlayFabId || params.PlayFabId,
        Data: result.Data || {},
        DataVersion: result.DataVersion || 0
      };
    } catch (error) {
      this.logError('Failed to get user data', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getUserDataHandler = new GetUserDataHandler();

// Export the handler function for backward compatibility
export const GetUserData = getUserDataHandler.toHandler();