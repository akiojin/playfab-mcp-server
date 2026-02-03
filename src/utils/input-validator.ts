/**
 * Input validation utilities for API parameters
 */
import { ValidationError } from './errors.js'

/**
 * Validates that a value is a required non-empty string
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
  }
): string {
  const result = validateString(value, fieldName, { ...options, required: true })
  if (result === undefined) {
    throw new ValidationError(`${fieldName} is required`)
  }
  if (result === '') {
    throw new ValidationError(`${fieldName} cannot be empty`)
  }
  return result
}

/**
 * Validates that a value is a non-empty string
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number
    maxLength?: number
    pattern?: RegExp
    required?: boolean
  }
): string | undefined {
  if (value === undefined || value === null) {
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`)
    }
    return undefined
  }

  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`)
  }

  if (options?.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`)
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`)
  }

  if (options?.pattern && !options.pattern.test(value)) {
    throw new ValidationError(`${fieldName} has invalid format`)
  }

  return value
}

/**
 * Validates that a value is a number within range
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options?: {
    min?: number
    max?: number
    integer?: boolean
    required?: boolean
  }
): number | undefined {
  if (value === undefined || value === null) {
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`)
    }
    return undefined
  }

  const num = typeof value === 'number' ? value : Number(value)
  
  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a number`)
  }

  if (options?.integer && !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`)
  }

  if (options?.min !== undefined && num < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min}`)
  }

  if (options?.max !== undefined && num > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max}`)
  }

  return num
}

/**
 * Validates that a value is a boolean
 */
export function validateBoolean(
  value: unknown,
  fieldName: string,
  required = false
): boolean | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`)
    }
    return undefined
  }

  if (typeof value !== 'boolean') {
    throw new ValidationError(`${fieldName} must be a boolean`)
  }

  return value
}

/**
 * Validates that a value is an array
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  options?: {
    minLength?: number
    maxLength?: number
    required?: boolean
    itemValidator?: (item: unknown, index: number) => T
  }
): T[] | undefined {
  if (value === undefined || value === null) {
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`)
    }
    return undefined
  }

  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`)
  }

  if (options?.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must have at least ${options.minLength} items`)
  }

  if (options?.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${options.maxLength} items`)
  }

  if (options?.itemValidator) {
    return value.map((item, index) => options.itemValidator!(item, index))
  }

  return value as T[]
}

/**
 * Validates that a value is an object
 */
export function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  fieldName: string,
  options?: {
    required?: boolean
    validator?: (obj: Record<string, unknown>) => T
  }
): T | undefined {
  if (value === undefined || value === null) {
    if (options?.required) {
      throw new ValidationError(`${fieldName} is required`)
    }
    return undefined
  }

  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an object`)
  }

  const obj = value as Record<string, unknown>

  if (options?.validator) {
    return options.validator(obj)
  }

  return obj as T
}

/**
 * Validates PlayFab entity key
 */
export function validateEntityKey(
  value: unknown,
  fieldName: string,
  required = false
): { Id: string; Type: string } | undefined {
  return validateObject(value, fieldName, {
    required,
    validator: (obj) => {
      const id = validateString(obj['Id'], `${fieldName}.Id`, { required: true })
      const type = validateString(obj['Type'], `${fieldName}.Type`, { required: true })
      
      if (!id || !type) {
        throw new ValidationError(`${fieldName} must have Id and Type`)
      }
      
      return { Id: id, Type: type }
    }
  })
}

/**
 * Validates currency amount
 */
export function validateCurrencyAmount(
  value: unknown,
  fieldName: string
): number {
  const amount = validateNumber(value, fieldName, {
    required: true,
    min: 0,
    integer: true
  })
  
  if (amount === undefined) {
    throw new ValidationError(`${fieldName} is required`)
  }
  
  return amount
}

/**
 * Validates PlayFab item ID
 */
export function validateItemId(
  value: unknown,
  fieldName: string,
  required = true
): string | undefined {
  return validateString(value, fieldName, {
    required,
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/
  })
}

/**
 * Validates PlayFab player ID
 */
export function validatePlayerId(
  value: unknown,
  fieldName: string,
  required = true
): string | undefined {
  return validateString(value, fieldName, {
    required,
    minLength: 1,
    maxLength: 64,
    pattern: /^[A-F0-9]+$/i
  })
}

/**
 * Validates pagination count
 */
export function validatePaginationCount(
  value: unknown,
  fieldName: string,
  defaultValue = 10,
  maxValue = 50
): number {
  const count = validateNumber(value, fieldName, {
    min: 1,
    max: maxValue,
    integer: true
  })
  
  return count ?? defaultValue
}