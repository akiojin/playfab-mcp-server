import { PlayFabEconomyAPI } from "../../config/playfab.js";
import { callAdminAPI, addCustomTags } from "../../utils/playfab-wrapper.js";
import { validateString, validateNumber, validatePaginationCount } from "../../utils/input-validator.js";
import { HandlerResponse, PlayFabHandler } from "../../types/index.js";
import { SearchItemsResponse } from "../../types/playfab-responses.js";
import { SearchItemsParams } from "../../types/tool-params.js";

interface SearchItemsResult {
  items: any[];
  continuationToken?: string;
}

interface SearchItemsValidatedParams {
  Count: number;
  ContinuationToken?: string;
  Filter?: string;
  OrderBy?: string;
  Search?: string;
}

export const SearchItems: PlayFabHandler<SearchItemsParams, SearchItemsResult> = async (params) => {
  // Validate input parameters
  const validatedParams: SearchItemsValidatedParams = {
    Count: validatePaginationCount(params.Count, 'Count', 10, 50),
  };

  // Optional parameters
  const continuationToken = validateString(params.ContinuationToken, 'ContinuationToken');
  if (continuationToken) validatedParams.ContinuationToken = continuationToken;

  const filter = validateString(params.Filter, 'Filter', { maxLength: 2048 });
  if (filter) validatedParams.Filter = filter;

  const orderBy = validateString(params.OrderBy, 'OrderBy', { maxLength: 2048 });
  if (orderBy) validatedParams.OrderBy = orderBy;

  const search = validateString(params.Search, 'Search', { maxLength: 2048 });
  if (search) validatedParams.Search = search;

  // Make API call with validated parameters
  const request = addCustomTags(validatedParams);
  const result = await callAdminAPI(
    PlayFabEconomyAPI.SearchItems,
    request,
    'SearchItems'
  );
  
  return {
    success: true,
    items: result.Items || [],
    continuationToken: result.ContinuationToken
  };
}
