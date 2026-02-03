/**
 * Tests for the dependency injection container
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Container, TOKENS } from '../../utils/container.js';

describe('Container', () => {
  let container: Container;
  
  beforeEach(() => {
    container = new Container();
  });
  
  describe('value registration', () => {
    it('should register and retrieve a value', () => {
      const testValue = { foo: 'bar' };
      container.value('test', testValue);
      
      const retrieved = container.get('test');
      expect(retrieved).toBe(testValue);
    });
    
    it('should throw error for unregistered token', () => {
      expect(() => container.get('nonexistent')).toThrow('Service not found: nonexistent');
    });
  });
  
  describe('singleton registration', () => {
    it('should create singleton instance only once', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };
      
      container.singleton('test', factory);
      
      const instance1 = container.get('test');
      const instance2 = container.get('test');
      
      expect(instance1).toBe(instance2);
      expect(callCount).toBe(1);
      expect(instance1).toEqual({ id: 1 });
    });
  });
  
  describe('transient registration', () => {
    it('should create new instance each time', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };
      
      container.transient('test', factory);
      
      const instance1 = container.get('test');
      const instance2 = container.get('test');
      
      expect(instance1).not.toBe(instance2);
      expect(callCount).toBe(2);
      expect(instance1).toEqual({ id: 1 });
      expect(instance2).toEqual({ id: 2 });
    });
  });
  
  describe('has method', () => {
    it('should return true for registered service', () => {
      container.value('test', 'value');
      expect(container.has('test')).toBe(true);
    });
    
    it('should return false for unregistered service', () => {
      expect(container.has('test')).toBe(false);
    });
  });
  
  describe('createChild method', () => {
    it('should create child container with parent services', () => {
      container.value('parent', 'parentValue');
      const child = container.createChild();
      
      expect(child.get('parent')).toBe('parentValue');
    });
    
    it('should allow child to override parent services', () => {
      container.value('service', 'parentValue');
      const child = container.createChild();
      
      child.value('service', 'childValue');
      
      expect(container.get('service')).toBe('parentValue');
      expect(child.get('service')).toBe('childValue');
    });
  });
  
  describe('clear method', () => {
    it('should remove all services', () => {
      container.value('test1', 'value1');
      container.value('test2', 'value2');
      
      expect(container.has('test1')).toBe(true);
      expect(container.has('test2')).toBe(true);
      
      container.clear();
      
      expect(container.has('test1')).toBe(false);
      expect(container.has('test2')).toBe(false);
    });
  });
  
  describe('method chaining', () => {
    it('should support method chaining', () => {
      const result = container
        .value('val', 'value')
        .singleton('single', () => 'singleton')
        .transient('trans', () => 'transient');
      
      expect(result).toBe(container);
      expect(container.get('val')).toBe('value');
      expect(container.get('single')).toBe('singleton');
      expect(container.get('trans')).toBe('transient');
    });
  });
  
  describe('symbol tokens', () => {
    it('should support symbol tokens', () => {
      const token = Symbol('test');
      container.value(token, 'symbolValue');
      
      expect(container.get(token)).toBe('symbolValue');
    });
    
    it('should work with predefined tokens', () => {
      container.value(TOKENS.Config, { test: true });
      
      expect(container.get(TOKENS.Config)).toEqual({ test: true });
    });
  });
});