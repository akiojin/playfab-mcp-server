/**
 * Global test setup
 */
import * as dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Set default test environment variables if not provided
process.env['PLAYFAB_TITLE_ID'] = process.env['PLAYFAB_TITLE_ID'] || '1A2B3';
process.env['PLAYFAB_DEV_SECRET_KEY'] = process.env['PLAYFAB_DEV_SECRET_KEY'] || 'testsecretkey123456789012345678901234567890';
process.env['NODE_ENV'] = 'test';

// Mock PlayFab SDK
jest.mock('playfab-sdk')

// Mock console.error to reduce noise in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn((...args) => {
    // Only log errors that aren't expected in tests
    if (!args[0]?.includes?.('Expected error')) {
      originalError(...args)
    }
  })
})

afterAll(() => {
  console.error = originalError
})