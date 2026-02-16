/**
 * Error Handling Utilities
 *
 * CONCEPT: Centralized error handling utilities for consistent error
 * extraction, type detection, and user-friendly message formatting
 * throughout the application.
 *
 * Features:
 * - Extract error messages from various error types (Axios, Network, Validation)
 * - Detect error types for different handling strategies
 * - Provide user-friendly error messages with context
 * - Network error detection
 *
 * Usage:
 *   import { getErrorMessage, getErrorType, isNetworkError } from '@/lib/errorUtils';
 *
 *   const message = getErrorMessage(error);
 *   const errorType = getErrorType(error);
 */

// =============================================================================
// ERROR TYPES
// =============================================================================

/** Error shape compatible with Axios (for any HTTP client errors) */
interface HttpErrorLike {
  isAxiosError?: boolean;
  response?: { status?: number; data?: unknown };
  code?: string;
  message?: string;
}
/**
 * Error type classification for different handling strategies
 */
export type ErrorType =
  | 'network'        // Network connectivity issues
  | 'timeout'        // Request timeout
  | 'server'         // Server errors (5xx)
  | 'validation'     // Validation errors (400)
  | 'unauthorized'   // Authentication errors (401)
  | 'forbidden'      // Authorization errors (403)
  | 'not_found'      // Resource not found (404)
  | 'conflict'       // Conflict errors (409)
  | 'client'         // Other client errors (4xx)
  | 'unknown';       // Unknown errors

/**
 * Structured error info for detailed handling
 */
export interface ErrorInfo {
  type: ErrorType;
  message: string;
  status?: number;
  details?: string;
  isRetryable: boolean;
}

// =============================================================================
// ERROR TYPE DETECTION
// =============================================================================

/**
 * Check if error is an Axios/HTTP client error
 */
export function isAxiosError(error: unknown): error is HttpErrorLike {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as HttpErrorLike).isAxiosError === true
  );
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  if (isAxiosError(error) && !error.response) {
    if (error.code === 'ERR_NETWORK') return true;
    if (error.code === 'ECONNABORTED') return true;
    if (error.code === 'ECONNREFUSED') return true;
    if (error.code === 'ENOTFOUND') return true;
    if (error.message === 'Network Error') return true;
    return true;
  }

  // Supabase/fetch network errors
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') return true;
    if (error.message?.includes('NetworkError')) return true;
    if (error.message?.includes('Load failed')) return true;
  }

  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.code === 'ECONNABORTED' || (error.message?.includes('timeout') ?? false);
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 400;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 401;
}

/**
 * Check if error is a forbidden/authorization error
 */
export function isForbiddenError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 403;
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  return error.response?.status === 404;
}

/**
 * Check if error is a server error
 */
export function isServerError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status !== undefined && status >= 500;
}

/**
 * Detect the type of error
 */
export function getErrorType(error: unknown): ErrorType {
  if (isTimeoutError(error)) return 'timeout';
  if (isNetworkError(error)) return 'network';

  if (isAxiosError(error) && error.response) {
    const status = error.response.status ?? 0;

    if (status === 400) return 'validation';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not_found';
    if (status === 409) return 'conflict';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500) return 'server';
  }

  return 'unknown';
}

// =============================================================================
// ERROR MESSAGE EXTRACTION
// =============================================================================

/**
 * Extract API error message from HTTP error response
 */
function extractApiErrorMessage(error: HttpErrorLike): string | undefined {
  const data = error.response?.data as Record<string, unknown> | undefined;

  if (data) {
    // Try common error message fields
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.errors === 'string') return data.errors;

    // Handle array of errors
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0];
      if (typeof firstError === 'string') return firstError;
      if (typeof firstError === 'object' && firstError?.message) {
        return String(firstError.message);
      }
    }

    // Handle validation errors object
    if (typeof data.errors === 'object' && data.errors !== null) {
      const errorValues = Object.values(data.errors);
      if (errorValues.length > 0) {
        const firstError = errorValues[0];
        if (typeof firstError === 'string') return firstError;
        if (Array.isArray(firstError) && firstError[0]) {
          return String(firstError[0]);
        }
      }
    }
  }

  return undefined;
}

/**
 * Get user-friendly error message based on error type
 */
function getDefaultErrorMessage(errorType: ErrorType): string {
  switch (errorType) {
    case 'network':
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    case 'timeout':
      return 'The request timed out. The server may be slow. Please try again.';
    case 'server':
      return 'A server error occurred. Please try again in a moment.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'unauthorized':
      return 'Your session has expired. Please log in again.';
    case 'forbidden':
      return "You don't have permission to perform this action.";
    case 'not_found':
      return 'The requested resource was not found.';
    case 'conflict':
      return 'This action conflicts with existing data. Please refresh and try again.';
    case 'client':
      return 'There was an issue with your request. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Extract user-friendly error message from any error type
 *
 * This is the main function to use for displaying error messages to users.
 *
 * @param error - The error to extract message from
 * @returns User-friendly error message
 *
 * Usage:
 *   catch (error) {
 *     toast.error(getErrorMessage(error));
 *   }
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (error === null || error === undefined) {
    return 'An unexpected error occurred.';
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    // First, try to extract API error message
    const apiMessage = extractApiErrorMessage(error);
    if (apiMessage) {
      return apiMessage;
    }

    // Fall back to default message based on error type
    const errorType = getErrorType(error);
    return getDefaultErrorMessage(errorType);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Return the error message if it's meaningful
    if (error.message && error.message !== 'undefined') {
      return error.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle objects with message property
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
  }

  // Fallback
  return 'An unexpected error occurred.';
}

// =============================================================================
// DETAILED ERROR INFO
// =============================================================================

/**
 * Get detailed error information for advanced error handling
 *
 * @param error - The error to analyze
 * @returns Detailed error information
 *
 * Usage:
 *   const errorInfo = getErrorInfo(error);
 *   if (errorInfo.isRetryable) {
 *     showRetryButton();
 *   }
 */
export function getErrorInfo(error: unknown): ErrorInfo {
  const type = getErrorType(error);
  const message = getErrorMessage(error);

  let status: number | undefined;
  let details: string | undefined;

  if (isAxiosError(error) && error.response) {
    status = error.response.status;
    const data = error.response.data as Record<string, unknown> | undefined;
    if (data && typeof data.details === 'string') {
      details = data.details;
    }
  }

  // Determine if error is retryable
  const isRetryable =
    type === 'network' ||
    type === 'timeout' ||
    type === 'server';

  return {
    type,
    message,
    status,
    details,
    isRetryable,
  };
}

// =============================================================================
// CONTEXTUAL ERROR MESSAGES
// =============================================================================

/**
 * Get error message with context (e.g., "Failed to load budgets")
 *
 * @param error - The error to extract message from
 * @param context - The context/action being performed
 * @returns Contextual error message
 *
 * Usage:
 *   const message = getContextualErrorMessage(error, 'load budgets');
 *   // Returns: "Failed to load budgets. Unable to connect to server."
 */
export function getContextualErrorMessage(
  error: unknown,
  context: string
): string {
  const errorType = getErrorType(error);

  // For network/server errors, provide helpful context
  if (errorType === 'network') {
    return `Failed to ${context}. Please check your internet connection.`;
  }

  if (errorType === 'timeout') {
    return `Failed to ${context}. The request timed out. Please try again.`;
  }

  if (errorType === 'server') {
    return `Failed to ${context}. Server error occurred. Please try again later.`;
  }

  if (errorType === 'unauthorized') {
    return `Failed to ${context}. Please log in and try again.`;
  }

  // For other errors, try to get the API message
  const apiMessage = getErrorMessage(error);

  // If we have a specific API message, use it with context
  if (apiMessage && apiMessage !== getDefaultErrorMessage(errorType)) {
    return `Failed to ${context}. ${apiMessage}`;
  }

  // Generic fallback
  return `Failed to ${context}. Please try again.`;
}

// =============================================================================
// FORM ERROR HELPERS
// =============================================================================

/**
 * Extract field-level errors from API validation response
 *
 * @param error - The error to extract field errors from
 * @returns Object mapping field names to error messages
 *
 * Usage:
 *   const fieldErrors = getFieldErrors(error);
 *   // Returns: { email: "Email is required", password: "Password too short" }
 */
export function getFieldErrors(
  error: unknown
): Record<string, string> | undefined {
  if (!isAxiosError(error) || !error.response) return undefined;

  const data = error.response.data as Record<string, unknown> | undefined;
  if (!data) return undefined;

  // Handle errors object with field names as keys
  if (typeof data.errors === 'object' && data.errors !== null) {
    const fieldErrors: Record<string, string> = {};
    const errors = data.errors as Record<string, unknown>;

    for (const [field, value] of Object.entries(errors)) {
      if (typeof value === 'string') {
        fieldErrors[field] = value;
      } else if (Array.isArray(value) && value[0]) {
        fieldErrors[field] = String(value[0]);
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      return fieldErrors;
    }
  }

  return undefined;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getErrorMessage,
  getErrorType,
  getErrorInfo,
  getContextualErrorMessage,
  getFieldErrors,
  isNetworkError,
  isTimeoutError,
  isValidationError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isServerError,
  isAxiosError,
};
