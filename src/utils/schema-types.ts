/**
 * Utilities for generating TypeScript types from tool input schemas
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * JSON Schema property definition
 */
export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

/**
 * JSON Schema definition
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Converts a JSON Schema property type to TypeScript type
 */
export function jsonSchemaTypeToTsType(property: JSONSchemaProperty): string {
  switch (property.type) {
    case 'string':
      if (property.enum) {
        return property.enum.map(value => `'${value}'`).join(' | ');
      }
      return 'string';
    
    case 'number':
    case 'integer':
      return 'number';
    
    case 'boolean':
      return 'boolean';
    
    case 'array':
      if (property.items) {
        const itemType = jsonSchemaTypeToTsType(property.items);
        return `${itemType}[]`;
      }
      return 'unknown[]';
    
    case 'object':
      if (property.properties) {
        const props = Object.entries(property.properties)
          .map(([key, prop]) => {
            const optional = !property.required?.includes(key) ? '?' : '';
            const propType = jsonSchemaTypeToTsType(prop);
            return `  ${key}${optional}: ${propType};`;
          })
          .join('\n');
        return `{\n${props}\n}`;
      }
      return 'Record<string, unknown>';
    
    default:
      return 'unknown';
  }
}

/**
 * Generates a TypeScript interface from a JSON Schema
 */
export function generateInterfaceFromSchema(
  name: string, 
  schema: JSONSchema
): string {
  if (schema.type !== 'object' || !schema.properties) {
    return `export interface ${name} {\n  [key: string]: unknown;\n}`;
  }

  const requiredProps = new Set(schema.required || []);
  
  const props = Object.entries(schema.properties)
    .map(([key, property]) => {
      const optional = !requiredProps.has(key) ? '?' : '';
      const tsType = jsonSchemaTypeToTsType(property);
      const comment = property.description 
        ? `  /** ${property.description} */\n`
        : '';
      
      return `${comment}  ${key}${optional}: ${tsType};`;
    })
    .join('\n');

  return `export interface ${name} {\n${props}\n}`;
}

/**
 * Converts a tool name to a PascalCase interface name
 */
export function toolNameToInterfaceName(toolName: string): string {
  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Params';
}

/**
 * Generates TypeScript types for tool input parameters
 */
export function generateToolInputTypes(tools: Tool[]): string {
  const interfaces = tools.map(tool => {
    const interfaceName = toolNameToInterfaceName(tool.name);
    const schema = tool.inputSchema as JSONSchema;
    
    return generateInterfaceFromSchema(interfaceName, schema);
  });

  const header = `/**
 * Auto-generated TypeScript types for tool input parameters
 * Generated from MCP tool schemas
 */

import { HandlerParams } from '../types/index.js';

`;

  const extendedInterfaces = tools.map(tool => {
    const interfaceName = toolNameToInterfaceName(tool.name);
    const baseName = interfaceName.replace('Params', 'BaseParams');
    
    return `export interface ${interfaceName} extends HandlerParams<${baseName}> {}`;
  });

  return header + 
    interfaces.join('\n\n') + '\n\n' +
    '// Extended interfaces with HandlerParams\n' +
    extendedInterfaces.join('\n');
}

/**
 * Validates that an object matches a JSON Schema
 */
export function validateAgainstSchema(
  data: unknown, 
  schema: JSONSchema,
  fieldName = 'data'
): void {
  if (schema.type === 'object' && typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const requiredProps = schema.required || [];
    
    // Check required properties
    for (const prop of requiredProps) {
      if (!(prop in obj)) {
        throw new Error(`Missing required property: ${fieldName}.${prop}`);
      }
    }
    
    // Validate each property
    if (schema.properties) {
      for (const [key, value] of Object.entries(obj)) {
        const propSchema = schema.properties[key];
        if (propSchema) {
          validatePropertyAgainstSchema(value, propSchema, `${fieldName}.${key}`);
        }
      }
    }
  } else if (schema.type !== typeof data) {
    throw new Error(`Expected ${schema.type} but got ${typeof data} for ${fieldName}`);
  }
}

/**
 * Validates a property value against its schema
 */
function validatePropertyAgainstSchema(
  value: unknown,
  schema: JSONSchemaProperty,
  fieldPath: string
): void {
  if (value === undefined || value === null) {
    return; // Optional properties are allowed to be undefined
  }

  switch (schema.type) {
    case 'string':
      if (typeof value !== 'string') {
        throw new Error(`Expected string but got ${typeof value} for ${fieldPath}`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        throw new Error(`Value '${value}' is not in allowed enum for ${fieldPath}`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        throw new Error(`Value '${value}' does not match pattern for ${fieldPath}`);
      }
      break;
      
    case 'number':
    case 'integer':
      if (typeof value !== 'number') {
        throw new Error(`Expected number but got ${typeof value} for ${fieldPath}`);
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
        throw new Error(`Value ${value} is below minimum ${schema.minimum} for ${fieldPath}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        throw new Error(`Value ${value} is above maximum ${schema.maximum} for ${fieldPath}`);
      }
      if (schema.type === 'integer' && !Number.isInteger(value)) {
        throw new Error(`Expected integer but got ${value} for ${fieldPath}`);
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') {
        throw new Error(`Expected boolean but got ${typeof value} for ${fieldPath}`);
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        throw new Error(`Expected array but got ${typeof value} for ${fieldPath}`);
      }
      if (schema.items) {
        value.forEach((item, index) => {
          validatePropertyAgainstSchema(item, schema.items!, `${fieldPath}[${index}]`);
        });
      }
      break;
      
    case 'object':
      if (typeof value !== 'object' || value === null) {
        throw new Error(`Expected object but got ${typeof value} for ${fieldPath}`);
      }
      if (schema.properties) {
        const objSchema: JSONSchema = {
          type: 'object',
          properties: schema.properties,
          required: schema.required
        };
        validateAgainstSchema(value, objSchema, fieldPath);
      }
      break;
  }
}

/**
 * Creates a type-safe parameter validator for a specific tool
 */
export function createToolValidator(tool: Tool) {
  const schema = tool.inputSchema as JSONSchema;
  
  return function validateToolParams(params: unknown): void {
    validateAgainstSchema(params, schema, tool.name);
  };
}