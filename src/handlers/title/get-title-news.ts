import { PlayFabServerAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";

export async function GetTitleNews(params: any) {
  const request = addCustomTags({
    Count: params.Count || 10
  });
  
  const result = await callPlayFabApi(
    PlayFabServerAPI.GetTitleNews,
    request,
    'GetTitleNews'
  );
  
  return {
    success: true,
    news: result.News,
    totalCount: result.News?.length || 0
  };
}
