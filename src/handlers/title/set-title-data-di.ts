/**
 * SetTitleData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { SetTitleDataParams, SetTitleDataResult } from '../../types/handler-types.js';

export class SetTitleDataHandler extends BaseHandler<SetTitleDataParams, SetTitleDataResult> {
  constructor() {
    super('SetTitleData');
  }
  
  async execute(params: SetTitleDataParams): Promise<HandlerResponse<SetTitleDataResult>> {
    try {
      // Validate required fields
      if (!params.KeysAndValues || typeof params.KeysAndValues !== 'object') {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'KeysAndValues is required and must be an object'
        );
      }
      
      const keyCount = Object.keys(params.KeysAndValues).length;
      if (keyCount === 0) {
        return this.createErrorResponse(
          'VALIDATION_ERROR',
          'At least one key-value pair is required'
        );
      }
      
      this.logInfo('Setting title data', { keyCount });
      
      // Convert Record<string, string> to TitleDataKeyValue[]
      const keyValues = Object.entries(params.KeysAndValues).map(([key, value]) => ({
        Key: key,
        Value: value
      }));
      
      const request = this.addCustomTags({
        KeyValues: keyValues
      });
      
      await this.callAdminAPI(
        (this.context.apis.adminAPI as any).SetTitleDataAndOverrides,
        request,
        'SetTitleData'
      );
      
      this.logInfo('Title data updated successfully', { keyCount });
      
      return {
        success: true,
        message: 'Title data updated successfully',
      };
    } catch (error) {
      this.logError('Failed to set title data', error);
      throw error;
    }
  }
}

// Export singleton instance
export const setTitleDataHandler = new SetTitleDataHandler();

// Export handler function for backward compatibility
export const SetTitleData = setTitleDataHandler.toHandler();