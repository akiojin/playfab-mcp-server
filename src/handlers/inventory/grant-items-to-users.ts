import { AddInventoryItems } from "../inventory/add-inventory-items.js";

export async function GrantItemsToUsers(params: any) {
  const continueOnError = params.ContinueOnError !== false
  const results = []
  
  for (let i = 0; i < params.Grants.length; i++) {
    const grant = params.Grants[i]
    
    try {
      // Process each item for the player
      const grantResults = []
      for (const item of grant.Items) {
        const addParams = {
          TitlePlayerAccountId: grant.TitlePlayerAccountId,
          Amount: item.Amount || 1,
          CollectionId: grant.CollectionId || 'default',
          Item: { Id: item.ItemId },
          DurationInSeconds: item.DurationInSeconds,
          IdempotencyId: `grant_${Date.now()}_${i}_${item.ItemId}`
        }
        
        const result: any = await AddInventoryItems(addParams)
        grantResults.push({
          itemId: item.ItemId,
          success: true,
          transactionId: result.transactionIds?.[0]
        })
      }
      
      results.push({
        index: i,
        playerId: grant.TitlePlayerAccountId,
        success: true,
        itemsGranted: grantResults
      })
    } catch (error) {
      results.push({
        index: i,
        playerId: grant.TitlePlayerAccountId,
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
    message: `Batch grant completed: ${successCount} players processed successfully, ${failureCount} failed out of ${params.Grants.length} total.`
  }
}
