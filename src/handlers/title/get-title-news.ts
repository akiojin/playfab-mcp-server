import { PlayFabServerAPI } from "../../config/playfab.js";
import { callPlayFabApi, addCustomTags } from "../../utils/playfab-wrapper.js";
import { PlayFabHandler } from "../../types/index.js";
import { GetTitleNewsParams, GetTitleNewsResult } from "../../types/handler-types.js";

export const GetTitleNews: PlayFabHandler<GetTitleNewsParams, GetTitleNewsResult> = async (params) => {
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
    news: result.News?.map((item: any) => ({
      NewsId: item.NewsId || '',
      Title: item.Title || '',
      Body: item.Body || '',
      Timestamp: item.Timestamp || ''
    })) || [],
  };
};
