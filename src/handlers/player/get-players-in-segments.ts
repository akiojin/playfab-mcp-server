import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function GetPlayersInSegments(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetPlayersInSegment({
      ...params,
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        players: result.data.PlayerProfiles,
        continuationToken: result.data.ContinuationToken,
        profilesInSegment: result.data.ProfilesInSegment
      })
    })
  })
}
