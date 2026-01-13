/**
 * Recurring Bills Overview Component
 *
 * CONCEPT: A summary card showing recurring bills statistics
 * with paid, upcoming, and due soon counts.
 *
 * Features:
 * - Paid bills count and amount (green border)
 * - Total upcoming count and amount (yellow border)
 * - Due soon count and amount (red/cyan border)
 * - "See Details" link to Recurring Bills page
 *
 * Usage:
 *   <RecurringBillsOverview summary={billsSummary} />
 */

import { Link } from 'react-router-dom';
import { formatCurrency } from '@/lib/utils';

interface BillsSummary {
  total: number;
  totalAmount: number;
  paid: { count: number; amount: number };
  upcoming: { count: number; amount: number };
  dueSoon: { count: number; amount: number };
}

interface RecurringBillsOverviewProps {
  summary: BillsSummary;
}

export function RecurringBillsOverview({ summary }: RecurringBillsOverviewProps) {
  return (
    <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--color-grey-900)]">
          Recurring Bills
        </h2>
        <Link
          to="/recurring-bills"
          className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] transition-colors flex items-center gap-1"
        >
          See Details
          <span className="text-xs">→</span>
        </Link>
      </div>

      {/* Bills Summary List */}
      <div className="space-y-3">
        {/* Paid Bills */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-beige-100)] border-l-4 border-[var(--color-green)]">
          <span className="text-sm text-[var(--color-grey-500)]">Paid Bills</span>
          <span className="font-bold text-[var(--color-grey-900)]">
            {formatCurrency(summary.paid.amount)}
          </span>
        </div>

        {/* Total Upcoming */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-beige-100)] border-l-4 border-[var(--color-gold)]">
          <span className="text-sm text-[var(--color-grey-500)]">Total Upcoming</span>
          <span className="font-bold text-[var(--color-grey-900)]">
            {formatCurrency(summary.upcoming.amount)}
          </span>
        </div>

        {/* Due Soon */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-beige-100)] border-l-4 border-[var(--color-cyan)]">
          <span className="text-sm text-[var(--color-grey-500)]">Due Soon</span>
          <span className="font-bold text-[var(--color-red)]">
            {formatCurrency(summary.dueSoon.amount)}
          </span>
        </div>
      </div>
    </div>
  );
}
