/**
 * Tests for MCP SDK logger utilities
 */
import {
  createLogger,
  setServer,
  getServer,
  PerformanceLogger,
  logAPICall,
  logToolCall
} from '../logger';

// Mock MCP Server
const mockSendLoggingMessage = jest.fn().mockResolvedValue(undefined);
const mockServer = {
  sendLoggingMessage: mockSendLoggingMessage,
} as any;

describe('Logger Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset server instance
    setServer(null as any);
  });

  describe('setServer and getServer', () => {
    it('should set and get server instance', () => {
      expect(getServer()).toBeNull();

      setServer(mockServer);

      expect(getServer()).toBe(mockServer);
    });
  });

  describe('createLogger', () => {
    it('should create a logger with all methods', () => {
      const logger = createLogger('test-module');

      expect(logger).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.fatal).toBeDefined();
    });

    it('should not send logs when server is not set', () => {
      const logger = createLogger('test-module');

      logger.info('Test message');

      expect(mockSendLoggingMessage).not.toHaveBeenCalled();
    });

    it('should send logs when server is set', () => {
      setServer(mockServer);
      const logger = createLogger('test-module');

      logger.info('Test message');

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        logger: 'test-module',
        data: 'Test message',
      });
    });

    it('should include data in log message', () => {
      setServer(mockServer);
      const logger = createLogger('test-module');

      logger.info('Test message', { key: 'value' });

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        logger: 'test-module',
        data: { message: 'Test message', key: 'value' },
      });
    });

    it('should handle non-object data', () => {
      setServer(mockServer);
      const logger = createLogger('test-module');

      logger.info('Test message', 123);

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        logger: 'test-module',
        data: { message: 'Test message', value: 123 },
      });
    });

    it('should map warn to warning level', () => {
      setServer(mockServer);
      const logger = createLogger('test-module');

      logger.warn('Warning message');

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'warning',
        logger: 'test-module',
        data: 'Warning message',
      });
    });

    it('should map fatal to emergency level', () => {
      setServer(mockServer);
      const logger = createLogger('test-module');

      logger.fatal('Fatal message');

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'emergency',
        logger: 'test-module',
        data: 'Fatal message',
      });
    });
  });

  describe('PerformanceLogger', () => {
    it('should track operation duration', async () => {
      setServer(mockServer);
      const perfLogger = new PerformanceLogger('test-operation');

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      perfLogger.end({ additionalData: 'test' });

      // Should have called debug for start and info for end
      expect(mockSendLoggingMessage).toHaveBeenCalledTimes(2);

      const endCall = mockSendLoggingMessage.mock.calls[1][0];
      expect(endCall.level).toBe('info');
      expect(endCall.data.duration_ms).toBeGreaterThanOrEqual(0);
      expect(endCall.data.additionalData).toBe('test');
    });

    it('should log errors with duration', () => {
      setServer(mockServer);
      const perfLogger = new PerformanceLogger('test-operation');
      const error = new Error('Test error');

      perfLogger.error(error, { context: 'test' });

      const errorCall = mockSendLoggingMessage.mock.calls[1][0];
      expect(errorCall.level).toBe('error');
      expect(errorCall.data.error.message).toBe('Test error');
      expect(errorCall.data.error.name).toBe('Error');
      expect(errorCall.data.context).toBe('test');
    });

    it('should handle non-Error objects', () => {
      setServer(mockServer);
      const perfLogger = new PerformanceLogger('test-operation');

      perfLogger.error('string error', { context: 'test' });

      const errorCall = mockSendLoggingMessage.mock.calls[1][0];
      expect(errorCall.data.error).toBe('string error');
    });
  });

  describe('logAPICall', () => {
    it('should log successful API calls', () => {
      setServer(mockServer);
      const method = 'TestMethod';
      const request = { param: 'value' };
      const response = { result: 'success' };
      const duration = 100;

      logAPICall(method, request, response, duration);

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'info',
        logger: 'api',
        data: {
          message: 'PlayFab API call succeeded: TestMethod',
          method: 'TestMethod',
          duration_ms: 100,
        },
      });
    });

    it('should log failed API calls with error', () => {
      setServer(mockServer);
      const method = 'TestMethod';
      const request = { param: 'value' };
      const duration = 100;
      const error = new Error('API Error');

      logAPICall(method, request, null, duration, error);

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'error',
        logger: 'api',
        data: {
          message: 'PlayFab API call failed: TestMethod',
          method: 'TestMethod',
          duration_ms: 100,
          error: { message: 'API Error' },
        },
      });
    });

    it('should handle non-Error objects as errors', () => {
      setServer(mockServer);
      const method = 'TestMethod';
      const request = { param: 'value' };
      const duration = 100;
      const error = { code: 500, message: 'Server Error' };

      logAPICall(method, request, null, duration, error);

      const call = mockSendLoggingMessage.mock.calls[0][0];
      expect(call.data.error).toEqual({ code: 500, message: 'Server Error' });
    });
  });

  describe('logToolCall', () => {
    it('should log successful tool calls', () => {
      setServer(mockServer);
      const toolName = 'search-items';
      const args = { Count: 10 };
      const result = { items: [] };
      const duration = 50;

      logToolCall(toolName, args, result, duration);

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'debug',
        logger: 'mcp',
        data: {
          message: 'MCP tool call completed: search-items',
          tool: 'search-items',
          duration_ms: 50,
        },
      });
    });

    it('should log failed tool calls with error', () => {
      setServer(mockServer);
      const toolName = 'search-items';
      const args = { Count: 10 };
      const duration = 50;
      const error = new Error('Tool Error');

      logToolCall(toolName, args, null, duration, error);

      expect(mockSendLoggingMessage).toHaveBeenCalledWith({
        level: 'error',
        logger: 'mcp',
        data: {
          message: 'MCP tool call failed: search-items',
          tool: 'search-items',
          duration_ms: 50,
          error: { message: 'Tool Error' },
        },
      });
    });

    it('should handle non-Error objects as errors', () => {
      setServer(mockServer);
      const toolName = 'search-items';
      const args = { Count: 10 };
      const duration = 50;
      const error = { message: 'Tool failed' };

      logToolCall(toolName, args, null, duration, error);

      const call = mockSendLoggingMessage.mock.calls[0][0];
      expect(call.data.error).toEqual({ message: 'Tool failed' });
    });
  });

  describe('error handling', () => {
    it('should silently handle sendLoggingMessage failures', () => {
      const failingServer = {
        sendLoggingMessage: jest.fn().mockRejectedValue(new Error('Send failed')),
      } as any;
      setServer(failingServer);

      const logger = createLogger('test-module');

      // Should not throw
      expect(() => logger.info('Test message')).not.toThrow();
    });
  });
});
