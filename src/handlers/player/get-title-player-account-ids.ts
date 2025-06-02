import * as pf from "playfab-sdk";
const PlayFab = pf.PlayFab as PlayFabModule.IPlayFab;
const PlayFabProfileAPI = pf.PlayFabProfiles as PlayFabProfilesModule.IPlayFabProfiles;

export async function GetTitlePlayerAccountIdsFromPlayFabIds(params: any) {
  return new Promise((resolve, reject) => {
    // Normalize input to array
    const playFabIds = Array.isArray(params.PlayFabIds) 
      ? params.PlayFabIds 
      : [params.PlayFabIds]
    
    if (playFabIds.length === 0) {
      reject("No PlayFabIds provided")
      return
    }
    
    PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds(
      {
        TitleId: PlayFab.settings.titleId,
        MasterPlayerAccountIds: playFabIds,
        CustomTags: { mcp: 'true' }
      },
      (error, result) => {
        if (error) {
          reject(JSON.stringify(error, null, 2))
          return
        }
        
        const accounts = result.data.TitlePlayerAccounts || {}
        const mappings = []
        const notFound = []
        
        for (const playFabId of playFabIds) {
          const account = accounts[playFabId]
          if (account && account.Id) {
            mappings.push({
              playFabId: playFabId,
              titlePlayerAccountId: account.Id,
              entityType: account.Type || 'title_player_account'
            })
          } else {
            notFound.push(playFabId)
          }
        }
        
        resolve({
          success: true,
          mappings: mappings,
          notFound: notFound,
          totalRequested: playFabIds.length,
          totalFound: mappings.length
        })
      }
    )
  })
}
