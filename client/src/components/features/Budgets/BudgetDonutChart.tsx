/**
 * Budget Donut Chart Component
 *
 * CONCEPT: A donut/ring chart showing budget usage percentage.
 * Built with Recharts for smooth animations and responsiveness.
 *
 * Features:
 * - Shows spent vs remaining as a ring
 * - Center displays total spent and limit
 * - Color changes to red when over budget
 * - Responsive sizing
 *
 * Usage:
 *   <BudgetDonutChart
 *     spent={350}
 *     maximum={500}
 *     theme="#277C78"
 *   />
 */

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface BudgetDonutChartProps {
  spent: number;
  maximum: number;
  theme: string;
  size?: 'sm' | 'default' | 'lg';
}

export function BudgetDonutChart({
  spent,
  maximum,
  theme,
  size = 'default',
}: BudgetDonutChartProps) {
  const isOverBudget = spent > maximum;
  const remaining = Math.max(0, maximum - spent);
  
  // Data for the pie chart
  const data = [
    { name: 'Spent', value: Math.min(spent, maximum) },
    { name: 'Remaining', value: remaining },
  ];

  // If over budget, show full red ring
  const overBudgetData = [
    { name: 'Over', value: 1 },
  ];

  // Colors
  const spentColor = isOverBudget ? 'var(--color-red)' : theme;
  const remainingColor = '#F8F4F0'; // beige-100

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 120, innerRadius: 35, outerRadius: 50 },
    default: { width: 180, height: 180, innerRadius: 55, outerRadius: 75 },
    lg: { width: 240, height: 240, innerRadius: 75, outerRadius: 100 },
  };

  const config = sizeConfig[size];

  return (
    <div className="relative" style={{ width: config.width, height: config.height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={isOverBudget ? overBudgetData : data}
            cx="50%"
            cy="50%"
            innerRadius={config.innerRadius}
            outerRadius={config.outerRadius}
            startAngle={90}
            endAngle={-270}
            paddingAngle={0}
            dataKey="value"
            strokeWidth={0}
          >
            {isOverBudget ? (
              <Cell fill={spentColor} />
            ) : (
              data.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? spentColor : remainingColor}
                />
              ))
            )}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-bold ${
            size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
          } ${isOverBudget ? 'text-[var(--color-red)]' : 'text-[var(--color-grey-900)]'}`}
        >
          {formatCurrency(spent)}
        </span>
        <span className={`text-[var(--color-grey-500)] ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          of {formatCurrency(maximum)} limit
        </span>
      </div>
    </div>
  );
}
