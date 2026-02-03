import { PlayFabHandler } from "../../types/index.js";
import { CreateDraftItemParams } from "../../types/handler-types.js";
import { CreateDraftItem } from "./create-draft-item.js";

interface BatchCreateDraftItemsParams {
  Items: Array<CreateDraftItemParams>;
  ContinueOnError?: boolean;
}

interface BatchCreateDraftItemsResult {
  success: boolean;
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

export const BatchCreateDraftItems: PlayFabHandler<BatchCreateDraftItemsParams, BatchCreateDraftItemsResult> = async (params) => {
  const continueOnError = params.ContinueOnError !== false;
  const results: BatchCreateDraftItemsResult['results'] = [];
  
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
      
      const result = await CreateDraftItem(itemData);
      results.push({
        index: i,
        success: true,
        item: result.item,
        itemId: result.item?.Id
      });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (!continueOnError) {
        break;
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  return {
    success: failureCount === 0,
    totalProcessed: results.length,
    successCount,
    failureCount,
    results,
    message: `Batch creation completed: ${successCount} succeeded, ${failureCount} failed out of ${params.Items.length} items.`
  };
};
