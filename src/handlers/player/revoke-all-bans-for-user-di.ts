/**
 * RevokeAllBansForUser handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { RevokeAllBansForUserParams, RevokeAllBansForUserResult } from '../../types/handler-types.js';

export class RevokeAllBansForUserHandler extends BaseHandler<RevokeAllBansForUserParams, RevokeAllBansForUserResult> {
  constructor() {
    super('RevokeAllBansForUser');
  }
  
  async execute(params: RevokeAllBansForUserParams): Promise<HandlerResponse<RevokeAllBansForUserResult>> {
    try {
      this.logInfo('Revoking all bans for user', { 
        playFabId: params.PlayFabId
      });
      
      // Build request object
      const request = this.addCustomTags({
        PlayFabId: params.PlayFabId
      });
      
      // Make API call
      const result = await this.callAdminAPI<PlayFabAdminModels.RevokeAllBansForUserRequest, PlayFabAdminModels.RevokeAllBansForUserResult>(
        (this.context.apis.adminAPI as any).RevokeAllBansForUser,
        request,
        'RevokeAllBansForUser'
      );
      
      const transformedBanData: Array<{
        BanId: string;
        PlayFabId: string;
        Created: string;
        Expires?: string;
        IPAddress?: string;
        MACAddress?: string;
        Reason?: string;
        Active: boolean;
      }> = (result.BanData || []).map(ban => ({
        BanId: ban.BanId || '',
        PlayFabId: ban.PlayFabId || '',
        Created: ban.Created || '',
        Expires: ban.Expires,
        IPAddress: ban.IPAddress,
        MACAddress: (ban as any).MACAddress,
        Reason: ban.Reason,
        Active: ban.Active || false
      }));
      
      this.logInfo('All bans revoked for user', { 
        playFabId: params.PlayFabId,
        revokedBansCount: transformedBanData.length
      });
      
      return {
        success: true,
        banData: transformedBanData,
      };
    } catch (error) {
      this.logError('Failed to revoke all bans for user', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const revokeAllBansForUserHandler = new RevokeAllBansForUserHandler();

// Export the handler function for backward compatibility
export const RevokeAllBansForUser = revokeAllBansForUserHandler.toHandler();