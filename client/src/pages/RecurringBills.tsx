/**
 * Recurring Bills Page
 *
 * CONCEPT: Displays all recurring bills with summary statistics
 * and status indicators (paid, upcoming, due soon).
 * Built fourth in the page order as per the implementation plan.
 *
 * Features:
 * - Summary cards (Total, Paid, Upcoming, Due Soon)
 * - Search by bill/vendor name
 * - Sort options (Latest, Oldest, A-Z, Z-A, Highest, Lowest)
 * - Status indicators with icons
 * - Responsive desktop table / mobile card layout
 * - Add new recurring bills
 * - Pay bills (creates transaction)
 *
 * Data Processing:
 * - Bills are deduplicated by vendor name
<<<<<<< HEAD
 * - Status calculated based on August 2024 context
 * - "Due Soon" = within 5 days of Aug 19, 2024
=======
 * - Status calculated dynamically based on current month
 * - "Due Soon" = within 5 days from current date
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
 */

import * as React from 'react';
import { Plus } from 'lucide-react';
import { useRecurringBills } from '@/queryHooks';
import type { RecurringBillsParams, RecurringBill } from '@/lib/api';
import { ErrorState } from '@/components';
import { Button } from '@/components/ui';
import {
  BillsSummary,
  BillItem,
  BillsSearchSort,
  AddBillForm,
  PayBillModal,
  type BillsSortOption,
} from '@/components/features/RecurringBills';

export function RecurringBillsPage() {
  // Modal states
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isPayOpen, setIsPayOpen] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<RecurringBill | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<BillsSortOption>('Latest');

  // Handle pay button click
  const handlePayBill = (bill: RecurringBill) => {
    setSelectedBill(bill);
    setIsPayOpen(true);
  };

  // Build query params
  const queryParams: RecurringBillsParams = React.useMemo(() => {
    const params: RecurringBillsParams = { sort: sortBy };
    if (searchTerm) {
      params.search = searchTerm;
    }
    return params;
  }, [searchTerm, sortBy]);

  // Fetch recurring bills
  const { data, isLoading, error, isFetching, refetch } = useRecurringBills(queryParams);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0" role="status" aria-live="polite" aria-busy="true">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Recurring Bills
        </h1>
        <span className="sr-only">Loading recurring bills...</span>

        {/* Skeleton for summary */}
        <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-3">
          <div className="rounded-xl bg-[var(--color-grey-900)] p-5 lg:w-64 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full" />
              <div className="space-y-2">
                <div className="h-4 w-20 bg-white/20 rounded" />
                <div className="h-8 w-32 bg-white/20 rounded" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm flex-1 animate-pulse">
            <div className="h-6 w-24 bg-[var(--color-beige-100)] rounded mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[var(--color-beige-100)] rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Skeleton for list */}
        <div className="rounded-xl bg-white p-5 shadow-sm animate-pulse">
          <div className="flex gap-4 mb-6">
            <div className="h-11 flex-1 bg-[var(--color-beige-100)] rounded-lg" />
            <div className="h-11 w-32 bg-[var(--color-beige-100)] rounded-lg" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-beige-100)] rounded mb-3" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Recurring Bills
        </h1>
        <ErrorState
          error={error}
          title="Error loading recurring bills"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const bills = data?.bills ?? [];
  const summary = data?.summary ?? {
    total: 0,
    totalAmount: 0,
    paid: { count: 0, amount: 0 },
    upcoming: { count: 0, amount: 0 },
    dueSoon: { count: 0, amount: 0 },
  };

  // Empty state
  if (bills.length === 0 && !searchTerm) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div className="flex items-center justify-between">
          <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
            Recurring Bills
          </h1>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Bill
          </Button>
        </div>

        {/* Add Bill Modal */}
        <AddBillForm open={isAddOpen} onOpenChange={setIsAddOpen} />

        <div className="rounded-xl bg-white p-12 shadow-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-beige-100)] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[var(--color-grey-500)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-grey-900)] mb-2">
            No recurring bills
          </h2>
          <p className="text-[var(--color-grey-500)] mb-6 max-w-md mx-auto">
            Track your monthly bills and subscriptions here. Add your first bill to get started.
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Bill
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Recurring Bills
        </h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {/* Modals */}
      <AddBillForm open={isAddOpen} onOpenChange={setIsAddOpen} />
      <PayBillModal
        open={isPayOpen}
        onOpenChange={setIsPayOpen}
        bill={selectedBill}
      />

      {/* Summary Cards */}
      <BillsSummary summary={summary} />

      {/* Bills List */}
      <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
        {/* Search and Sort */}
        <div className="mb-6">
          <BillsSearchSort
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            sortValue={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Bills Table/List */}
        {bills.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[var(--color-grey-900)] font-medium">
              No bills found
            </p>
            <p className="mt-2 text-sm text-[var(--color-grey-500)]">
              Try adjusting your search term.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table Header */}
            <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:gap-4 md:pb-3 md:border-b md:border-[var(--color-grey-100)]">
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Bill Title
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Due Date
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)]">
                Status
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)] text-right">
                Amount
              </span>
              <span className="text-xs font-bold text-[var(--color-grey-500)] text-right w-20">
                Action
              </span>
            </div>

            {/* Bills List */}
            <div className={isFetching ? 'opacity-50 transition-opacity' : ''}>
              {bills.map((bill) => (
                <BillItem
<<<<<<< HEAD
                  key={bill.id}
=======
                  key={bill._id}
>>>>>>> ae78191afa578c360889abac109c62c29a292dd3
                  bill={bill}
                  onPay={() => handlePayBill(bill)}
                />
              ))}
            </div>

            {/* Results Summary */}
            <div className="mt-6 pt-4 border-t border-[var(--color-grey-100)] text-center text-sm text-[var(--color-grey-500)]">
              Showing {bills.length} recurring {bills.length === 1 ? 'bill' : 'bills'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
