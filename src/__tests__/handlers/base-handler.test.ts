/**
 * Tests for base handler
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BaseHandler } from '../../handlers/base-handler.js';
import { HandlerResponse } from '../../types/index.js';
import { setupDependencies } from '../../config/di-setup.js';
import { container } from '../../utils/container.js';

// Test implementation of BaseHandler
class TestHandler extends BaseHandler<{ input: string }, { output: string }> {
  constructor() {
    super('TestHandler');
  }
  
  async execute(params: { input: string }): Promise<HandlerResponse<{ output: string }>> {
    this.logInfo('Executing test handler', { input: params.input });
    
    try {
      const validated = this.validateRequiredString(params.input, 'input');
      
      return {
        success: true,
        output: `Processed: ${validated}`
      };
    } catch (error) {
      this.logError('Test handler failed', error);
      return this.createErrorResponse('TEST_ERROR', 'Test failed', { error });
    }
  }
}

describe('BaseHandler', () => {
  beforeEach(() => {
    container.clear();
    setupDependencies({
      titleId: 'test-title',
      developerSecretKey: 'test-secret'
    });
  });
  
  describe('handler execution', () => {
    it('should execute handler successfully', async () => {
      const handler = new TestHandler();
      const result = await handler.execute({ input: 'test' });
      
      expect(result.success).toBe(true);
      expect((result as any).output).toBe('Processed: test');
    });
    
    it('should handle errors gracefully', async () => {
      const handler = new TestHandler();
      const result = await handler.execute({ input: '' } as any);
      
      expect(result.success).toBe(false);
      expect((result as any).error.code).toBe('TEST_ERROR');
      expect((result as any).error.message).toBe('Test failed');
    });
  });
  
  describe('toHandler method', () => {
    it('should return a bound handler function', async () => {
      const handler = new TestHandler();
      const handlerFn = handler.toHandler();
      
      const result = await handlerFn({ input: 'test' });
      
      expect(result.success).toBe(true);
      expect((result as any).output).toBe('Processed: test');
    });
  });
  
  describe('validation helpers', () => {
    class ValidationTestHandler extends BaseHandler<any, any> {
      constructor() {
        super('ValidationTestHandler');
      }
      
      async execute(params: any): Promise<HandlerResponse<any>> {
        return { success: true };
      }
      
      // Expose protected methods for testing
      testValidateRequiredString(value: unknown, fieldName: string) {
        return this.validateRequiredString(value, fieldName);
      }
      
      testValidateString(value: unknown, fieldName: string) {
        return this.validateString(value, fieldName);
      }
      
      testValidateNumber(value: unknown, fieldName: string) {
        return this.validateNumber(value, fieldName);
      }
      
      testValidatePaginationCount(value: unknown, fieldName: string) {
        return this.validatePaginationCount(value, fieldName);
      }
    }
    
    it('should validate required string', () => {
      const handler = new ValidationTestHandler();
      
      expect(handler.testValidateRequiredString('test', 'field')).toBe('test');
      expect(() => handler.testValidateRequiredString('', 'field')).toThrow();
      expect(() => handler.testValidateRequiredString(null, 'field')).toThrow();
    });
    
    it('should validate optional string', () => {
      const handler = new ValidationTestHandler();
      
      expect(handler.testValidateString('test', 'field')).toBe('test');
      expect(handler.testValidateString('', 'field')).toBe('');
      expect(handler.testValidateString(null, 'field')).toBeUndefined();
    });
    
    it('should validate number', () => {
      const handler = new ValidationTestHandler();
      
      expect(handler.testValidateNumber(123, 'field')).toBe(123);
      expect(handler.testValidateNumber('123', 'field')).toBe(123);
      expect(handler.testValidateNumber(null, 'field')).toBeUndefined();
    });
    
    it('should validate pagination count', () => {
      const handler = new ValidationTestHandler();
      
      expect(handler.testValidatePaginationCount(25, 'field')).toBe(25);
      expect(handler.testValidatePaginationCount(null, 'field')).toBe(10); // default
    });
  });
  
  describe('logging helpers', () => {
    it('should log info messages', () => {
      const handler = new TestHandler();
      const logSpy = jest.spyOn(handler['context'].logger, 'info');

      handler['logInfo']('Test message', { data: 'test' });

      expect(logSpy).toHaveBeenCalledWith({ data: 'test' }, 'Test message');
    });

    it('should log error messages', () => {
      const handler = new TestHandler();
      const logSpy = jest.spyOn(handler['context'].logger, 'error');

      handler['logError']('Error message', new Error('test error'));

      expect(logSpy).toHaveBeenCalledWith({ error: expect.any(Error) }, 'Error message');
    });
  });
  
  describe('API call helpers', () => {
    it('should have access to API call methods', () => {
      const handler = new TestHandler();
      
      expect(handler['callAdminAPI']).toBeDefined();
      expect(handler['callPlayerAPI']).toBeDefined();
      expect(handler['callBulkAPI']).toBeDefined();
    });
  });
});