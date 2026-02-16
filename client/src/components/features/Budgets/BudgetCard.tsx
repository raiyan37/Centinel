/**
 * Budget Card Component
 *
 * CONCEPT: A card displaying budget details with a donut chart,
 * spending summary, and latest 3 transactions.
 *
 * Features:
 * - Donut chart showing spent vs maximum
 * - Spent/Remaining summary with color indicators
 * - Latest 3 transactions from the category
 * - "See All" link to filtered transactions page
 * - Dropdown menu for edit/delete actions
 *
 * Usage:
 *   <BudgetCard
 *     budget={budget}
 *     onEdit={() => handleEdit(budget)}
 *     onDelete={() => handleDelete(budget)}
 *   />
 */

import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Budget } from '@/lib/api';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import {
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { BudgetDonutChart } from './BudgetDonutChart';

interface BudgetCardProps {
  budget: Budget;
  onEdit: () => void;
  onDelete: () => void;
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

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const navigate = useNavigate();
  const percentage = calculatePercentage(budget.spent, budget.maximum);
  const isOverBudget = budget.spent > budget.maximum;

  /**
   * Navigate to transactions filtered by this budget's category
   */
  const handleSeeAll = () => {
    navigate(`/transactions?filter=${encodeURIComponent(budget.category)}`);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Header: Category name + Actions */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: budget.theme }}
          />
          <h2 className="text-xl font-bold text-[var(--color-grey-900)]">
            {budget.category}
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
              Edit Budget
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-[var(--color-red)] focus:text-[var(--color-red)]"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Budget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main content: Chart + Stats */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Donut Chart */}
        <div className="flex justify-center lg:justify-start">
          <BudgetDonutChart
            spent={budget.spent}
            maximum={budget.maximum}
            theme={budget.theme}
            size="default"
          />
        </div>

        {/* Stats + Latest Transactions */}
        <div className="flex-1 space-y-5">
          {/* Spending Summary */}
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-grey-500)]">
              Maximum of {formatCurrency(budget.maximum)}
            </p>

            {/* Progress bar (compact) */}
            <div className="h-6 bg-[var(--color-beige-100)] rounded-sm overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? 'var(--color-red)' : budget.theme,
                }}
              />
            </div>

            {/* Spent / Remaining stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-1 h-10 rounded-full"
                  style={{ backgroundColor: budget.theme }}
                />
                <div>
                  <p className="text-xs text-[var(--color-grey-500)]">Spent</p>
                  <p className="font-bold text-[var(--color-grey-900)]">
                    {formatCurrency(budget.spent)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-1 h-10 rounded-full bg-[var(--color-beige-100)]" />
                <div>
                  <p className="text-xs text-[var(--color-grey-500)]">Remaining</p>
                  <p className="font-bold text-[var(--color-grey-900)]">
                    {formatCurrency(Math.max(0, budget.remaining))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Transactions */}
          {budget.latestTransactions && budget.latestTransactions.length > 0 && (
            <div className="bg-[var(--color-beige-100)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--color-grey-900)]">
                  Latest Spending
                </h3>
                <button
                  onClick={handleSeeAll}
                  className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] transition-colors flex items-center gap-1"
                >
                  See All
                  <span className="text-xs">→</span>
                </button>
              </div>

              <div className="space-y-3">
                {budget.latestTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-white/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarImage src={tx.avatar} alt={tx.name} />
                        <AvatarFallback>{getInitials(tx.name)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-bold text-[var(--color-grey-900)]">
                        {tx.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--color-grey-900)]">
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-[var(--color-grey-500)]">
                        {formatDate(tx.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
