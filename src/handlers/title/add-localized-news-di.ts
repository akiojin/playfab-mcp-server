/**
 * AddLocalizedNews handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';

interface AddLocalizedNewsParams {
  DefaultTitle: string;
  DefaultBody: string;
  Timestamp?: string;
  Localizations?: Array<{
    Language: string;
    Title: string;
    Body: string;
  }>;
}

interface LocalizationResult {
  language: string;
  success: boolean;
  error?: string;
}

interface AddLocalizedNewsResult {
  newsId?: string;
  localizations: LocalizationResult[];
  message: string;
}

export class AddLocalizedNewsHandler extends BaseHandler<AddLocalizedNewsParams, AddLocalizedNewsResult> {
  constructor() {
    super('AddLocalizedNews');
  }
  
  async execute(params: AddLocalizedNewsParams): Promise<HandlerResponse<AddLocalizedNewsResult>> {
    try {
      // Validate required fields
      this.validateRequiredString(params.DefaultTitle, 'DefaultTitle');
      this.validateRequiredString(params.DefaultBody, 'DefaultBody');
      
      this.logInfo('Adding localized news', { 
        title: params.DefaultTitle,
        localizationCount: params.Localizations?.length || 0
      });
      
      // First, create the news in the default language
      const addNewsRequest = this.addCustomTags({
        Title: params.DefaultTitle,
        Body: params.DefaultBody,
        Timestamp: params.Timestamp || new Date().toISOString()
      });
      
      const addNewsResult = await this.callAdminAPI(
        (this.context.apis.adminAPI as any).AddNews,
        addNewsRequest,
        'AddNews'
      ) as any;
      
      const newsId = addNewsResult.NewsId;
      const localizations = params.Localizations || [];
      const localizationResults: LocalizationResult[] = [];
      
      // Add localizations if provided
      for (const localization of localizations) {
        try {
          const localizedRequest = this.addCustomTags({
            NewsId: newsId!,
            Language: localization.Language,
            Title: localization.Title,
            Body: localization.Body
          });
          
          await this.callAdminAPI(
            (this.context.apis.adminAPI as any).AddLocalizedNews,
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
            error: error instanceof Error ? error.message : String(error)
          });
          // Continue with other localizations
        }
      }
      
      const successfulCount = localizationResults.filter(r => r.success).length;
      
      this.logInfo('News added successfully', { 
        newsId,
        successfulLocalizations: successfulCount,
        totalLocalizations: localizationResults.length
      });
      
      return {
        success: true,
        newsId: newsId,
        localizations: localizationResults,
        message: `News item "${params.DefaultTitle}" has been successfully added with ${successfulCount} localization(s).`
      };
    } catch (error: any) {
      this.logError('Failed to add localized news', error);
      
      // Check for specific PlayFab errors
      if (error?.playfabError?.errorCode === '1393') {
        return this.createErrorResponse(
          'DEFAULT_LANGUAGE_NOT_CONFIGURED',
          "PlayFab Error: Default language not configured. Please set a default language in PlayFab Game Manager under 'Settings > General' before creating news items with localization."
        );
      }
      
      if (error?.playfabError) {
        return this.createErrorResponse(
          'PLAYFAB_ERROR',
          `PlayFab Error: ${error.message} (Code: ${error.code || 'Unknown'})`
        );
      }
      
      throw error;
    }
  }
}

// Export singleton instance
export const addLocalizedNewsHandler = new AddLocalizedNewsHandler();

// Export handler function for backward compatibility
export const AddLocalizedNews = addLocalizedNewsHandler.toHandler();