import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function SetTitleData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.SetTitleData({
      Key: params.Key,
      Value: params.Value
    }, (error) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
      })
    })
  })
}
