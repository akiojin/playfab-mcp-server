import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function GetAllSegments() {
  return new Promise((resolve, reject) => {
    PlayFabAdminAPI.GetAllSegments({
      CustomTags: { mcp: 'true' }
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
      } else {
        resolve({
          success: true,
          segments: result.data.Segments || []
        })
      }
    })
  })
}