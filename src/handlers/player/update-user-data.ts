import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function UpdateUserData(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.UpdateUserData({
      PlayFabId: params.PlayFabId,
      Data: params.Data,
      Permission: params.Permission || "Private",
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        dataVersion: result.data.DataVersion,
      })
    })
  })
}
