/**
 * Pagination Component
 *
 * CONCEPT: Simple Prev/Next pagination for transaction lists.
 * Shows current page info and navigation buttons.
 *
 * Features:
 * - Disabled states for first/last pages
 * - Shows current page and total pages
 * - Keyboard accessible
 *
 * Usage:
 *   <Pagination
 *     currentPage={1}
 *     totalPages={5}
 *     onPageChange={setPage}
 *   />
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrev}
        className="gap-1"
        aria-label={`Go to previous page${canGoPrev ? `, page ${currentPage - 1}` : ''}`}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      {/* Page Indicator */}
      <nav className="flex items-center gap-2" aria-label="Pagination">
        {/* Page numbers for desktop */}
        <div className="hidden sm:flex sm:items-center sm:gap-1" role="list">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}${page === currentPage ? ', current page' : ''}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                'h-8 w-8 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-grey-900)] focus-visible:ring-offset-2',
                page === currentPage
                  ? 'bg-[var(--color-grey-900)] text-white'
                  : 'text-[var(--color-grey-500)] hover:bg-[var(--color-beige-100)]'
              )}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Mobile: Just show current/total */}
        <span className="text-sm text-[var(--color-grey-500)] sm:hidden" aria-live="polite">
          Page {currentPage} of {totalPages}
        </span>
      </nav>

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="gap-1"
        aria-label={`Go to next page${canGoNext ? `, page ${currentPage + 1}` : ''}`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
