/**
 * Loading Fallback Component
 *
 * CONCEPT: A reusable loading component for React Suspense fallbacks.
 * Used when lazy-loaded route components are being fetched.
 *
 * Key Features:
 * - Matches design system styling
 * - Full page or inline variants
 * - Consistent loading experience across all routes
 *
 * Usage:
 *   <Suspense fallback={<LoadingFallback />}>
 *     <LazyComponent />
 *   </Suspense>
 *
 *   // Inline variant (for smaller sections)
 *   <Suspense fallback={<LoadingFallback variant="inline" />}>
 *     <LazyComponent />
 *   </Suspense>
 */

import { Loader2 } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

interface LoadingFallbackProps {
  /** Loading variant - fullPage for route transitions, inline for smaller sections */
  variant?: 'fullPage' | 'inline';
  /** Optional custom message */
  message?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * LoadingFallback - Loading indicator for Suspense boundaries
 *
 * Provides a consistent loading experience matching the design system.
 * Use fullPage variant for route loading, inline for component loading.
 */
export function LoadingFallback({
  variant = 'fullPage',
  message,
}: LoadingFallbackProps) {
  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-grey-500)]" />
          {message && (
            <p className="text-sm text-[var(--color-grey-500)]">{message}</p>
          )}
        </div>
      </div>
    );
  }

  // Full page loading (default for route transitions)
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-beige-100)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-grey-500)]" />
        {message && (
          <p className="text-sm text-[var(--color-grey-500)]">{message}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// ROUTE LOADING FALLBACK
// =============================================================================

/**
 * RouteLoadingFallback - Specific loading for route transitions
 *
 * Used inside the app layout (with sidebar visible).
 * Shows loading in the main content area only.
 */
export function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-grey-500)]" />
        <p className="text-sm text-[var(--color-grey-500)]">Loading...</p>
      </div>
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default LoadingFallback;
