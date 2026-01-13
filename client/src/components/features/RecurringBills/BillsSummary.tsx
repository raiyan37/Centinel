/**
 * Bills Summary Component
 *
 * CONCEPT: Displays summary statistics for recurring bills.
 * Shows total, paid, upcoming, and due soon counts/amounts.
 *
 * Features:
 * - Total bills with icon
 * - Breakdown by status (Paid, Upcoming, Due Soon)
 * - Color-coded status indicators
 *
 * Usage:
 *   <BillsSummary summary={billsSummary} />
 */

import { Receipt } from 'lucide-react';
import type { RecurringBillsSummary } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface BillsSummaryProps {
  summary: RecurringBillsSummary;
}

export function BillsSummary({ summary }: BillsSummaryProps) {
  return (
    <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-3">
      {/* Total Bills Card */}
      <div className="rounded-xl bg-[var(--color-grey-900)] p-5 text-white lg:w-64 lg:shrink-0">
        <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-8">
          <div className="p-3 bg-white/10 rounded-full">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-white">Total Bills</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="rounded-xl bg-white p-5 shadow-sm flex-1">
        <h3 className="font-bold text-[var(--color-grey-900)] mb-4">Summary</h3>
        
        <div className="space-y-3">
          {/* Paid Bills */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-grey-100)]">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[var(--color-green)]" />
              <span className="text-sm text-[var(--color-grey-500)]">Paid Bills</span>
            </div>
            <span className="font-bold text-[var(--color-grey-900)]">
              {summary.paid.count} ({formatCurrency(summary.paid.amount)})
            </span>
          </div>

          {/* Total Upcoming */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-grey-100)]">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[var(--color-gold)]" />
              <span className="text-sm text-[var(--color-grey-500)]">Total Upcoming</span>
            </div>
            <span className="font-bold text-[var(--color-grey-900)]">
              {summary.upcoming.count} ({formatCurrency(summary.upcoming.amount)})
            </span>
          </div>

          {/* Due Soon */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-[var(--color-cyan)]" />
              <span className="text-sm text-[var(--color-grey-500)]">Due Soon</span>
            </div>
            <span className="font-bold text-[var(--color-red)]">
              {summary.dueSoon.count} ({formatCurrency(summary.dueSoon.amount)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
