/**
 * Budget Spending Summary Component
 *
 * CONCEPT: A donut chart summary showing all budgets at a glance.
 * Displayed in the left column of the Budgets page (desktop).
 *
 * Features:
 * - Combined donut chart of all budget categories
 * - Legend showing each category with spent amount
 * - Total spending summary
 *
 * Usage:
 *   <BudgetSpendingSummary budgets={budgets} />
 */

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Budget } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface BudgetSpendingSummaryProps {
  budgets: Budget[];
}

export function BudgetSpendingSummary({ budgets }: BudgetSpendingSummaryProps) {
  // Calculate total spent across all budgets
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalMaximum = budgets.reduce((sum, b) => sum + b.maximum, 0);

  // Data for the pie chart
  const chartData = budgets.map((budget) => ({
    name: budget.category,
    value: budget.spent,
    theme: budget.theme,
    maximum: budget.maximum,
  }));

  // Add remaining as a gray segment if there's budget left
  const totalRemaining = Math.max(0, totalMaximum - totalSpent);
  if (totalRemaining > 0) {
    chartData.push({
      name: 'Free',
      value: totalRemaining,
      theme: '#F8F4F0',
      maximum: 0,
    });
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      {/* Donut Chart */}
      <div className="flex justify-center mb-6">
        <div className="relative w-60 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.theme} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-[var(--color-grey-900)]">
              {formatCurrency(totalSpent)}
            </span>
            <span className="text-sm text-[var(--color-grey-500)]">
              of {formatCurrency(totalMaximum)} limit
            </span>
          </div>
        </div>
      </div>

      {/* Legend / Spending Limits */}
      <div className="space-y-4">
        <h3 className="font-bold text-[var(--color-grey-900)]">Spending Summary</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <div key={budget._id} className="flex items-start gap-3">
              <div
                className="w-1 h-full min-h-[40px] rounded-full mt-1"
                style={{ backgroundColor: budget.theme }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-grey-500)] truncate">
                  {budget.category}
                </p>
                <p className="font-bold text-[var(--color-grey-900)]">
                  {formatCurrency(budget.spent)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
