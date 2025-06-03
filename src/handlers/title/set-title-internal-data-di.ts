/**
 * SetTitleInternalData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { SetTitleInternalDataParams, SetTitleInternalDataResult } from '../../types/handler-types.js';

export class SetTitleInternalDataHandler extends BaseHandler<SetTitleInternalDataParams, SetTitleInternalDataResult> {
  constructor() {
    super('SetTitleInternalData');
  }
  
  async execute(params: SetTitleInternalDataParams): Promise<HandlerResponse<SetTitleInternalDataResult>> {
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
      
      this.logInfo('Setting title internal data', { keyCount });
      
      // SetTitleInternalData uses single Key/Value pair, not KeyValues array
      // Process each key-value pair individually
      const results = await Promise.all(
        Object.entries(params.KeysAndValues).map(async ([key, value]) => {
          const request = this.addCustomTags({
            Key: key,
            Value: value
          });
          
          return this.callAdminAPI(
            (this.context.apis.adminAPI as any).SetTitleInternalData,
            request,
            'SetTitleInternalData'
          );
        })
      );
      
      this.logInfo('Title internal data updated successfully', { 
        keyCount,
        updatedKeys: Object.keys(params.KeysAndValues) 
      });
      
      return {
        success: true,
        message: 'Title internal data updated successfully',
      };
    } catch (error) {
      this.logError('Failed to set title internal data', error);
      throw error;
    }
  }
}

// Export singleton instance
export const setTitleInternalDataHandler = new SetTitleInternalDataHandler();

// Export handler function for backward compatibility
export const SetTitleInternalData = setTitleInternalDataHandler.toHandler();