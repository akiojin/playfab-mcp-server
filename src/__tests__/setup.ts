// Test setup file
import * as dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

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