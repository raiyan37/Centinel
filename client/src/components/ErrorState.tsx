/**
 * Error State Component
 *
 * CONCEPT: A reusable error state component for displaying errors
 * in pages with consistent styling and retry functionality.
 *
 * Features:
 * - Different error icons based on error type
 * - User-friendly error messages
 * - Retry button for recoverable errors
 * - Matches design system styling
 *
 * Usage:
 *   <ErrorState
 *     error={error}
 *     title="Error loading budgets"
 *     onRetry={() => refetch()}
 *   />
 */

import { AlertCircle, WifiOff, ServerCrash, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  getErrorMessage,
  getErrorInfo,
  type ErrorType,
} from '@/lib/errorUtils';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorStateProps {
  /** The error object */
  error: unknown;
  /** Custom title for the error (e.g., "Error loading budgets") */
  title?: string;
  /** Callback for retry button */
  onRetry?: () => void;
  /** Show detailed error message (useful for debugging) */
  showDetails?: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Get icon component based on error type
 */
function getErrorIcon(errorType: ErrorType) {
  switch (errorType) {
    case 'network':
      return WifiOff;
    case 'timeout':
      return Clock;
    case 'server':
      return ServerCrash;
    default:
      return AlertCircle;
  }
}

/**
 * Get title based on error type
 */
function getDefaultTitle(errorType: ErrorType): string {
  switch (errorType) {
    case 'network':
      return 'Connection Error';
    case 'timeout':
      return 'Request Timeout';
    case 'server':
      return 'Server Error';
    case 'unauthorized':
      return 'Authentication Required';
    case 'forbidden':
      return 'Access Denied';
    case 'not_found':
      return 'Not Found';
    default:
      return 'Something went wrong';
  }
}

/**
 * Get helpful suggestion based on error type
 */
function getHelpfulSuggestion(errorType: ErrorType): string {
  switch (errorType) {
    case 'network':
      return 'Please check your internet connection and try again.';
    case 'timeout':
      return 'The server is taking too long to respond. Please try again.';
    case 'server':
      return 'We\'re having trouble with our servers. Please try again in a moment.';
    case 'unauthorized':
      return 'Your session may have expired. Please log in again.';
    case 'forbidden':
      return 'You don\'t have permission to access this resource.';
    case 'not_found':
      return 'The requested resource could not be found.';
    default:
      return 'Please try again or contact support if the problem persists.';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ErrorState - Display error with helpful message and retry option
 */
export function ErrorState({
  error,
  title,
  onRetry,
  showDetails = false,
}: ErrorStateProps) {
  const errorInfo = getErrorInfo(error);
  const Icon = getErrorIcon(errorInfo.type);
  const displayTitle = title || getDefaultTitle(errorInfo.type);
  const suggestion = getHelpfulSuggestion(errorInfo.type);
  const errorMessage = getErrorMessage(error);

  return (
    <div className="rounded-xl bg-white p-8 shadow-sm text-center">
      {/* Error Icon */}
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[var(--color-red)]" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--color-grey-900)] mb-2">
        {displayTitle}
      </h3>

      {/* Error Message */}
      <p className="text-[var(--color-grey-500)] mb-2">
        {errorMessage}
      </p>

      {/* Helpful Suggestion */}
      <p className="text-sm text-[var(--color-grey-500)] mb-6">
        {suggestion}
      </p>

      {/* Retry Button (for retryable errors) */}
      {onRetry && errorInfo.isRetryable && (
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}

      {/* Error Details (for debugging) */}
      {showDetails && errorInfo.status && (
        <p className="mt-4 text-xs text-[var(--color-grey-500)]">
          Error code: {errorInfo.status}
        </p>
      )}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ErrorState;
