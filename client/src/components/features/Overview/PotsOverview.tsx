/**
 * Pots Overview Component
 *
 * CONCEPT: A summary card showing total saved in pots and
 * the first 4 pots with their individual amounts.
 *
 * Features:
 * - Total saved amount with pot icon
 * - Grid of first 4 pots with theme colors
 * - "See Details" link to Pots page
 * - Responsive layout that stacks on small screens
 *
 * Usage:
 *   <PotsOverview totalSaved={850} pots={potsArray} />
 */

import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import type { Pot } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface PotsOverviewProps {
  totalSaved: number;
  pots: Pot[];
}

export function PotsOverview({ totalSaved, pots }: PotsOverviewProps) {
  // Show only first 4 pots
  const displayPots = pots.slice(0, 4);

  return (
    <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--color-grey-900)]">Pots</h2>
        <Link
          to="/pots"
          className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] transition-colors flex items-center gap-1"
        >
          See Details
          <span className="text-xs">→</span>
        </Link>
      </div>

      <div className="flex flex-col gap-5 md:flex-row">
        {/* Total Saved Card */}
        <div className="flex items-center gap-4 p-4 bg-[var(--color-beige-100)] rounded-xl md:min-w-[180px] md:max-w-[200px]">
          <div className="p-3 bg-[var(--color-green)] rounded-xl shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-[var(--color-grey-500)]">Total Saved</p>
            <p className="text-2xl font-bold text-[var(--color-grey-900)]">
              {formatCurrency(totalSaved)}
            </p>
          </div>
        </div>

        {/* Pots Grid */}
        {displayPots.length > 0 ? (
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-4 min-w-0">
            {displayPots.map((pot) => (
              <div key={pot.id} className="flex items-center gap-3 min-w-0">
                <div
                  className="w-1 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: pot.theme }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-grey-500)] truncate">
                    {pot.name}
                  </p>
                  <p className="font-bold text-[var(--color-grey-900)]">
                    {formatCurrency(pot.total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-[var(--color-grey-500)] py-4">
            No pots yet
          </div>
        )}
      </div>
    </div>
  );
}
