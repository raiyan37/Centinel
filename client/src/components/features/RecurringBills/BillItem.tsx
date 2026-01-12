/**
 * Bill Item Component
 *
 * CONCEPT: Displays a single recurring bill with status indicators.
 * Shows different layouts for desktop (table row) and mobile (card).
 *
 * Status Indicators:
 * - Paid: Green checkmark
 * - Due Soon: Red/amber warning
 * - Upcoming: Default styling
 *
 * Features:
 * - Pay Now button for unpaid bills
 * - Status badge
 * - Due date with ordinal suffix
 *
 * Usage:
 *   <BillItem bill={bill} onPay={() => handlePay(bill)} />
 */

import * as React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import type { RecurringBill } from '@/lib/api';
import { formatCurrency, getOrdinalSuffix, cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/components/ui';

interface BillItemProps {
  bill: RecurringBill;
  onPay?: () => void;
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

/**
 * Format due date with ordinal (e.g., "Monthly - 1st")
 */
function formatDueDate(day: number): string {
  return `Monthly - ${day}${getOrdinalSuffix(day)}`;
}

/**
 * Desktop Bill Row
 */
export function BillItemDesktop({ bill, onPay }: BillItemProps) {
  const isPaid = bill.status === 'paid';
  const isDueSoon = bill.status === 'due-soon';

  return (
    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:py-4 md:border-b md:border-[var(--color-grey-100)] last:border-0">
      {/* Bill Name & Avatar */}
      <div className="flex items-center gap-4">
        <Avatar size="default">
          <AvatarImage src={bill.avatar} alt={bill.name} />
          <AvatarFallback>{getInitials(bill.name)}</AvatarFallback>
        </Avatar>
        <span className="font-bold text-[var(--color-grey-900)] truncate">
          {bill.name}
        </span>
      </div>

      {/* Due Date */}
      <div className="flex items-center gap-2">
        <span className={cn(
          'text-sm',
          isDueSoon ? 'text-[var(--color-red)]' : 'text-[var(--color-grey-500)]'
        )}>
          {formatDueDate(bill.dueDay)}
        </span>
        {isDueSoon && (
          <AlertCircle className="w-4 h-4 text-[var(--color-red)]" />
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {isPaid && (
          <>
            <div className="w-5 h-5 rounded-full bg-[var(--color-green)] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-[var(--color-green)]">Paid</span>
          </>
        )}
        {isDueSoon && (
          <span className="text-sm font-medium text-[var(--color-red)]">Due Soon</span>
        )}
        {bill.status === 'upcoming' && (
          <span className="text-sm text-[var(--color-grey-500)]">Upcoming</span>
        )}
      </div>

      {/* Amount */}
      <span
        className={cn(
          'font-bold text-right',
          isDueSoon ? 'text-[var(--color-red)]' : 'text-[var(--color-grey-900)]'
        )}
      >
        {formatCurrency(Math.abs(bill.amount))}
      </span>

      {/* Pay Button */}
      <div className="flex justify-end">
        {!isPaid && onPay && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPay}
            className="text-xs"
            aria-label={`Pay ${bill.name} bill of ${formatCurrency(Math.abs(bill.amount))}`}
          >
            Pay Now
          </Button>
        )}
        {isPaid && (
          <span className="text-xs text-[var(--color-grey-300)] px-3" aria-label="Already paid">—</span>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile Bill Card
 */
export function BillItemMobile({ bill, onPay }: BillItemProps) {
  const isPaid = bill.status === 'paid';
  const isDueSoon = bill.status === 'due-soon';

  return (
    <div className="py-4 border-b border-[var(--color-grey-100)] last:border-0 md:hidden">
      <div className="flex items-center justify-between">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3">
          <Avatar size="default">
            <AvatarImage src={bill.avatar} alt={bill.name} />
            <AvatarFallback>{getInitials(bill.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-bold text-[var(--color-grey-900)] truncate">
              {bill.name}
            </p>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs',
                isDueSoon ? 'text-[var(--color-red)]' : 'text-[var(--color-grey-500)]'
              )}>
                {formatDueDate(bill.dueDay)}
              </span>
              {isPaid && (
                <div className="w-4 h-4 rounded-full bg-[var(--color-green)] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
              {isDueSoon && (
                <AlertCircle className="w-4 h-4 text-[var(--color-red)]" />
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount */}
        <span
          className={cn(
            'font-bold shrink-0',
            isDueSoon ? 'text-[var(--color-red)]' : 'text-[var(--color-grey-900)]'
          )}
        >
          {formatCurrency(Math.abs(bill.amount))}
        </span>
      </div>

      {/* Pay Button for Mobile */}
      {!isPaid && onPay && (
        <div className="mt-3 pl-[52px]">
          <Button
            variant="outline"
            size="sm"
            onClick={onPay}
            className="text-xs w-full"
            aria-label={`Pay ${bill.name} bill of ${formatCurrency(Math.abs(bill.amount))}`}
          >
            Pay Now
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Combined Bill Item
 * Renders both desktop and mobile versions (CSS handles visibility)
 * Memoized to prevent unnecessary re-renders in lists
 */
export const BillItem = React.memo(function BillItem({ bill, onPay }: BillItemProps) {
  return (
    <>
      <BillItemDesktop bill={bill} onPay={onPay} />
      <BillItemMobile bill={bill} onPay={onPay} />
    </>
  );
});
