import { CreateDraftItem } from "./create-draft-item.js";

export async function BatchCreateDraftItems(params: any) {
  const continueOnError = params.ContinueOnError !== false
  const results = []
  
  for (let i = 0; i < params.Items.length; i++) {
    const itemData = params.Items[i]
    
    try {
      // Validate NEUTRAL title
      if (!itemData.Item || !itemData.Item.Title || !itemData.Item.Title.NEUTRAL) {
        throw new Error("Title with NEUTRAL locale is required")
      }
      
      const result: any = await CreateDraftItem(itemData)
      results.push({
        index: i,
        success: true,
        item: result.item,
        itemId: result.item?.Id
      })
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: String(error)
      })
      
      if (!continueOnError) {
        break
      }
    }
  }
  
  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length
  
  return {
    success: failureCount === 0,
    totalProcessed: results.length,
    successCount,
    failureCount,
    results,
    message: `Batch creation completed: ${successCount} succeeded, ${failureCount} failed out of ${params.Items.length} items.`
  }
}
