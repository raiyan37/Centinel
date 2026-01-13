/**
 * Route Error Boundary Component
 *
 * CONCEPT: A specialized error boundary wrapper designed for route-level error
 * handling. It wraps the ErrorBoundary component and provides route-specific
 * context for better error messages.
 *
 * Key Features:
 * - Route-specific error UI with page name
 * - Keeps the app layout (sidebar) visible while showing error for the page content
 * - Provides context-aware error messages
 * - Inherits all ErrorBoundary functionality
 *
 * Usage:
 *   // In AppLayout.tsx wrapping <Outlet />
 *   <RouteErrorBoundary>
 *     <Outlet />
 *   </RouteErrorBoundary>
 *
 *   // With page name for better error messages
 *   <RouteErrorBoundary pageName="Budgets">
 *     <BudgetsPage />
 *   </RouteErrorBoundary>
 */

import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home, RotateCcw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

// =============================================================================
// TYPES
// =============================================================================

interface RouteErrorBoundaryProps {
  /** Child components to wrap */
  children: React.ReactNode;
  /** Optional page name for error message context */
  pageName?: string;
  /** Optional: Show detailed error information (useful for development) */
  showDetails?: boolean;
}

interface RouteErrorBoundaryState {
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
// ROUTE ERROR BOUNDARY COMPONENT
// =============================================================================

/**
 * RouteErrorBoundary - Class component for route-level error catching
 *
 * Must be a class component to use React's error boundary lifecycle methods.
 * Provides a route-specific error UI that fits within the app layout.
 */
class RouteErrorBoundaryClass extends React.Component<
  RouteErrorBoundaryProps & { location: string; onNavigate: (path: string) => void; onGoBack: () => void },
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps & { location: string; onNavigate: (path: string) => void; onGoBack: () => void }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<RouteErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('RouteErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Reset error state when location changes (user navigates away)
   */
  componentDidUpdate(prevProps: RouteErrorBoundaryProps & { location: string }): void {
    if (this.state.hasError && prevProps.location !== this.props.location) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        showErrorDetails: false,
      });
    }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  handleGoHome = (): void => {
    this.props.onNavigate('/overview');
  };

  handleGoBack = (): void => {
    this.props.onGoBack();
  };

  handleReload = (): void => {
    window.location.reload();
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({
      showErrorDetails: !prev.showErrorDetails,
    }));
  };

  render(): React.ReactNode {
    const { hasError, error, errorInfo, showErrorDetails } = this.state;
    const { children, pageName, showDetails = false } = this.props;

    if (hasError) {
      const pageTitle = pageName || 'this page';

      return (
        <div className="space-y-6 pb-20 lg:pb-0">
          {/* Page Header - Maintains consistency with other pages */}
          {pageName && (
            <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
              {pageName}
            </h1>
          )}

          {/* Error Card */}
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            {/* Error Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--color-red)]/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-[var(--color-red)]" />
            </div>

            {/* Error Title */}
            <h2 className="text-xl font-bold text-[var(--color-grey-900)] mb-2">
              Error loading {pageTitle}
            </h2>

            {/* Error Description */}
            <p className="text-[var(--color-grey-500)] mb-6 max-w-md mx-auto">
              Something went wrong while loading {pageTitle}. This might be a
              temporary issue. Please try again or navigate to another page.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRetry} variant="default">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleGoBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={this.handleGoHome} variant="secondary">
                <Home className="w-4 h-4 mr-2" />
                Overview
              </Button>
              <Button onClick={this.handleReload} variant="ghost">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload
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

    return children;
  }
}

// =============================================================================
// WRAPPER WITH HOOKS
// =============================================================================

/**
 * RouteErrorBoundary - Wrapper component that provides React Router hooks
 *
 * Since class components cannot use hooks directly, we wrap the class component
 * with a functional component that provides the necessary router context.
 */
export function RouteErrorBoundary({
  children,
  pageName,
  showDetails,
}: RouteErrorBoundaryProps): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <RouteErrorBoundaryClass
      location={location.pathname}
      onNavigate={handleNavigate}
      onGoBack={handleGoBack}
      pageName={pageName}
      showDetails={showDetails}
    >
      {children}
    </RouteErrorBoundaryClass>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default RouteErrorBoundary;
