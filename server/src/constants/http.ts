/**
 * HTTP Status Codes
 * 
 * CONCEPT: HTTP status codes are standardized responses from servers.
 * Using constants makes code more readable and prevents typos.
 * 
 * Categories:
 * - 2xx: Success
 * - 4xx: Client errors (user did something wrong)
 * - 5xx: Server errors (something went wrong on our end)
 */

export const HTTP_STATUS = {
  // Success
  OK: 200,                    // Request succeeded
  CREATED: 201,               // Resource created successfully
  NO_CONTENT: 204,            // Success but no content to return
  
  // Client Errors
  BAD_REQUEST: 400,           // Invalid request (validation error)
  UNAUTHORIZED: 401,          // Not authenticated (need to login)
  FORBIDDEN: 403,             // Authenticated but not allowed
  NOT_FOUND: 404,             // Resource doesn't exist
  CONFLICT: 409,              // Resource already exists
  UNPROCESSABLE_ENTITY: 422,  // Validation failed
  TOO_MANY_REQUESTS: 429,     // Rate limit exceeded
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500, // Something went wrong on server
} as const;

// TypeScript type for status codes
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
