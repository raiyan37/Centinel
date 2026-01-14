/**
 * Transactions Page
 *
 * CONCEPT: Displays a list of transactions with full filtering capabilities.
 * This is the first page built as per the implementation plan (Phase 9).
 *
 * Features:
 * - Search by transaction name (debounced)
 * - Sort by: Latest, Oldest, A-Z, Z-A, Highest, Lowest
 * - Filter by category
 * - Pagination (10 items per page)
 * - Desktop table / Mobile card layouts
 *
 * State Management:
 * - Uses React state for filters (search, sort, category, page)
 * - React Query for data fetching with automatic caching
 * - URL search params for shareable filter state
 */

import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTransactions } from '@/queryHooks';
import { ErrorState } from '@/components';
import { Button } from '@/components/ui';
import {
  SearchInput,
  SortSelect,
  CategoryFilter,
  Pagination,
  TransactionItem,
  AddTransactionForm,
  type SortOption,
} from '@/components/features/Transactions';
import type { TransactionParams } from '@/lib/api';

// Number of transactions per page
const PAGE_SIZE = 10;

export function TransactionsPage() {
  // Modal state
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // URL search params for shareable state
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse current filter state from URL
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const searchTerm = searchParams.get('search') || '';
  const sortBy = (searchParams.get('sort') as SortOption) || 'Latest';
  const category = searchParams.get('filter') || 'All Transactions';

  /**
   * Update URL search params
   * This keeps the filter state in the URL so it can be shared/bookmarked
   */
  const updateParams = React.useCallback(
    (updates: Partial<Record<string, string>>) => {
      const newParams = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== getDefaultValue(key)) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });

      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  /**
   * Get default value for a param (for cleanup)
   */
  function getDefaultValue(key: string): string {
    switch (key) {
      case 'page':
        return '1';
      case 'sort':
        return 'Latest';
      case 'filter':
        return 'All Transactions';
      default:
        return '';
    }
  }

  // Build query params for API
  const queryParams: TransactionParams = React.useMemo(() => {
    const params: TransactionParams = {
      page: currentPage,
      limit: PAGE_SIZE,
      sort: sortBy,
    };

    if (searchTerm) {
      params.search = searchTerm;
    }

    if (category && category !== 'All Transactions') {
      params.filter = category;
    }

    return params;
  }, [currentPage, searchTerm, sortBy, category]);

  // Fetch transactions with React Query
  const { data, isLoading, error, isFetching, refetch } = useTransactions(queryParams);

  // Handlers for filter changes
  const handleSearchChange = React.useCallback(
    (value: string) => {
      updateParams({ search: value, page: '1' }); // Reset to page 1 on search
    },
    [updateParams]
  );

  const handleSortChange = React.useCallback(
    (value: SortOption) => {
      updateParams({ sort: value, page: '1' });
    },
    [updateParams]
  );

  const handleCategoryChange = React.useCallback(
    (value: string) => {
      updateParams({ filter: value, page: '1' });
    },
    [updateParams]
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      updateParams({ page: String(page) });
      // Scroll to top of list
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateParams]
  );

  // Derived data
  const transactions = data?.data.transactions ?? [];
  const totalPages = data?.data.pages ?? 1;
  const total = data?.data.total ?? 0;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Transactions
        </h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionForm open={isAddOpen} onOpenChange={setIsAddOpen} />

      {/* Main Content Card */}
      <div className="rounded-xl bg-white p-5 md:p-8 shadow-sm">
        {/* Filters Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          {/* Search Input */}
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search transaction"
            className="w-full md:w-80"
          />

          {/* Sort & Category Filters */}
          <div className="flex items-center gap-4">
            <SortSelect value={sortBy} onValueChange={handleSortChange} />
            <CategoryFilter value={category} onValueChange={handleCategoryChange} />
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-12 text-center" role="status" aria-live="polite">
            <div 
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--color-grey-300)] border-r-[var(--color-grey-900)]"
              aria-hidden="true"
            />
            <p className="mt-4 text-[var(--color-grey-500)]">Loading transactions...</p>
            <span className="sr-only">Loading transactions, please wait...</span>
          </div>
        ) : error ? (
          /* Error State */
          <ErrorState
            error={error}
            title="Error loading transactions"
            onRetry={() => refetch()}
          />
        ) : transactions.length === 0 ? (
          /* Empty State */
          <div className="py-12 text-center">
            <p className="text-[var(--color-grey-900)] font-medium">
              No transactions found
            </p>
            <p className="mt-2 text-sm text-[var(--color-grey-500)]">
              {searchTerm || category !== 'All Transactions'
                ? 'Try adjusting your search or filters.'
                : 'Your transactions will appear here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:gap-4 md:pb-3 md:border-b md:border-[var(--color-grey-100)]">
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Recipient / Sender
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Category
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Transaction Date
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)] text-right">
                Amount
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)] w-8">
                {/* Actions column */}
              </span>
            </div>

            {/* Transaction List */}
            <div className={isFetching ? 'opacity-50 transition-opacity' : ''}>
              {transactions.map((tx) => (
                <TransactionItem key={tx._id} transaction={tx} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 pt-6 border-t border-[var(--color-grey-100)]">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-4 text-center text-sm text-[var(--color-grey-500)]">
              Showing {transactions.length} of {total} transactions
            </div>
          </>
        )}
      </div>
    </div>
  );
}
