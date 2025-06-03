/**
 * GetTitlePlayerAccountIds handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { GetTitlePlayerAccountIdsParams, GetTitlePlayerAccountIdsResult } from '../../types/handler-types.js';
import { PlayFab } from '../../config/playfab.js';

interface ExtendedGetTitlePlayerAccountIdsParams {
  PlayFabIds: string | string[];
}

interface GetTitlePlayerAccountIdsResponse {
  success: boolean;
  mappings: Array<{
    playFabId: string;
    titlePlayerAccountId: string;
    entityType: string;
  }>;
  notFound: string[];
  totalRequested: number;
  totalFound: number;
}

export class GetTitlePlayerAccountIdsHandler extends BaseHandler<ExtendedGetTitlePlayerAccountIdsParams, GetTitlePlayerAccountIdsResponse> {
  constructor() {
    super('GetTitlePlayerAccountIds');
  }
  
  async execute(params: ExtendedGetTitlePlayerAccountIdsParams): Promise<HandlerResponse<GetTitlePlayerAccountIdsResponse>> {
    try {
      // Normalize input to array
      const playFabIds = Array.isArray(params.PlayFabIds) 
        ? params.PlayFabIds 
        : [params.PlayFabIds];
      
      if (playFabIds.length === 0) {
        throw new Error("No PlayFabIds provided");
      }
      
      this.logInfo('Getting title player account IDs', { 
        requestedCount: playFabIds.length
      });
      
      // Build request object
      const request = this.addCustomTags({
        TitleId: PlayFab.settings.titleId,
        MasterPlayerAccountIds: playFabIds
      });
      
      // Make API call using the profile API (not admin API)
      const result = await this.context.utils.wrapper.callPlayFabApi<any, any>(
        (this.context.apis.profileAPI as any).GetTitlePlayersFromMasterPlayerAccountIds,
        request,
        'GetTitlePlayersFromMasterPlayerAccountIds'
      );
      
      const accounts = result.TitlePlayerAccounts || {};
      const mappings = [];
      const notFound = [];
      
      for (const playFabId of playFabIds) {
        const account = accounts[playFabId];
        if (account && account.Id) {
          mappings.push({
            playFabId: playFabId,
            titlePlayerAccountId: account.Id,
            entityType: account.Type || 'title_player_account'
          });
        } else {
          notFound.push(playFabId);
        }
      }
      
      this.logInfo('Title player account IDs retrieved', { 
        totalRequested: playFabIds.length,
        totalFound: mappings.length,
        notFoundCount: notFound.length
      });
      
      return {
        success: true,
        mappings: mappings,
        notFound: notFound,
        totalRequested: playFabIds.length,
        totalFound: mappings.length
      };
    } catch (error) {
      this.logError('Failed to get title player account IDs', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const getTitlePlayerAccountIdsHandler = new GetTitlePlayerAccountIdsHandler();

// Export the handler function for backward compatibility
export const GetTitlePlayerAccountIds = getTitlePlayerAccountIdsHandler.toHandler();