/**
 * Tests for retry utilities
 */
import {
  isRetryableError,
  calculateRetryDelay,
  retryWithPlayFabLogic,
  DEFAULT_RETRY_OPTIONS,
  PLAYFAB_RETRY_CONFIGS
} from '../retry';
import { 
  PlayFabAPIError, 
  RateLimitError, 
  AuthenticationError,
  ValidationError 
} from '../errors';

// Mock logger to avoid console output during tests
jest.mock('../logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })
}));

describe('Retry Utilities', () => {
  describe('isRetryableError', () => {
    it('should return true for rate limit errors', () => {
      const error = new RateLimitError('Rate limited', 60);
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for authentication errors', () => {
      const error = new AuthenticationError('Invalid token');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new ValidationError('Invalid input');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for retryable PlayFab API errors', () => {
      const error = new PlayFabAPIError(
        'Internal server error',
        { errorCode: 'InternalServerError' }
      );
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for non-retryable PlayFab API errors', () => {
      const error = new PlayFabAPIError(
        'Invalid request',
        { errorCode: 'InvalidParams' }
      );
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for 5xx status codes', () => {
      const error = { statusCode: 500 };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for 429 status codes', () => {
      const error = { statusCode: 429 };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for 4xx status codes (except 408, 429)', () => {
      const error = { statusCode: 400 };
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return true for network errors', () => {
      const error = new Error('Network timeout');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for unknown errors', () => {
      const error = new Error('Unknown error');
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('calculateRetryDelay', () => {
    it('should use retryAfter when provided', () => {
      const delay = calculateRetryDelay(0, DEFAULT_RETRY_OPTIONS, 5);
      expect(delay).toBe(5000); // 5 seconds in milliseconds
    });

    it('should use exponential backoff by default', () => {
      const delay1 = calculateRetryDelay(0, DEFAULT_RETRY_OPTIONS);
      const delay2 = calculateRetryDelay(1, DEFAULT_RETRY_OPTIONS);
      
      // Remove jitter for predictable testing
      const options = { ...DEFAULT_RETRY_OPTIONS, jitter: false };
      const cleanDelay1 = calculateRetryDelay(0, options);
      const cleanDelay2 = calculateRetryDelay(1, options);
      
      expect(cleanDelay2).toBe(cleanDelay1 * 2);
    });

    it('should respect max delay', () => {
      const options = { ...DEFAULT_RETRY_OPTIONS, maxDelay: 5000 };
      const delay = calculateRetryDelay(10, options);
      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('should use linear backoff when exponential is disabled', () => {
      const options = { 
        ...DEFAULT_RETRY_OPTIONS, 
        exponentialBackoff: false,
        jitter: false
      };
      
      const delay1 = calculateRetryDelay(0, options);
      const delay2 = calculateRetryDelay(1, options);
      
      expect(delay2).toBe(delay1 * 2);
    });
  });

  describe('retryWithPlayFabLogic', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return success on first attempt', async () => {
      const fn = jest.fn().mockResolvedValueOnce('success');
      
      const result = await retryWithPlayFabLogic(fn, { maxRetries: 0 });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new RateLimitError('Rate limited'))
        .mockResolvedValueOnce('success');
      
      const result = await retryWithPlayFabLogic(fn, { 
        maxRetries: 1,
        baseDelay: 10 // Minimal delay for testing
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry on non-retryable errors', async () => {
      const fn = jest.fn().mockRejectedValueOnce(new ValidationError('Invalid input'));
      
      await expect(retryWithPlayFabLogic(fn, { maxRetries: 3 }))
        .rejects.toThrow(ValidationError);
      
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should exhaust all retries and throw last error', async () => {
      const error = new RateLimitError('Persistent rate limit');
      const fn = jest.fn().mockRejectedValue(error);
      
      await expect(retryWithPlayFabLogic(fn, { 
        maxRetries: 2,
        baseDelay: 1
      })).rejects.toThrow(RateLimitError);
      
      expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use custom retry options', async () => {
      const fn = jest.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce('success');
      
      const customOptions = {
        maxRetries: 1,
        baseDelay: 5,
        retryableErrors: ['timeout']
      };
      
      const result = await retryWithPlayFabLogic(fn, customOptions);
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('PLAYFAB_RETRY_CONFIGS', () => {
    it('should have strict config for player APIs', () => {
      expect(PLAYFAB_RETRY_CONFIGS.strict.maxRetries).toBeLessThanOrEqual(3);
      expect(PLAYFAB_RETRY_CONFIGS.strict.baseDelay).toBeGreaterThan(1000);
    });

    it('should have standard config for admin APIs', () => {
      expect(PLAYFAB_RETRY_CONFIGS.standard.maxRetries).toBeGreaterThanOrEqual(2);
      expect(PLAYFAB_RETRY_CONFIGS.standard.exponentialBackoff).toBe(true);
    });

    it('should have bulk config for bulk operations', () => {
      expect(PLAYFAB_RETRY_CONFIGS.bulk.maxRetries).toBeGreaterThanOrEqual(5);
      expect(PLAYFAB_RETRY_CONFIGS.bulk.maxDelay).toBeGreaterThanOrEqual(30000);
    });
  });
});