/**
 * Tests for input validation utilities
 */
import {
  validateString,
  validateNumber,
  validateBoolean,
  validateArray,
  validateObject,
  validateEntityKey,
  validateCurrencyAmount,
  validateItemId,
  validatePlayerId,
  validatePaginationCount,
} from '../input-validator';
import { ValidationError } from '../errors';

describe('Input Validator', () => {
  describe('validateString', () => {
    it('should accept valid strings', () => {
      expect(validateString('test', 'field')).toBe('test');
      expect(validateString('', 'field')).toBe('');
    });

    it('should return undefined for null/undefined when not required', () => {
      expect(validateString(null, 'field')).toBeUndefined();
      expect(validateString(undefined, 'field')).toBeUndefined();
    });

    it('should throw for null/undefined when required', () => {
      expect(() => validateString(null, 'field', { required: true }))
        .toThrow(ValidationError);
      expect(() => validateString(undefined, 'field', { required: true }))
        .toThrow(ValidationError);
    });

    it('should throw for non-string values', () => {
      expect(() => validateString(123, 'field')).toThrow(ValidationError);
      expect(() => validateString({}, 'field')).toThrow(ValidationError);
      expect(() => validateString([], 'field')).toThrow(ValidationError);
    });

    it('should validate minLength', () => {
      expect(() => validateString('ab', 'field', { minLength: 3 }))
        .toThrow('field must be at least 3 characters');
      expect(validateString('abc', 'field', { minLength: 3 })).toBe('abc');
    });

    it('should validate maxLength', () => {
      expect(() => validateString('abcd', 'field', { maxLength: 3 }))
        .toThrow('field must be at most 3 characters');
      expect(validateString('abc', 'field', { maxLength: 3 })).toBe('abc');
    });

    it('should validate pattern', () => {
      expect(() => validateString('abc', 'field', { pattern: /^\d+$/ }))
        .toThrow('field has invalid format');
      expect(validateString('123', 'field', { pattern: /^\d+$/ })).toBe('123');
    });
  });

  describe('validateNumber', () => {
    it('should accept valid numbers', () => {
      expect(validateNumber(123, 'field')).toBe(123);
      expect(validateNumber(0, 'field')).toBe(0);
      expect(validateNumber(-123, 'field')).toBe(-123);
      expect(validateNumber(12.34, 'field')).toBe(12.34);
    });

    it('should convert numeric strings', () => {
      expect(validateNumber('123', 'field')).toBe(123);
      expect(validateNumber('12.34', 'field')).toBe(12.34);
    });

    it('should return undefined for null/undefined when not required', () => {
      expect(validateNumber(null, 'field')).toBeUndefined();
      expect(validateNumber(undefined, 'field')).toBeUndefined();
    });

    it('should throw for null/undefined when required', () => {
      expect(() => validateNumber(null, 'field', { required: true }))
        .toThrow(ValidationError);
    });

    it('should throw for non-numeric values', () => {
      expect(() => validateNumber('abc', 'field')).toThrow(ValidationError);
      expect(() => validateNumber({}, 'field')).toThrow(ValidationError);
    });

    it('should validate min/max', () => {
      expect(() => validateNumber(5, 'field', { min: 10 }))
        .toThrow('field must be at least 10');
      expect(() => validateNumber(15, 'field', { max: 10 }))
        .toThrow('field must be at most 10');
      expect(validateNumber(10, 'field', { min: 5, max: 15 })).toBe(10);
    });

    it('should validate integer', () => {
      expect(() => validateNumber(12.34, 'field', { integer: true }))
        .toThrow('field must be an integer');
      expect(validateNumber(12, 'field', { integer: true })).toBe(12);
    });
  });

  describe('validateBoolean', () => {
    it('should accept valid booleans', () => {
      expect(validateBoolean(true, 'field')).toBe(true);
      expect(validateBoolean(false, 'field')).toBe(false);
    });

    it('should return undefined for null/undefined when not required', () => {
      expect(validateBoolean(null, 'field')).toBeUndefined();
      expect(validateBoolean(undefined, 'field')).toBeUndefined();
    });

    it('should throw for null/undefined when required', () => {
      expect(() => validateBoolean(null, 'field', true))
        .toThrow(ValidationError);
    });

    it('should throw for non-boolean values', () => {
      expect(() => validateBoolean('true', 'field')).toThrow(ValidationError);
      expect(() => validateBoolean(1, 'field')).toThrow(ValidationError);
    });
  });

  describe('validateArray', () => {
    it('should accept valid arrays', () => {
      expect(validateArray([1, 2, 3], 'field')).toEqual([1, 2, 3]);
      expect(validateArray([], 'field')).toEqual([]);
    });

    it('should return undefined for null/undefined when not required', () => {
      expect(validateArray(null, 'field')).toBeUndefined();
      expect(validateArray(undefined, 'field')).toBeUndefined();
    });

    it('should throw for non-array values', () => {
      expect(() => validateArray('[]', 'field')).toThrow(ValidationError);
      expect(() => validateArray({}, 'field')).toThrow(ValidationError);
    });

    it('should validate minLength/maxLength', () => {
      expect(() => validateArray([1], 'field', { minLength: 2 }))
        .toThrow('field must have at least 2 items');
      expect(() => validateArray([1, 2, 3], 'field', { maxLength: 2 }))
        .toThrow('field must have at most 2 items');
    });

    it('should validate items with itemValidator', () => {
      const validator = (item: unknown) => {
        if (typeof item !== 'number') throw new Error('Must be number');
        return item * 2;
      };
      expect(validateArray([1, 2, 3], 'field', { itemValidator: validator }))
        .toEqual([2, 4, 6]);
    });
  });

  describe('validateObject', () => {
    it('should accept valid objects', () => {
      const obj = { key: 'value' };
      expect(validateObject(obj, 'field')).toBe(obj);
    });

    it('should return undefined for null/undefined when not required', () => {
      expect(validateObject(null, 'field')).toBeUndefined();
      expect(validateObject(undefined, 'field')).toBeUndefined();
    });

    it('should throw for non-object values', () => {
      expect(() => validateObject('{}', 'field')).toThrow(ValidationError);
      expect(() => validateObject([], 'field')).toThrow(ValidationError);
    });

    it('should validate with custom validator', () => {
      const validator = (obj: Record<string, unknown>) => {
        if (!obj['required']) throw new Error('Missing required field');
        return { validated: true, ...obj };
      };
      expect(validateObject({ required: true }, 'field', { validator }))
        .toEqual({ validated: true, required: true });
    });
  });

  describe('validateEntityKey', () => {
    it('should accept valid entity keys', () => {
      expect(validateEntityKey({ Id: '123', Type: 'player' }, 'entity'))
        .toEqual({ Id: '123', Type: 'player' });
    });

    it('should throw for missing Id or Type', () => {
      expect(() => validateEntityKey({ Id: '123' }, 'entity'))
        .toThrow(ValidationError);
      expect(() => validateEntityKey({ Type: 'player' }, 'entity'))
        .toThrow(ValidationError);
    });
  });

  describe('validateCurrencyAmount', () => {
    it('should accept valid amounts', () => {
      expect(validateCurrencyAmount(100, 'amount')).toBe(100);
      expect(validateCurrencyAmount(0, 'amount')).toBe(0);
    });

    it('should throw for negative amounts', () => {
      expect(() => validateCurrencyAmount(-1, 'amount'))
        .toThrow(ValidationError);
    });

    it('should throw for non-integer amounts', () => {
      expect(() => validateCurrencyAmount(10.5, 'amount'))
        .toThrow(ValidationError);
    });
  });

  describe('validateItemId', () => {
    it('should accept valid item IDs', () => {
      expect(validateItemId('item_123', 'itemId')).toBe('item_123');
      expect(validateItemId('ITEM-ABC', 'itemId')).toBe('ITEM-ABC');
    });

    it('should throw for invalid characters', () => {
      expect(() => validateItemId('item@123', 'itemId'))
        .toThrow(ValidationError);
      expect(() => validateItemId('item 123', 'itemId'))
        .toThrow(ValidationError);
    });

    it('should validate length constraints', () => {
      expect(() => validateItemId('', 'itemId'))
        .toThrow(ValidationError);
      expect(() => validateItemId('a'.repeat(51), 'itemId'))
        .toThrow(ValidationError);
    });
  });

  describe('validatePlayerId', () => {
    it('should accept valid player IDs', () => {
      expect(validatePlayerId('ABC123', 'playerId')).toBe('ABC123');
      expect(validatePlayerId('1234567890ABCDEF', 'playerId')).toBe('1234567890ABCDEF');
    });

    it('should throw for invalid characters', () => {
      expect(() => validatePlayerId('PLAYER-123', 'playerId'))
        .toThrow(ValidationError);
      expect(() => validatePlayerId('XYZ123', 'playerId'))
        .toThrow(ValidationError);
    });
  });

  describe('validatePaginationCount', () => {
    it('should accept valid counts', () => {
      expect(validatePaginationCount(10, 'count')).toBe(10);
      expect(validatePaginationCount(50, 'count')).toBe(50);
    });

    it('should use default value for undefined', () => {
      expect(validatePaginationCount(undefined, 'count')).toBe(10);
      expect(validatePaginationCount(undefined, 'count', 20)).toBe(20);
    });

    it('should enforce max value', () => {
      expect(() => validatePaginationCount(100, 'count', 10, 50))
        .toThrow(ValidationError);
      expect(() => validatePaginationCount(0, 'count'))
        .toThrow(ValidationError);
    });
  });
});