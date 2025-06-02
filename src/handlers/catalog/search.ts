/**
 * Catalog search handlers
 */
import { PlayFabEconomyAPI } from '../../config/playfab'
import { callPlayFabApi, addCustomTags } from '../../utils/playfab-wrapper'
import { SuccessResponse } from '../../types'

interface SearchItemsParams {
  Count: number
  ContinuationToken?: string
  Filter?: string
  OrderBy?: string
  Search?: string
}

interface SearchItemsResponse extends SuccessResponse {
  items: any[]
  continuationToken?: string
}

export async function SearchItems(params: SearchItemsParams): Promise<SearchItemsResponse> {
  const request = {
    Count: params.Count,
    ContinuationToken: params.ContinuationToken,
    Filter: params.Filter,
    OrderBy: params.OrderBy,
    Search: params.Search,
    CustomTags: { mcp: 'true' }
  }

  const result = await callPlayFabApi(
    PlayFabEconomyAPI.SearchItems,
    request,
    'SearchItems'
  )

  return {
    success: true,
    items: result.Items || [],
    continuationToken: result.ContinuationToken
  }
}