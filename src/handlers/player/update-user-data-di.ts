/**
 * UpdateUserData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { UpdateUserDataParams, UpdateUserDataResult } from '../../types/handler-types.js';

export class UpdateUserDataHandler extends BaseHandler<UpdateUserDataParams, UpdateUserDataResult> {
  constructor() {
    super('UpdateUserData');
  }
  
  async execute(params: UpdateUserDataParams): Promise<HandlerResponse<UpdateUserDataResult>> {
    try {
      this.logInfo('Updating user data', { 
        playFabId: params.PlayFabId,
        dataKeys: params.Data ? Object.keys(params.Data).length : 0,
        keysToRemove: params.KeysToRemove?.length || 0,
        permission: params.Permission || "Private"
      });
      
      // Build request object
      const request = this.addCustomTags({
        PlayFabId: params.PlayFabId,
        Data: params.Data,
        KeysToRemove: params.KeysToRemove,
        Permission: params.Permission || "Private"
      });
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.UpdateUserDataRequest, PlayFabAdminModels.UpdateUserDataResult>(
        (this.context.apis.adminAPI as any).UpdateUserData,
        request,
        'UpdateUserData'
      );
      
      this.logInfo('User data updated', { 
        playFabId: params.PlayFabId,
        dataVersion: result.DataVersion || 0
      });
      
      return {
        success: true,
        dataVersion: result.DataVersion || 0,
      };
    } catch (error) {
      this.logError('Failed to update user data', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const updateUserDataHandler = new UpdateUserDataHandler();

// Export the handler function for backward compatibility
export const UpdateUserData = updateUserDataHandler.toHandler();