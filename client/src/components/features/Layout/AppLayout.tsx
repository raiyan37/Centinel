/**
 * App Layout Component
 * 
 * CONCEPT: This is the main layout wrapper for the application.
 * It includes the sidebar navigation and renders child routes via Outlet.
 * 
 * Layout structure:
 * - Desktop: Sidebar on left, main content on right
 * - Mobile: Bottom navigation, content above
 * 
 * Error Handling:
 * - RouteErrorBoundary wraps the Outlet to catch page-level errors
 * - Keeps the sidebar visible when a page error occurs
 * - Allows users to navigate to other pages when one page fails
 */

import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[var(--color-beige-100)]">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <Sidebar />
      
      {/* Main content area */}
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8 lg:ml-[300px]">
        {/* Route-level error boundary keeps sidebar visible on page errors */}
        <RouteErrorBoundary showDetails={import.meta.env.DEV}>
          <Outlet />
        </RouteErrorBoundary>
      </main>
    </div>
  );
}
