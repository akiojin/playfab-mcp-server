/**
 * Tests for SearchItems handler
 */
import { SearchItems } from '../search-items';
import { PlayFabEconomyAPI } from '../../../config/playfab';
import { callPlayFabApi } from '../../../utils/playfab-wrapper';
import { ValidationError } from '../../../utils/errors';

// Mock dependencies
jest.mock('../../../config/playfab');
jest.mock('../../../utils/playfab-wrapper', () => ({
  callPlayFabApi: jest.fn(),
  addCustomTags: jest.fn((request) => ({ ...request, CustomTags: { mcp: 'true' } })),
}));

const mockCallPlayFabApi = callPlayFabApi as jest.MockedFunction<typeof callPlayFabApi>;

describe('SearchItems Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should search items with required parameters', async () => {
    const mockResponse = {
      Items: [
        { Id: 'item1', Title: { en: 'Item 1' } },
        { Id: 'item2', Title: { en: 'Item 2' } },
      ],
      ContinuationToken: 'next-page-token',
    };

    mockCallPlayFabApi.mockResolvedValueOnce(mockResponse);

    const result = await SearchItems({ Count: 10 });

    expect(result).toEqual({
      success: true,
      items: mockResponse.Items,
      continuationToken: mockResponse.ContinuationToken,
    });

    expect(mockCallPlayFabApi).toHaveBeenCalledWith(
      PlayFabEconomyAPI.SearchItems,
      expect.objectContaining({
        Count: 10,
        CustomTags: { mcp: 'true' },
      }),
      'SearchItems'
    );
  });

  it('should search items with all optional parameters', async () => {
    const mockResponse = {
      Items: [],
      ContinuationToken: undefined,
    };

    mockCallPlayFabApi.mockResolvedValueOnce(mockResponse);

    const params = {
      Count: 25,
      ContinuationToken: 'previous-token',
      Filter: "type eq 'weapon'",
      OrderBy: 'rating/average desc',
      Search: 'sword',
    };

    const result = await SearchItems(params);

    expect(result).toEqual({
      success: true,
      items: [],
      continuationToken: undefined,
    });

    expect(mockCallPlayFabApi).toHaveBeenCalledWith(
      PlayFabEconomyAPI.SearchItems,
      expect.objectContaining({
        ...params,
        CustomTags: { mcp: 'true' },
      }),
      'SearchItems'
    );
  });

  it('should use default count when not provided', async () => {
    mockCallPlayFabApi.mockResolvedValueOnce({ Items: [] });

    await SearchItems({});

    expect(mockCallPlayFabApi).toHaveBeenCalledWith(
      PlayFabEconomyAPI.SearchItems,
      expect.objectContaining({
        Count: 10,
      }),
      'SearchItems'
    );
  });

  it('should validate count range', async () => {
    await expect(SearchItems({ Count: 0 }))
      .rejects.toThrow(ValidationError);
    
    await expect(SearchItems({ Count: 51 }))
      .rejects.toThrow(ValidationError);
  });

  it('should validate string parameters', async () => {
    await expect(SearchItems({ Count: 10, Search: 123 as any }))
      .rejects.toThrow(ValidationError);
    
    await expect(SearchItems({ Count: 10, Filter: {} as any }))
      .rejects.toThrow(ValidationError);
  });

  it('should validate string length limits', async () => {
    const longString = 'a'.repeat(2049);
    
    await expect(SearchItems({ Count: 10, Search: longString }))
      .rejects.toThrow(ValidationError);
  });

  it('should handle API errors', async () => {
    const apiError = new Error('API Error');
    mockCallPlayFabApi.mockRejectedValueOnce(apiError);

    await expect(SearchItems({ Count: 10 }))
      .rejects.toThrow('API Error');
  });

  it('should pass through custom tags', async () => {
    mockCallPlayFabApi.mockResolvedValueOnce({ Items: [] });

    await SearchItems({ Count: 10 });

    const callArgs = mockCallPlayFabApi.mock.calls[0];
    expect(callArgs?.[1]).toHaveProperty('CustomTags', expect.objectContaining({
      mcp: 'true',
    }));
  });
});