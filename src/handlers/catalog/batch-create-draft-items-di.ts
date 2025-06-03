/**
 * BatchCreateDraftItems handler with dependency injection
 */

import { BaseHandler } from '../base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { CreateDraftItemParams } from '../../types/handler-types.js';
import { createDraftItemHandler } from './create-draft-item-di.js';

interface BatchCreateDraftItemsParams {
  Items: Array<CreateDraftItemParams>;
  ContinueOnError?: boolean;
}

interface BatchCreateDraftItemsResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: Array<{
    index: number;
    success: boolean;
    item?: {
      Id: string;
      ETag?: string;
    };
    itemId?: string;
    error?: string;
  }>;
  message: string;
}

export class BatchCreateDraftItemsHandler extends BaseHandler<BatchCreateDraftItemsParams, BatchCreateDraftItemsResult> {
  constructor() {
    super('BatchCreateDraftItems');
  }
  
  async execute(params: BatchCreateDraftItemsParams): Promise<HandlerResponse<BatchCreateDraftItemsResult>> {
    try {
      const continueOnError = params.ContinueOnError !== false;
      const results: BatchCreateDraftItemsResult['results'] = [];
      
      this.logInfo('Starting batch creation of draft items', { 
        itemCount: params.Items.length,
        continueOnError 
      });
      
      for (let i = 0; i < params.Items.length; i++) {
        const itemData = params.Items[i];
        
        if (!itemData) {
          results.push({
            index: i,
            success: false,
            error: "Item data is undefined"
          });
          continue;
        }
        
        try {
          // Validate NEUTRAL title
          if (!itemData.Item || !itemData.Item.Title || !itemData.Item.Title['NEUTRAL']) {
            throw new Error("Title with NEUTRAL locale is required");
          }
          
          // Use the DI handler directly
          const result = await createDraftItemHandler.execute(itemData);
          
          if (result.success) {
            const itemResult = result as any;
            results.push({
              index: i,
              success: true,
              item: itemResult.item,
              itemId: itemResult.item?.Id
            });
          } else {
            throw new Error('Failed to create draft item');
          }
        } catch (error) {
          results.push({
            index: i,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          
          if (!continueOnError) {
            this.logInfo('Batch creation stopped due to error', { 
              stoppedAtIndex: i,
              error: error instanceof Error ? error.message : String(error) 
            });
            break;
          }
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      this.logInfo('Batch creation completed', { 
        totalProcessed: results.length,
        successCount,
        failureCount 
      });
      
      const response: HandlerResponse<BatchCreateDraftItemsResult> = {
        success: true,
        totalProcessed: results.length,
        successCount,
        failureCount,
        results,
        message: `Batch creation completed: ${successCount} succeeded, ${failureCount} failed out of ${params.Items.length} items.`
      };
      
      return response;
    } catch (error) {
      this.logError('Failed to batch create draft items', error);
      throw error;
    }
  }
}

// Export singleton instance
export const batchCreateDraftItemsHandler = new BatchCreateDraftItemsHandler();

// Export handler function for backward compatibility
export const BatchCreateDraftItems = batchCreateDraftItemsHandler.toHandler();