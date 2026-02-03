import { PlayFab, PlayFabProfileAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetTitlePlayerAccountIdsFromPlayFabIds(params: any) {
  // Normalize input to array
  const playFabIds = Array.isArray(params.PlayFabIds) 
    ? params.PlayFabIds 
    : [params.PlayFabIds];
  
  if (playFabIds.length === 0) {
    throw new Error("No PlayFabIds provided");
  }
  
  const request = addCustomTags({
    TitleId: PlayFab.settings.titleId,
    MasterPlayerAccountIds: playFabIds
  });
  
  const result = await callPlayFabApi(
    PlayFabProfileAPI.GetTitlePlayersFromMasterPlayerAccountIds,
    request,
    'GetTitlePlayersFromMasterPlayerAccountIds'
  );
  
  const accounts = result.TitlePlayerAccounts || {};
  const mappings = [];
  const notFound = [];
  
  for (const playFabId of playFabIds) {
    const account = accounts[playFabId];
    if (account && account.Id) {
      mappings.push({
        playFabId: playFabId,
        titlePlayerAccountId: account.Id,
        entityType: account.Type || 'title_player_account'
      });
    } else {
      notFound.push(playFabId);
    }
  }
  
  return {
    success: true,
    mappings: mappings,
    notFound: notFound,
    totalRequested: playFabIds.length,
    totalFound: mappings.length
  };
}
