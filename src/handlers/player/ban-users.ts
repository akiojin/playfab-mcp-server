import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function BanUsers(params: any) {
  return new Promise((resolve, reject) => {
    // Validate confirmation
    if (!params.ConfirmBan || params.ConfirmBan !== true) {
      reject("Error: Ban confirmation required. Set ConfirmBan to true to proceed with this operation.")
      return
    }
    
    // Validate all bans have reasons
    if (!params.Bans || !params.Bans.every((ban: any) => ban.Reason && ban.Reason.trim() !== '')) {
      reject("Error: All bans must include a reason for audit trail purposes.")
      return
    }
    
    PlayFabAdminAPI.BanUsers({
      Bans: params.Bans,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        banData: result.data.BanData,
        message: `Successfully banned ${params.Bans.length} user(s).`
      })
    })
  })
}
