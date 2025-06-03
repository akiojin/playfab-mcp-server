/**
 * GetTitleNews handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetTitleNewsParams, GetTitleNewsResult } from '../../types/handler-types.js';

export class GetTitleNewsHandler extends BaseHandler<GetTitleNewsParams, GetTitleNewsResult> {
  constructor() {
    super('GetTitleNews');
  }
  
  async execute(params: GetTitleNewsParams): Promise<HandlerResponse<GetTitleNewsResult>> {
    try {
      const count = this.validatePaginationCount(params.Count, 'Count', 1, 10);
      
      this.logInfo('Getting title news', { count });
      
      const request = this.addCustomTags({
        Count: count
      });
      
      const result = await this.callAdminAPI(
        (this.context.apis.serverAPI as any).GetTitleNews,
        request,
        'GetTitleNews'
      ) as any;
      
      const news = result.News?.map((item: any) => ({
        NewsId: item.NewsId || '',
        Title: item.Title || '',
        Body: item.Body || '',
        Timestamp: item.Timestamp || ''
      })) || [];
      
      this.logInfo('Title news retrieved successfully', { 
        newsCount: news.length 
      });
      
      return {
        success: true,
        news
      };
    } catch (error) {
      this.logError('Failed to get title news', error);
      throw error;
    }
  }
}

// Export singleton instance
export const getTitleNewsHandler = new GetTitleNewsHandler();

// Export handler function for backward compatibility
export const GetTitleNews = getTitleNewsHandler.toHandler();