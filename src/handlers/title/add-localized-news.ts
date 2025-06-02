import { PlayFabAdminAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function AddLocalizedNews(params: any) {
  try {
    // First, create the news in the default language
    const addNewsRequest = addCustomTags({
      Title: params.DefaultTitle,
      Body: params.DefaultBody,
      Timestamp: params.Timestamp || new Date().toISOString()
    });
    
    const addNewsResult = await callPlayFabApi(
      PlayFabAdminAPI.AddNews,
      addNewsRequest,
      'AddNews'
    );
    
    const newsId = addNewsResult.NewsId;
    const localizations = params.Localizations || [];
    const localizationResults: Array<{
      language: string
      success: boolean
      error?: any
    }> = [];
    
    // Add localizations if provided
    for (const localization of localizations) {
      try {
        const localizedRequest = addCustomTags({
          NewsId: newsId!,
          Language: localization.Language,
          Title: localization.Title,
          Body: localization.Body
        });
        
        await callPlayFabApi(
          PlayFabAdminAPI.AddLocalizedNews,
          localizedRequest,
          'AddLocalizedNews'
        );
        
        localizationResults.push({
          language: localization.Language,
          success: true
        });
      } catch (error) {
        localizationResults.push({
          language: localization.Language,
          success: false,
          error: error
        });
        // Continue with other localizations
      }
    }
    
    return {
      success: true,
      newsId: newsId,
      localizations: localizationResults,
      message: `News item "${params.DefaultTitle}" has been successfully added with ${localizationResults.filter(r => r.success).length} localization(s).`
    };
  } catch (error: any) {
    // Check for specific PlayFab errors
    if (error && error.errorCode === 1393) {
      throw new Error("PlayFab Error: Default language not configured. Please set a default language in PlayFab Game Manager under 'Settings > General' before creating news items with localization.");
    } else if (error && error.errorMessage) {
      throw new Error(`PlayFab Error: ${error.errorMessage} (Code: ${error.errorCode || 'Unknown'})`);
    } else {
      throw error;
    }
  }
}
