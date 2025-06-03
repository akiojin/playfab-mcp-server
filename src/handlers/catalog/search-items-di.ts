/**
 * SearchItems handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { SearchItemsParams } from '../../types/tool-params.js';

interface SearchItemsResult {
  items: any[];
  continuationToken?: string;
}

interface SearchItemsValidatedParams extends Record<string, unknown> {
  Count: number;
  ContinuationToken?: string;
  Filter?: string;
  OrderBy?: string;
  Search?: string;
}

export class SearchItemsHandler extends BaseHandler<SearchItemsParams, SearchItemsResult> {
  constructor() {
    super('SearchItems');
  }
  
  async execute(params: SearchItemsParams): Promise<HandlerResponse<SearchItemsResult>> {
    try {
      this.logInfo('Searching catalog items', { params });
      
      // Validate input parameters
      const validatedParams: SearchItemsValidatedParams = {
        Count: this.validatePaginationCount(params.Count, 'Count', 10, 50),
      };
      
      // Optional parameters
      const continuationToken = this.validateString(params.ContinuationToken, 'ContinuationToken');
      if (continuationToken) validatedParams.ContinuationToken = continuationToken;
      
      const filter = this.validateString(params.Filter, 'Filter', { maxLength: 2048 });
      if (filter) validatedParams.Filter = filter;
      
      const orderBy = this.validateString(params.OrderBy, 'OrderBy', { maxLength: 2048 });
      if (orderBy) validatedParams.OrderBy = orderBy;
      
      const search = this.validateString(params.Search, 'Search', { maxLength: 2048 });
      if (search) validatedParams.Search = search;
      
      // Make API call with validated parameters
      const request = this.addCustomTags(validatedParams);
      const result = await this.callAdminAPI<any, any>(
        (this.context.apis.economyAPI as any).SearchItems,
        request,
        'SearchItems'
      );
      
      this.logInfo('Search completed', { 
        itemCount: (result as any).Items?.length || 0,
        hasContinuationToken: !!(result as any).ContinuationToken
      });
      
      return {
        success: true,
        items: (result as any).Items || [],
        continuationToken: (result as any).ContinuationToken
      };
    } catch (error) {
      this.logError('Failed to search catalog items', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const searchItemsHandler = new SearchItemsHandler();

// Export the handler function for backward compatibility
export const SearchItems = searchItemsHandler.toHandler();