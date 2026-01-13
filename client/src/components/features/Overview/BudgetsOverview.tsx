/**
 * Budgets Overview Component
 *
 * CONCEPT: A summary card showing all budgets with a donut chart
 * visualization of spending across categories.
 *
 * Features:
 * - Donut chart showing spending by category
 * - Legend with category colors and spent amounts
 * - "See Details" link to Budgets page
 * - Responsive layout with stacking on smaller screens
 *
 * Usage:
 *   <BudgetsOverview budgets={budgetsArray} />
 */

import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { Budget } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface BudgetsOverviewProps {
  budgets: Budget[];
}

export function BudgetsOverview({ budgets }: BudgetsOverviewProps) {
  // Calculate totals
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalMaximum = budgets.reduce((sum, b) => sum + b.maximum, 0);

  // Prepare chart data
  const chartData = budgets.map((budget) => ({
    name: budget.category,
    value: budget.spent,
    theme: budget.theme,
  }));

  // Add remaining as gray segment if there's budget left
  const totalRemaining = Math.max(0, totalMaximum - totalSpent);
  if (totalRemaining > 0 && chartData.length > 0) {
    chartData.push({
      name: 'Free',
      value: totalRemaining,
      theme: '#F8F4F0',
    });
  }

  // Show only first 4 budgets in legend
  const displayBudgets = budgets.slice(0, 4);

  return (
    <div className="rounded-xl bg-white p-5 md:p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-[var(--color-grey-900)]">Budgets</h2>
        <Link
          to="/budgets"
          className="text-sm text-[var(--color-grey-500)] hover:text-[var(--color-grey-900)] transition-colors flex items-center gap-1"
        >
          See Details
          <span className="text-xs">→</span>
        </Link>
      </div>

      {budgets.length > 0 ? (
        <div className="flex flex-col items-center gap-6 md:flex-row">
          {/* Donut Chart */}
          <div className="relative w-40 h-40 md:w-44 md:h-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
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
              <span className="text-xl md:text-2xl font-bold text-[var(--color-grey-900)]">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-[10px] md:text-xs text-[var(--color-grey-500)] text-center px-2">
                of {formatCurrency(totalMaximum)} limit
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-x-3 gap-y-3 w-full min-w-0">
            {displayBudgets.map((budget) => (
              <div key={budget._id} className="flex items-start gap-2 min-w-0">
                <div
                  className="w-1 h-full min-h-[36px] rounded-full shrink-0"
                  style={{ backgroundColor: budget.theme }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--color-grey-500)] truncate">
                    {budget.category}
                  </p>
                  <p className="font-bold text-sm text-[var(--color-grey-900)]">
                    {formatCurrency(budget.spent)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-[var(--color-grey-500)]">
          No budgets yet
        </div>
      )}
    </div>
  );
}
