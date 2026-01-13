/**
 * Error Boundary Component
 *
 * CONCEPT: A class component that catches JavaScript errors anywhere in its
 * child component tree, logs those errors, and displays a fallback UI instead
 * of crashing the entire component tree.
 *
 * Key Features:
 * - Catches errors during rendering, in lifecycle methods, and in constructors
 * - Provides user-friendly error UI with recovery options
 * - Matches the design system styling
 * - Can be used at multiple levels (app-wide, route-level, component-level)
 *
 * Note: Error boundaries do NOT catch errors in:
 * - Event handlers (use try/catch in the handler)
 * - Asynchronous code (e.g., setTimeout, promises)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 *   // With custom fallback
 *   <ErrorBoundary fallback={<CustomError />}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */

import * as React from 'react';
import { AlertTriangle, RefreshCw, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';

// =============================================================================
// TYPES
// =============================================================================

interface ErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Optional custom fallback UI to render when an error is caught */
  fallback?: React.ReactNode;
  /** Optional callback when an error is caught */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Optional: Show detailed error information (useful for development) */
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error */
  error: Error | null;
  /** Additional error info from React */
  errorInfo: React.ErrorInfo | null;
  /** Whether error details are expanded */
  showErrorDetails: boolean;
}

// =============================================================================
// ERROR BOUNDARY COMPONENT
// =============================================================================

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  /**
   * Update state so the next render shows the fallback UI.
   * Called during the "render" phase, so no side effects allowed.
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Log error information.
   * Called during the "commit" phase, so side effects are allowed.
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Store error info in state for display
    this.setState({ errorInfo });

    // Log to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Reset the error boundary state to allow retry
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  /**
   * Navigate to home page
   */
  handleGoHome = (): void => {
    window.location.href = '/overview';
  };

  /**
   * Reload the page
   */
  handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Toggle error details visibility
   */
  toggleDetails = (): void => {
    this.setState((prev) => ({
      showErrorDetails: !prev.showErrorDetails,
    }));
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, showErrorDetails } = this.state;
    const { children, fallback, showDetails = false } = this.props;

    // If there's an error, render the fallback UI
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI matching the design system
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow-sm text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[var(--color-red)]" />
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-bold text-[var(--color-grey-900)] mb-2">
              Something went wrong
            </h2>

            {/* Error Description */}
            <p className="text-[var(--color-grey-500)] mb-6">
              We're sorry, but something unexpected happened. Please try again
              or go back to the home page.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              <Button onClick={this.handleReload} variant="ghost">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>

            {/* Error Details (Development/Debug) */}
            {showDetails && error && (
              <div className="mt-6 text-left">
                <button
                  onClick={this.toggleDetails}
                  className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] underline mb-2"
                >
                  {showErrorDetails ? 'Hide' : 'Show'} error details
                </button>

                {showErrorDetails && (
                  <div className="mt-2 p-4 bg-[var(--color-beige-100)] rounded-lg overflow-auto max-h-60">
                    <p className="text-sm font-medium text-[var(--color-red)] mb-2">
                      {error.name}: {error.message}
                    </p>
                    {errorInfo?.componentStack && (
                      <pre className="text-xs text-[var(--color-grey-500)] whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // No error - render children normally
    return children;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ErrorBoundary;
