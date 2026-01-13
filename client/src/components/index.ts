/**
 * Components Index
 *
 * CONCEPT: Central export file for shared components.
 * Import components from '@/components' for cleaner imports.
 *
 * Note: UI primitives are exported from '@/components/ui'
 * Note: Feature components are exported from their respective folders
 *       e.g., '@/components/features/Budgets'
 *
 * Usage:
 *   import { ErrorBoundary, RouteErrorBoundary } from '@/components';
 */

// Error Boundaries
export { ErrorBoundary } from './ErrorBoundary';
export { RouteErrorBoundary } from './RouteErrorBoundary';

// Error State
export { ErrorState } from './ErrorState';

// Loading Fallbacks
export { LoadingFallback, RouteLoadingFallback } from './LoadingFallback';
