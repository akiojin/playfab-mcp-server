import { PlayFabHandler } from "../../types/index.js";
import { DeleteItemParams, DeleteItemResult } from "../../types/handler-types.js";
import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";

export const DeleteItem: PlayFabHandler<DeleteItemParams, DeleteItemResult> = async (params) => {
  // Validate confirmation
  if (!params.ConfirmDeletion || params.ConfirmDeletion !== true) {
    throw new Error("Deletion confirmation required. Set ConfirmDeletion to true to proceed with this destructive operation.");
  }
  
  const request = addCustomTags({
    Id: params.ItemId
  });
  
  await callAdminAPI(
    PlayFabEconomyAPI.DeleteItem,
    request,
    'DeleteItem'
  );
  
  return {
    success: true,
    message: `Item ${params.ItemId} has been permanently deleted from the catalog and all player inventories.`
  };
};
