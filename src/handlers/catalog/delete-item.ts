import * as pf from "playfab-sdk";
const PlayFabEconomyAPI = pf.PlayFabEconomy as PlayFabEconomyModule.IPlayFabEconomy;

export async function DeleteItem(params: any) {
  return new Promise((resolve, reject) => {
    // Validate confirmation
    if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
      reject("Error: Deletion confirmation required. Set ConfirmDeletion to true to proceed with this destructive operation.")
      return
    }
    
    PlayFabEconomyAPI.DeleteItem({
      Id: params.ItemId,
      CustomTags: { mcp: 'true' }
    }, (error) => {
      if (error) {
        reject(JSON.stringify(error, null, 2))
        return
      }
      resolve({
        success: true,
        message: `Item ${params.ItemId} has been permanently deleted from the catalog and all player inventories.`
      })
    })
  })
}
