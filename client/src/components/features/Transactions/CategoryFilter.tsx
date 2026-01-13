/**
 * Category Filter Component
 *
 * CONCEPT: A dropdown for filtering transactions by category.
 * Includes "All Transactions" option to clear the filter.
 *
 * Available Categories:
 * - Entertainment, Bills, Groceries, Dining Out
 * - Transportation, Personal Care, Education
 * - Lifestyle, Shopping, General
 *
 * Usage:
 *   <CategoryFilter value={category} onValueChange={setCategory} />
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

// Categories matching backend
export const categories = [
  'All Transactions',
  'Entertainment',
  'Bills',
  'Groceries',
  'Dining Out',
  'Transportation',
  'Personal Care',
  'Education',
  'Lifestyle',
  'Shopping',
  'General',
] as const;

export type Category = (typeof categories)[number];

interface CategoryFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function CategoryFilter({ value, onValueChange, className }: CategoryFilterProps) {
  return (
    <div className={className}>
      {/* Mobile: Compact trigger */}
      <div className="md:hidden">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Full width with label */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <span className="text-sm text-[var(--color-grey-500)] whitespace-nowrap">Category</span>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
