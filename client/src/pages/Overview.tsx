/**
 * Overview Page (Dashboard)
 *
 * CONCEPT: The main dashboard displaying a financial summary at-a-glance.
 * Built LAST as it aggregates data from all other pages.
 *
 * Sections:
 * 1. Balance Summary - Current balance, income, expenses
 * 2. Pots Overview - Total saved + individual pot amounts
 * 3. Transactions Overview - 5 most recent transactions
 * 4. Budgets Overview - Spending by category with donut chart
 * 5. Recurring Bills Overview - Paid, upcoming, due soon summary
 *
 * Layout:
 * - Mobile (<768px): Single column, stacked sections
 * - Tablet (768-1024px): Single column with adjusted components
 * - Desktop (>1024px): Two-column grid with optimized placement
 */

import { useOverview } from '@/queryHooks';
import { ErrorState } from '@/components';
import {
  BalanceSummary,
  PotsOverview,
  BudgetsOverview,
  TransactionsOverview,
  RecurringBillsOverview,
} from '@/components/features/Overview';

export function OverviewPage() {
  const { data, isLoading, error, refetch } = useOverview();

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 lg:pb-0" role="status" aria-live="polite" aria-busy="true">
        <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
          Overview
        </h1>
        <span className="sr-only">Loading dashboard data...</span>

        {/* Balance Summary Skeleton */}
        <div className="grid gap-3 sm:grid-cols-3 md:gap-6">
          <div className="rounded-xl bg-[var(--color-grey-900)] p-6 animate-pulse" aria-hidden="true">
            <div className="h-4 w-24 bg-white/20 rounded mb-3" />
            <div className="h-9 w-32 bg-white/20 rounded" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm animate-pulse" aria-hidden="true">
              <div className="h-4 w-16 bg-[var(--color-beige-100)] rounded mb-3" />
              <div className="h-9 w-28 bg-[var(--color-beige-100)] rounded" />
            </div>
          ))}
        </div>

        {/* Grid Skeleton */}
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-white p-6 shadow-sm animate-pulse" aria-hidden="true">
              <div className="h-6 w-24 bg-[var(--color-beige-100)] rounded mb-5" />
              <div className="h-32 bg-[var(--color-beige-100)] rounded" />
            </div>
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
          Overview
        </h1>
        <ErrorState
          error={error}
          title="Error loading dashboard"
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  // Extract data
  const { balance, pots, budgets, transactions, recurringBills } = data?.data ?? {
    balance: { current: 0, income: 0, expenses: 0 },
    pots: { totalSaved: 0, items: [] },
    budgets: { items: [] },
    transactions: { recent: [] },
    recurringBills: {
      total: 0,
      totalAmount: 0,
      paid: { count: 0, amount: 0 },
      upcoming: { count: 0, amount: 0 },
      dueSoon: { count: 0, amount: 0 },
    },
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Page Header */}
      <h1 className="text-[var(--font-size-3xl)] font-bold text-[var(--color-grey-900)]">
        Overview
      </h1>

      {/* Balance Summary - Full Width */}
      <BalanceSummary
        current={balance.current}
        income={balance.income}
        expenses={balance.expenses}
      />

      {/* Main Content Grid - Single column until xl breakpoint */}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left Column - Wider */}
        <div className="space-y-6">
          {/* Pots Overview */}
          <PotsOverview totalSaved={pots.totalSaved} pots={pots.items} />

          {/* Transactions Overview */}
          <TransactionsOverview transactions={transactions.recent} />
        </div>

        {/* Right Column - Narrower */}
        <div className="space-y-6">
          {/* Budgets Overview */}
          <BudgetsOverview budgets={budgets.items} />

          {/* Recurring Bills Overview */}
          <RecurringBillsOverview summary={recurringBills} />
        </div>
      </div>
    </div>
  );
}
