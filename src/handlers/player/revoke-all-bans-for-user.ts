import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function RevokeAllBansForUser(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.RevokeAllBansForUser({
      PlayFabId: params.PlayFabId
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        banData: result.data.BanData,
      })
    })
  })
}
