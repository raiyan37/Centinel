/**
 * App Component
 *
 * Main application component with routing setup.
 * Includes authentication providers and protected routes.
 *
 * Code Splitting:
 * - Page components are lazy-loaded using React.lazy()
 * - Each route loads its chunk on-demand
 * - Suspense provides loading fallback during chunk loading
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Context
import { AuthProvider, useAuth } from '@/contexts';

// Layout - loaded immediately (small, always needed)
import { AppLayout } from '@/components/features/Layout/AppLayout';

// Error Boundary - loaded immediately (needed for error handling)
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Loading Fallback for Suspense
import { LoadingFallback, RouteLoadingFallback } from '@/components/LoadingFallback';

// =============================================================================
// LAZY-LOADED PAGES
// =============================================================================

// Auth pages (guest routes)
const LoginPage = lazy(() =>
  import('@/pages/Login').then((module) => ({ default: module.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('@/pages/Register').then((module) => ({ default: module.RegisterPage }))
);

// Protected pages (app routes)
const OverviewPage = lazy(() =>
  import('@/pages/Overview').then((module) => ({ default: module.OverviewPage }))
);
const TransactionsPage = lazy(() =>
  import('@/pages/Transactions').then((module) => ({ default: module.TransactionsPage }))
);
const BudgetsPage = lazy(() =>
  import('@/pages/Budgets').then((module) => ({ default: module.BudgetsPage }))
);
const PotsPage = lazy(() =>
  import('@/pages/Pots').then((module) => ({ default: module.PotsPage }))
);
const RecurringBillsPage = lazy(() =>
  import('@/pages/RecurringBills').then((module) => ({ default: module.RecurringBillsPage }))
);

// =============================================================================
// CONFIGURATION
// =============================================================================

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      // Don't retry on server errors (5xx) - retrying won't help
      // Retry only on network/timeout errors, up to 2 times
      retry: (failureCount, error) => {
        // Don't retry more than 2 times
        if (failureCount >= 2) return false;
        
        // Check if it's an Axios error with a response (server error)
        if (
          error &&
          typeof error === 'object' &&
          'isAxiosError' in error &&
          (error as { response?: { status?: number } }).response?.status
        ) {
          const status = (error as { response: { status: number } }).response.status;
          // Don't retry on 4xx or 5xx errors
          if (status >= 400) return false;
        }
        
        // Retry on network errors (no response)
        return true;
      },
      // Faster initial retry for network issues
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Google OAuth Client ID from environment variable
// Set this in .env file: VITE_GOOGLE_CLIENT_ID=your-client-id
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// =============================================================================
// ROUTE GUARDS
// =============================================================================

/**
 * Protected Route
 *
 * Requires authentication. Redirects to login if not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige-100)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-grey-500)]" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

/**
 * Guest Route
 *
 * For auth pages. Redirects to app if already authenticated.
 * 
 * NOTE: We don't show a loading spinner here because it would unmount
 * the login/register page during auth operations, losing any error state.
 * The login form has its own loading state via isSubmitting.
 */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  // Redirect to app if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/overview" replace />;
  }

  return <>{children}</>;
}

// =============================================================================
// APP ROUTES
// =============================================================================

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes (guest only) - full page loading */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Suspense fallback={<LoadingFallback />}>
              <LoginPage />
            </Suspense>
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Suspense fallback={<LoadingFallback />}>
              <RegisterPage />
            </Suspense>
          </GuestRoute>
        }
      />

      {/* Protected app routes with sidebar layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/overview" replace />} />
        {/* Route loading uses RouteLoadingFallback (sidebar stays visible) */}
        <Route
          path="/overview"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <OverviewPage />
            </Suspense>
          }
        />
        <Route
          path="/transactions"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <TransactionsPage />
            </Suspense>
          }
        />
        <Route
          path="/budgets"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <BudgetsPage />
            </Suspense>
          }
        />
        <Route
          path="/pots"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <PotsPage />
            </Suspense>
          }
        />
        <Route
          path="/recurring-bills"
          element={
            <Suspense fallback={<RouteLoadingFallback />}>
              <RecurringBillsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Catch all - redirect to overview (or login if not authenticated) */}
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}

// =============================================================================
// MAIN APP
// =============================================================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthProvider>
            {/* Top-level error boundary catches any unhandled errors */}
            <ErrorBoundary showDetails={import.meta.env.DEV}>
              <AppRoutes />
            </ErrorBoundary>
            {/* Toast notifications */}
            <Toaster
              position="bottom-right"
              toastOptions={{
                // Default options for all toasts
                duration: 4000,
                style: {
                  background: '#201F24', // --color-grey-900
                  color: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                },
                // Success toast styling
                success: {
                  iconTheme: {
                    primary: '#277C78', // --color-green
                    secondary: '#FFFFFF',
                  },
                },
                // Error toast styling
                error: {
                  iconTheme: {
                    primary: '#C94736', // --color-red
                    secondary: '#FFFFFF',
                  },
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
