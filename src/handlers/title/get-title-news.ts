import * as pf from "playfab-sdk";
const PlayFabServerAPI = pf.PlayFabServer as PlayFabServerModule.IPlayFabServer;

export async function GetTitleNews(params: any) {
  return new Promise((resolve, reject) => {
    PlayFabServerAPI.GetTitleNews({
      Count: params.Count || 10
    }, (error, result) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        news: result.data.News,
        totalCount: result.data.News?.length || 0
      })
    })
  })
}
