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
 * - Delete action via dropdown menu
 *
 * Usage:
 *   <TransactionItem transaction={tx} />
 */

import * as React from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import type { Transaction } from '@/lib/api';
import { Avatar, AvatarImage, AvatarFallback, Button } from '@/components/ui';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { useDeleteTransaction } from '@/queryHooks';

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
  const deleteTransaction = useDeleteTransaction();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this transaction from ${transaction.name}?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTransaction.mutateAsync(transaction._id);
    } catch (error) {
      // Error is handled by the mutation hook
      setIsDeleting(false);
    }
  };

  return (
    <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:py-4 md:border-b md:border-[var(--color-grey-100)] last:border-0">
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

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            disabled={isDeleting}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Mobile Transaction Card
 * Displays transaction as a compact card
 */
export function TransactionItemMobile({ transaction }: TransactionItemProps) {
  const isIncome = transaction.amount >= 0;
  const deleteTransaction = useDeleteTransaction();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this transaction from ${transaction.name}?`)) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await deleteTransaction.mutateAsync(transaction._id);
    } catch (error) {
      // Error is handled by the mutation hook
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--color-grey-100)] last:border-0 md:hidden">
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
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

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 ml-2"
            disabled={isDeleting}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Transaction'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
