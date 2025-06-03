/**
 * BanUsers handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { BanUsersParams, BanUsersResult } from '../../types/handler-types.js';

interface ExtendedBanUsersParams extends BanUsersParams {
  ConfirmBan?: boolean;
}

export class BanUsersHandler extends BaseHandler<ExtendedBanUsersParams, BanUsersResult & { message: string }> {
  constructor() {
    super('BanUsers');
  }
  
  async execute(params: ExtendedBanUsersParams): Promise<HandlerResponse<BanUsersResult & { message: string }>> {
    try {
      // Validate confirmation
      if (!params.ConfirmBan || params.ConfirmBan !== true) {
        throw new Error("Ban confirmation required. Set ConfirmBan to true to proceed with this operation.");
      }
      
      // Validate all bans have reasons
      if (!params.Bans || !params.Bans.every((ban) => ban.Reason && ban.Reason.trim() !== '')) {
        throw new Error("All bans must include a reason for audit trail purposes.");
      }
      
      this.logInfo('Banning users', { 
        userCount: params.Bans.length,
        playFabIds: params.Bans.map(b => b.PlayFabId)
      });
      
      // Build request object
      const request = this.addCustomTags({
        Bans: params.Bans
      });
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.BanUsersRequest, PlayFabAdminModels.BanUsersResult>(
        (this.context.apis.adminAPI as any).BanUsers,
        request,
        'BanUsers'
      );
      
      const transformedBanData: Array<{ PlayFabId: string; BanId?: string }> = (result.BanData || []).map(ban => ({
        PlayFabId: ban.PlayFabId || '',
        BanId: ban.BanId
      }));
      
      this.logInfo('Users banned successfully', { 
        bannedCount: transformedBanData.length,
        banIds: transformedBanData.map(b => b.BanId).filter(Boolean)
      });
      
      return {
        success: true,
        banData: transformedBanData,
        message: `Successfully banned ${params.Bans.length} user(s).`
      };
    } catch (error) {
      this.logError('Failed to ban users', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const banUsersHandler = new BanUsersHandler();

// Export the handler function for backward compatibility
export const BanUsers = banUsersHandler.toHandler();