/**
 * GetTitleInternalData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetTitleInternalDataParams, GetTitleInternalDataResult } from '../../types/handler-types.js';

export class GetTitleInternalDataHandler extends BaseHandler<GetTitleInternalDataParams, GetTitleInternalDataResult> {
  constructor() {
    super('GetTitleInternalData');
  }
  
  async execute(params: GetTitleInternalDataParams): Promise<HandlerResponse<GetTitleInternalDataResult>> {
    try {
      this.logInfo('Getting title internal data', { 
        keyCount: params.Keys?.length || 0 
      });
      
      const request = this.addCustomTags({
        Keys: params.Keys
      });
      
      const result = await this.callAdminAPI(
        (this.context.apis.adminAPI as any).GetTitleInternalData,
        request,
        'GetTitleInternalData'
      ) as any;
      
      // Convert null values to empty strings to match the type definition
      const internalData: Record<string, string> = {};
      if (result.Data) {
        Object.entries(result.Data).forEach(([key, value]) => {
          internalData[key] = (value as string) || '';
        });
      }
      
      this.logInfo('Title internal data retrieved successfully', { 
        dataCount: Object.keys(internalData).length 
      });
      
      return {
        success: true,
        data: internalData
      } as any;
    } catch (error) {
      this.logError('Failed to get title internal data', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getTitleInternalDataHandler = new GetTitleInternalDataHandler();

// Export handler function for backward compatibility
export const GetTitleInternalData = getTitleInternalDataHandler.toHandler();