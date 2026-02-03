/**
 * Tests for error handling utilities
 */
import {
  PlayFabMCPError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  PlayFabAPIError,
  formatErrorResponse,
  isPlayFabError,
  wrapPlayFabError,
} from '../errors';

describe('Error Classes', () => {
  describe('PlayFabMCPError', () => {
    it('should create error with all properties', () => {
      const error = new PlayFabMCPError('Test error', 'TEST_ERROR', 400, { detail: 'test' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ detail: 'test' });
      expect(error.name).toBe('PlayFabMCPError');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input', { field: 'test' });
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'test' });
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Unauthorized');
      expect(error.message).toBe('Unauthorized');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests', 60);
      expect(error.message).toBe('Too many requests');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
      expect(error.details).toEqual({ retryAfter: 60 });
      expect(error.name).toBe('RateLimitError');
    });
  });

  describe('PlayFabAPIError', () => {
    it('should create PlayFab API error', () => {
      const playfabError = { errorCode: '1000', code: 400, errorMessage: 'API Error' };
      const error = new PlayFabAPIError('API failed', playfabError, 'TestMethod');
      expect(error.message).toBe('API failed');
      expect(error.code).toBe('1000');
      expect(error.statusCode).toBe(400);
      expect(error.playfabError).toBe(playfabError);
      expect(error.apiMethod).toBe('TestMethod');
      expect(error.name).toBe('PlayFabAPIError');
    });
  });
});

describe('formatErrorResponse', () => {
  const originalEnv = process.env['NODE_ENV'];

  beforeEach(() => {
    delete process.env['NODE_ENV'];
  });

  afterEach(() => {
    process.env['NODE_ENV'] = originalEnv;
  });

  it('should format PlayFabMCPError in development', () => {
    process.env['NODE_ENV'] = 'development';
    const error = new ValidationError('Test error', { field: 'test' });
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      success: false,
      error: {
        message: 'Test error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: { field: 'test' },
      },
    });
  });

  it('should format PlayFabMCPError in production', () => {
    process.env['NODE_ENV'] = 'production';
    const error = new ValidationError('Test error', { field: 'test' });
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      success: false,
      error: {
        message: 'Test error',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: undefined,
      },
    });
  });

  it('should format regular Error in development', () => {
    process.env['NODE_ENV'] = 'development';
    const error = new Error('Test error');
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      success: false,
      error: {
        message: 'Test error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        details: {
          name: 'Error',
          stack: expect.stringContaining('Test error'),
        },
      },
    });
  });

  it('should format regular Error in production', () => {
    process.env['NODE_ENV'] = 'production';
    const error = new Error('Test error');
    const response = formatErrorResponse(error);
    
    expect(response).toEqual({
      success: false,
      error: {
        message: 'Test error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
        details: undefined,
      },
    });
  });

  it('should format unknown error', () => {
    const response = formatErrorResponse('Unknown error');
    
    expect(response).toEqual({
      success: false,
      error: {
        message: 'An unknown error occurred',
        code: 'UNKNOWN_ERROR',
        statusCode: 500,
        details: process.env['NODE_ENV'] === 'production' ? undefined : 'Unknown error',
      },
    });
  });
});

describe('isPlayFabError', () => {
  it('should identify PlayFab errors', () => {
    expect(isPlayFabError({ error: 'Test' })).toBe(true);
    expect(isPlayFabError({ errorCode: 1000 })).toBe(true);
    expect(isPlayFabError({ errorMessage: 'Test' })).toBe(true);
    expect(isPlayFabError({ error: 'Test', errorCode: 1000, errorMessage: 'Test' })).toBe(true);
  });

  it('should reject non-PlayFab errors', () => {
    expect(isPlayFabError(null)).toBe(false);
    expect(isPlayFabError(undefined)).toBe(false);
    expect(isPlayFabError('string')).toBe(false);
    expect(isPlayFabError(123)).toBe(false);
    expect(isPlayFabError([])).toBe(false);
    expect(isPlayFabError({ other: 'property' })).toBe(false);
  });
});

describe('wrapPlayFabError', () => {
  it('should wrap PlayFab error object', () => {
    const playfabError = {
      errorCode: 1000,
      errorMessage: 'API Error',
      code: 400,
    };
    
    const wrapped = wrapPlayFabError(playfabError, 'TestMethod');
    expect(wrapped).toBeInstanceOf(PlayFabAPIError);
    expect(wrapped.message).toBe('API Error');
    expect(wrapped.playfabError).toBe(playfabError);
    expect(wrapped.apiMethod).toBe('TestMethod');
  });

  it('should use error property if errorMessage is missing', () => {
    const playfabError = {
      error: 'Error property',
      errorCode: 1000,
    };
    
    const wrapped = wrapPlayFabError(playfabError, 'TestMethod');
    expect(wrapped.message).toBe('Error property');
  });

  it('should handle non-PlayFab errors', () => {
    const error = new Error('Regular error');
    const wrapped = wrapPlayFabError(error, 'TestMethod');
    
    expect(wrapped).toBeInstanceOf(PlayFabAPIError);
    expect(wrapped.message).toBe('An unexpected error occurred while calling PlayFab API');
    expect(wrapped.playfabError).toBe(error);
    expect(wrapped.apiMethod).toBe('TestMethod');
  });
});