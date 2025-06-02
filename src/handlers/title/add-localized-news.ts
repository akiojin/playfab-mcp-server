import * as pf from "playfab-sdk";
const PlayFabAdminAPI = pf.PlayFabAdmin as PlayFabAdminModule.IPlayFabAdmin;

export async function AddLocalizedNews(params: any) {
  return new Promise(async (resolve, reject) => {
    try {
      // First, create the news in the default language
      const addNewsResult = await new Promise<any>((res, rej) => {
        PlayFabAdminAPI.AddNews({
          Title: params.DefaultTitle,
          Body: params.DefaultBody,
          Timestamp: params.Timestamp || new Date().toISOString(),
          CustomTags: { mcp: 'true' }
        }, (error, result) => {
          if (error) {
            rej(error)
          } else {
            res(result)
          }
        })
      })
      
      const newsId = addNewsResult.data.NewsId
      const localizations = params.Localizations || []
      const localizationResults: Array<{
        language: string
        success: boolean
        error?: any
      }> = []
      
      // Add localizations if provided
      for (const localization of localizations) {
        try {
          await new Promise<void>((res) => {
            PlayFabAdminAPI.AddLocalizedNews({
              NewsId: newsId,
              Language: localization.Language,
              Title: localization.Title,
              Body: localization.Body,
              CustomTags: { mcp: 'true' }
            }, (error) => {
              if (error) {
                localizationResults.push({
                  language: localization.Language,
                  success: false,
                  error: error
                })
                res() // Continue with other languages
              } else {
                localizationResults.push({
                  language: localization.Language,
                  success: true
                })
                res()
              }
            })
          })
        } catch (err) {
          // Continue with other localizations
        }
      }
      
      resolve({
        success: true,
        newsId: newsId,
        localizations: localizationResults,
        message: `News item "${params.DefaultTitle}" has been successfully added with ${localizationResults.filter(r => r.success).length} localization(s).`
      })
    } catch (error: any) {
      // Check for specific PlayFab errors
      if (error && error.errorCode === 1393) {
        reject("PlayFab Error: Default language not configured. Please set a default language in PlayFab Game Manager under 'Settings > General' before creating news items with localization.")
      } else if (error && error.errorMessage) {
        reject(`PlayFab Error: ${error.errorMessage} (Code: ${error.errorCode || 'Unknown'})`)
      } else {
        reject(JSON.stringify(error, null, 2))
      }
    }
  })
}
