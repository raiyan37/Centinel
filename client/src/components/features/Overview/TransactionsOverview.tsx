/**
 * Transactions Overview Component
 *
 * CONCEPT: A summary card showing the 5 most recent transactions
 * with a "View All" link to the Transactions page.
 *
 * Features:
 * - List of 5 recent transactions
 * - Avatar, name, date, and amount for each
 * - Color-coded amounts (green for income)
 * - "View All" link to Transactions page
 *
 * Usage:
 *   <TransactionsOverview transactions={recentTransactions} />
 */

import { Link } from 'react-router-dom';
import type { Transaction } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { cn } from '@/lib/utils';

interface TransactionsOverviewProps {
  transactions: Transaction[];
}

/**
 * Get initials from name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function TransactionsOverview({ transactions }: TransactionsOverviewProps) {
  return (
    <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--color-grey-900)]">Transactions</h2>
        <Link
          to="/transactions"
          className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] transition-colors flex items-center gap-1"
        >
          View All
          <span className="text-xs">→</span>
        </Link>
      </div>

      {transactions.length > 0 ? (
        <div className="space-y-0">
          {transactions.map((tx, index) => {
            const isIncome = tx.amount >= 0;
            const isLast = index === transactions.length - 1;

            return (
              <div
                key={tx.id}
                className={cn(
                  'flex items-center justify-between py-4',
                  !isLast && 'border-b border-[var(--color-grey-100)]'
                )}
              >
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar size="default">
                    <AvatarImage src={tx.avatar} alt={tx.name} />
                    <AvatarFallback>{getInitials(tx.name)}</AvatarFallback>
                  </Avatar>
                  <span className="font-bold text-[var(--color-grey-900)] truncate">
                    {tx.name}
                  </span>
                </div>

                {/* Right: Amount & Date */}
                <div className="text-right shrink-0 ml-4">
                  <p
                    className={cn(
                      'font-bold',
                      isIncome
                        ? 'text-[var(--color-green)]'
                        : 'text-[var(--color-grey-900)]'
                    )}
                  >
                    {isIncome ? '+' : ''}
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-[var(--color-grey-500)]">
                    {formatDate(tx.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-[var(--color-grey-500)]">
          No transactions yet
        </div>
      )}
    </div>
  );
}
