/**
 * Tests for dependency injection setup
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { setupDependencies, createHandlerContext, getPlayFabAPIs, AppConfig } from '../../config/di-setup.js';
import { container, TOKENS } from '../../utils/container.js';

describe('DI Setup', () => {
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Clear container before each test
    container.clear();
    
    // Reset environment
    process.env = { ...originalEnv };
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  describe('setupDependencies', () => {
    it('should throw error when titleId is missing', () => {
      delete process.env['PLAYFAB_TITLE_ID'];
      process.env['PLAYFAB_DEV_SECRET_KEY'] = 'test-secret';
      
      expect(() => setupDependencies()).toThrow('Missing required PlayFab configuration');
    });
    
    it('should throw error when developerSecretKey is missing', () => {
      process.env['PLAYFAB_TITLE_ID'] = 'test-title';
      delete process.env['PLAYFAB_DEV_SECRET_KEY'];
      
      expect(() => setupDependencies()).toThrow('Missing required PlayFab configuration');
    });
    
    it('should setup dependencies with environment variables', () => {
      process.env['PLAYFAB_TITLE_ID'] = 'test-title';
      process.env['PLAYFAB_DEV_SECRET_KEY'] = 'test-secret';
      process.env['NODE_ENV'] = 'test';
      process.env['LOG_LEVEL'] = 'debug';
      
      setupDependencies();
      
      const config = container.get<AppConfig>(TOKENS.Config);
      expect(config.titleId).toBe('test-title');
      expect(config.developerSecretKey).toBe('test-secret');
      expect(config.environment).toBe('test');
      expect(config.logLevel).toBe('debug');
    });
    
    it('should setup dependencies with custom config', () => {
      const customConfig: Partial<AppConfig> = {
        titleId: 'custom-title',
        developerSecretKey: 'custom-secret',
        environment: 'production',
        logLevel: 'error'
      };
      
      setupDependencies(customConfig);
      
      const config = container.get<AppConfig>(TOKENS.Config);
      expect(config.titleId).toBe('custom-title');
      expect(config.developerSecretKey).toBe('custom-secret');
      expect(config.environment).toBe('production');
      expect(config.logLevel).toBe('error');
    });
    
    it('should register all required services', () => {
      setupDependencies({
        titleId: 'test',
        developerSecretKey: 'secret'
      });
      
      // Check core services
      expect(container.has(TOKENS.Config)).toBe(true);
      expect(container.has(TOKENS.Logger)).toBe(true);
      expect(container.has(TOKENS.Router)).toBe(true);
      
      // Check PlayFab APIs
      expect(container.has(TOKENS.PlayFabAdminAPI)).toBe(true);
      expect(container.has(TOKENS.PlayFabEconomyAPI)).toBe(true);
      expect(container.has(TOKENS.PlayFabAuthenticationAPI)).toBe(true);
      expect(container.has(TOKENS.PlayFabProfileAPI)).toBe(true);
      expect(container.has(TOKENS.PlayFabServerAPI)).toBe(true);
      
      // Check utilities
      expect(container.has(TOKENS.PlayFabWrapper)).toBe(true);
      expect(container.has(TOKENS.InputValidator)).toBe(true);
      expect(container.has(TOKENS.ErrorHandler)).toBe(true);
    });
  });
  
  describe('getPlayFabAPIs', () => {
    it('should return all PlayFab APIs', () => {
      setupDependencies({
        titleId: 'test',
        developerSecretKey: 'secret'
      });
      
      const apis = getPlayFabAPIs();
      
      expect(apis).toHaveProperty('adminAPI');
      expect(apis).toHaveProperty('economyAPI');
      expect(apis).toHaveProperty('authenticationAPI');
      expect(apis).toHaveProperty('profileAPI');
      expect(apis).toHaveProperty('serverAPI');
    });
  });
  
  describe('createHandlerContext', () => {
    it('should create handler context with all dependencies', () => {
      setupDependencies({
        titleId: 'test',
        developerSecretKey: 'secret'
      });
      
      const context = createHandlerContext('TestHandler');
      
      // Check logger
      expect(context.logger).toBeDefined();
      expect(context.logger).toHaveProperty('info');
      expect(context.logger).toHaveProperty('error');
      expect(context.logger).toHaveProperty('warn');
      expect(context.logger).toHaveProperty('debug');
      
      // Check config
      expect(context.config).toBeDefined();
      expect(context.config.titleId).toBe('test');
      
      // Check APIs
      expect(context.apis).toBeDefined();
      expect(context.apis).toHaveProperty('adminAPI');
      expect(context.apis).toHaveProperty('economyAPI');
      
      // Check utils
      expect(context.utils).toBeDefined();
      expect(context.utils.validator).toBeDefined();
      expect(context.utils.errors).toBeDefined();
      expect(context.utils.wrapper).toBeDefined();
    });
  });
});