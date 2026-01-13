/**
 * Pot Card Component
 *
 * CONCEPT: A card displaying a savings pot with progress bar,
 * total saved, and action buttons for deposit/withdraw.
 *
 * Features:
 * - Theme-colored progress bar
 * - Percentage and target display
 * - Dropdown menu for edit/delete
 * - Add Money and Withdraw buttons
 *
 * Usage:
 *   <PotCard
 *     pot={pot}
 *     onEdit={() => handleEdit(pot)}
 *     onDelete={() => handleDelete(pot)}
 *     onDeposit={() => handleDeposit(pot)}
 *     onWithdraw={() => handleWithdraw(pot)}
 *   />
 */

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Pot } from '@/lib/api';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import {
  Button,
  Progress,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';

interface PotCardProps {
  pot: Pot;
  onEdit: () => void;
  onDelete: () => void;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export function PotCard({
  pot,
  onEdit,
  onDelete,
  onDeposit,
  onWithdraw,
}: PotCardProps) {
  const percentage = calculatePercentage(pot.total, pot.target);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Header: Name + Theme indicator + Menu */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: pot.theme }}
          />
          <h2 className="text-xl font-bold text-[var(--color-grey-900)]">
            {pot.name}
          </h2>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Pot
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-[var(--color-red)] focus:text-[var(--color-red)]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Pot
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Total Saved */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--color-grey-500)]">Total Saved</span>
        <span className="text-3xl font-bold text-[var(--color-grey-900)]">
          {formatCurrency(pot.total)}
        </span>
      </div>

      {/* Progress Bar */}
      <Progress
        value={Math.min(percentage, 100)}
        indicatorColor={pot.theme}
        className="h-2 mb-3"
      />

      {/* Percentage + Target */}
      <div className="flex items-center justify-between text-xs mb-8">
        <span
          className="font-bold"
          style={{ color: pot.theme }}
        >
          {percentage.toFixed(1)}%
        </span>
        <span className="text-[var(--color-grey-500)]">
          Target of {formatCurrency(pot.target)}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onDeposit}
        >
          + Add Money
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={onWithdraw}
          disabled={pot.total <= 0}
        >
          Withdraw
        </Button>
      </div>
    </div>
  );
}
