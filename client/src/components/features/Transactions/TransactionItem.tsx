/**
 * Transaction Item Component
 *
 * CONCEPT: Displays a single transaction with different layouts for
 * desktop (table row) and mobile (card).
 *
 * Features:
 * - Avatar with fallback
 * - Color-coded amounts (green for income, default for expense)
 * - Category and date display
 * - Responsive design
 *
 * Usage:
 *   <TransactionItem transaction={tx} />
 */

import * as React from 'react';
import type { Transaction } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

/**
 * Get initials from a name for avatar fallback
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Desktop Transaction Row
 * Displays transaction as a table row with columns
 */
export function TransactionItemDesktop({ transaction }: TransactionItemProps) {
  const isIncome = transaction.amount >= 0;

  return (
    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center md:gap-4 md:py-4 md:border-b md:border-[var(--color-grey-100)] last:border-0">
      {/* Name & Avatar */}
      <div className="flex items-center gap-4">
        <Avatar size="default">
          <AvatarImage src={transaction.avatar} alt={transaction.name} />
          <AvatarFallback>{getInitials(transaction.name)}</AvatarFallback>
        </Avatar>
        <span className="font-bold text-[var(--color-grey-900)] truncate">
          {transaction.name}
        </span>
      </div>

      {/* Category */}
      <span className="text-sm text-[var(--color-grey-500)]">
        {transaction.category}
      </span>

      {/* Date */}
      <span className="text-sm text-[var(--color-grey-500)]">
        {formatDate(transaction.date)}
      </span>

      {/* Amount */}
      <span
        className={cn(
          'font-bold text-right',
          isIncome ? 'text-[var(--color-green)]' : 'text-[var(--color-grey-900)]'
        )}
      >
        {isIncome ? '+' : ''}
        {formatCurrency(transaction.amount)}
      </span>
    </div>
  );
}

/**
 * Mobile Transaction Card
 * Displays transaction as a compact card
 */
export function TransactionItemMobile({ transaction }: TransactionItemProps) {
  const isIncome = transaction.amount >= 0;

  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--color-grey-100)] last:border-0 md:hidden">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3">
        <Avatar size="default">
          <AvatarImage src={transaction.avatar} alt={transaction.name} />
          <AvatarFallback>{getInitials(transaction.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-bold text-[var(--color-grey-900)] truncate">
            {transaction.name}
          </p>
          <p className="text-xs text-[var(--color-grey-500)]">
            {transaction.category}
          </p>
        </div>
      </div>

      {/* Right: Amount & Date */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            'font-bold',
            isIncome ? 'text-[var(--color-green)]' : 'text-[var(--color-grey-900)]'
          )}
        >
          {isIncome ? '+' : ''}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-[var(--color-grey-500)]">
          {formatDate(transaction.date)}
        </p>
      </div>
    </div>
  );
}

/**
 * Combined Transaction Item
 * Renders both desktop and mobile versions (CSS handles visibility)
 * Memoized to prevent unnecessary re-renders in large lists
 */
export const TransactionItem = React.memo(function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <>
      <TransactionItemDesktop transaction={transaction} />
      <TransactionItemMobile transaction={transaction} />
    </>
  );
});
