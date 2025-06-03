/**
 * GetTitleData handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetTitleDataParams, GetTitleDataResult } from '../../types/handler-types.js';

export class GetTitleDataHandler extends BaseHandler<GetTitleDataParams, GetTitleDataResult> {
  constructor() {
    super('GetTitleData');
  }
  
  async execute(params: GetTitleDataParams): Promise<HandlerResponse<GetTitleDataResult>> {
    try {
      this.logInfo('Getting title data', { 
        keyCount: params.Keys?.length || 0 
      });
      
      const request = this.addCustomTags({
        Keys: params.Keys
      });
      
      const result = await this.callAdminAPI(
        (this.context.apis.adminAPI as any).GetTitleData,
        request,
        'GetTitleData'
      ) as any;
      
      // Convert null values to empty strings to match the type definition
      const titleData: Record<string, string> = {};
      if (result.Data) {
        Object.entries(result.Data).forEach(([key, value]) => {
          titleData[key] = (value as string) || '';
        });
      }
      
      this.logInfo('Title data retrieved successfully', { 
        dataCount: Object.keys(titleData).length 
      });
      
      return {
        success: true,
        data: titleData
      } as any;
    } catch (error) {
      this.logError('Failed to get title data', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getTitleDataHandler = new GetTitleDataHandler();

// Export handler function for backward compatibility
export const GetTitleData = getTitleDataHandler.toHandler();