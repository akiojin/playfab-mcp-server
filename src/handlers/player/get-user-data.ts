import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function GetUserData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetUserData({
      PlayFabId: params.PlayFabId,
      Keys: params.Keys
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        data: result.data.Data,
        dataVersion: result.data.DataVersion,
      })
    })
  })
}
