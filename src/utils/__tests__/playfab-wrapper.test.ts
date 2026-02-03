/**
 * Tests for PlayFab API wrapper utilities
 */
import { callPlayFabApi, addCustomTags } from '../playfab-wrapper';
import { PlayFabAuthenticationAPI } from '../../config/playfab';
import { RateLimitError } from '../errors';
import { wrapPlayFabError } from '../errors';

// Mock dependencies
jest.mock('../../config/playfab');
jest.mock('../errors');

const mockGetEntityToken = PlayFabAuthenticationAPI.GetEntityToken as jest.MockedFunction<any>;
const mockWrapPlayFabError = wrapPlayFabError as jest.MockedFunction<typeof wrapPlayFabError>;

describe('PlayFab Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('callPlayFabApi', () => {
    const mockApiMethod = jest.fn();
    const mockRequest = { test: 'request' };

    beforeEach(() => {
      // Mock successful entity token fetch
      mockGetEntityToken.mockImplementation((req: any, callback: any) => {
        callback(null, {
          data: {
            EntityToken: 'mock-token',
            TokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      });
    });

    it('should call API method with successful response', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockApiMethod.mockImplementation((req, callback) => {
        callback(null, mockResponse);
      });

      const result = await callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 });

      expect(result).toEqual(mockResponse.data);
      expect(mockApiMethod).toHaveBeenCalledWith(mockRequest, expect.any(Function));
      expect(mockGetEntityToken).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const mockError = { errorCode: 1000, errorMessage: 'API Error' };
      mockApiMethod.mockImplementation((req, callback) => {
        callback(mockError, null);
      });

      mockWrapPlayFabError.mockReturnValue(new Error('Wrapped error') as any);

      await expect(callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 }))
        .rejects.toThrow('Wrapped error');

      expect(mockWrapPlayFabError).toHaveBeenCalledWith(mockError, 'TestMethod');
    });

    it.skip('should handle rate limit errors', async () => {
      const mockError = { code: 429, retryAfterSeconds: 60 };
      mockApiMethod.mockImplementation((req, callback) => {
        callback(mockError, null);
      });

      // Test with no retries to avoid timeout
      await expect(callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 }))
        .rejects.toThrow(RateLimitError);
    }, 10000);

    it('should handle missing response data', async () => {
      mockApiMethod.mockImplementation((req, callback) => {
        callback(null, {});
      });

      await expect(callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 }))
        .rejects.toThrow('No data returned from TestMethod');
    });

    it.skip('should reuse valid entity token', async () => {
      const mockResponse = { data: { result: 'success' } };
      mockApiMethod.mockImplementation((req, callback) => {
        callback(null, mockResponse);
      });

      // First call
      await callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 });
      expect(mockGetEntityToken).toHaveBeenCalledTimes(1);

      // Second call - should reuse token
      await callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 });
      expect(mockGetEntityToken).toHaveBeenCalledTimes(1);
    });

    it.skip('should refresh expired entity token', async () => {
      // Mock expired token
      mockGetEntityToken.mockImplementationOnce((req: any, callback: any) => {
        callback(null, {
          data: {
            EntityToken: 'expired-token',
            TokenExpiration: new Date(Date.now() - 1000).toISOString(), // Expired
          },
        });
      });

      const mockResponse = { data: { result: 'success' } };
      mockApiMethod.mockImplementation((req, callback) => {
        callback(null, mockResponse);
      });

      // Reset mocks to count properly
      mockGetEntityToken.mockClear();
      
      // Mock new token fetch
      mockGetEntityToken.mockImplementation((req: any, callback: any) => {
        callback(null, {
          data: {
            EntityToken: 'new-token',
            TokenExpiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        });
      });

      await callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 });
      
      // Should fetch new token because previous one expired
      expect(mockGetEntityToken).toHaveBeenCalledTimes(1);
    });

    it.skip('should handle entity token fetch errors', async () => {
      const tokenError = { errorCode: 1074, errorMessage: 'Token error' };
      mockGetEntityToken.mockImplementation((req: any, callback: any) => {
        callback(tokenError, null);
      });

      mockWrapPlayFabError.mockReturnValue(new Error('Token fetch failed') as any);

      await expect(callPlayFabApi(mockApiMethod, mockRequest, 'TestMethod', { maxRetries: 0 }))
        .rejects.toThrow('Token fetch failed');

      expect(mockWrapPlayFabError).toHaveBeenCalledWith(tokenError, 'GetEntityToken');
    });
  });

  describe('addCustomTags', () => {
    it('should add custom tags to empty request', () => {
      const request = { someField: 'value' };
      const result = addCustomTags(request);

      expect(result).toEqual({
        someField: 'value',
        CustomTags: { mcp: 'true' },
      });
    });

    it('should merge with existing custom tags', () => {
      const request = {
        someField: 'value',
        CustomTags: { existing: 'tag' },
      };
      const result = addCustomTags(request);

      expect(result).toEqual({
        someField: 'value',
        CustomTags: {
          mcp: 'true',
          existing: 'tag',
        },
      });
    });

    it('should add additional tags', () => {
      const request = { someField: 'value' };
      const result = addCustomTags(request, { extra: 'tag' });

      expect(result).toEqual({
        someField: 'value',
        CustomTags: {
          mcp: 'true',
          extra: 'tag',
        },
      });
    });

    it('should prioritize request tags over default tags', () => {
      const request = {
        CustomTags: { mcp: 'custom' },
      };
      const result = addCustomTags(request);

      expect(result.CustomTags.mcp).toBe('custom');
    });
  });
});
