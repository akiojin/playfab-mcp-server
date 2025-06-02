import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function DeleteItem(params: any) {
  // Validate confirmation
  if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
    throw new Error("Deletion confirmation required. Set ConfirmDeletion to true to proceed with this destructive operation.");
  }
  
  const request = addCustomTags({
    Id: params.ItemId
  });
  
  await callPlayFabApi(
    PlayFabEconomyAPI.DeleteItem,
    request,
    'DeleteItem'
  );
  
  return {
    success: true,
    message: `Item ${params.ItemId} has been permanently deleted from the catalog and all player inventories.`
  };
}
