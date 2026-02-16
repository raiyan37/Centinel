/**
 * Balance Summary Component
 *
 * CONCEPT: Displays three stat cards for current balance, income, and expenses.
 * The current balance card is highlighted with dark styling.
 *
 * Features:
 * - Current balance in highlighted dark card
 * - Income and expenses in secondary cards
 * - Responsive grid layout
 *
 * Usage:
 *   <BalanceSummary
 *     current={4836.00}
 *     income={3814.25}
 *     expenses={1700.50}
 *   />
 */

import * as React from 'react';
import { formatCurrency } from '@/lib/utils';

interface BalanceSummaryProps {
  current: number;
  income: number;
  expenses: number;
}

/**
 * Memoized to prevent re-renders when parent updates
 */
export const BalanceSummary = React.memo(function BalanceSummary({ current, income, expenses }: BalanceSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 md:gap-6">
      {/* Current Balance - Highlighted */}
      <div className="rounded-xl bg-[var(--color-grey-900)] p-5 md:p-6 text-white">
        <p className="text-sm text-white mb-2">Current Balance</p>
        <p className="text-3xl font-bold text-white">{formatCurrency(current)}</p>
      </div>

      {/* Income */}
      <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
        <p className="text-sm text-[var(--color-grey-500)] mb-2">Income</p>
        <p className="text-3xl font-bold text-[var(--color-grey-900)]">
          {formatCurrency(income)}
        </p>
      </div>

      {/* Expenses */}
      <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
        <p className="text-sm text-[var(--color-grey-500)] mb-2">Expenses</p>
        <p className="text-3xl font-bold text-[var(--color-grey-900)]">
          {formatCurrency(expenses)}
        </p>
      </div>
    </div>
  );
});
