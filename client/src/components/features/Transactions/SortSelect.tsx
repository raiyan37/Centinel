/**
 * Sort Select Component
 *
 * CONCEPT: A dropdown for selecting transaction sort order.
 * Wraps the Radix Select component with transaction-specific options.
 *
 * Sort Options:
 * - Latest: Most recent transactions first
 * - Oldest: Oldest transactions first
 * - A to Z: Alphabetical by name
 * - Z to A: Reverse alphabetical by name
 * - Highest: Highest amount first
 * - Lowest: Lowest amount first
 *
 * Usage:
 *   <SortSelect value={sortBy} onValueChange={setSortBy} />
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

export type SortOption = 'Latest' | 'Oldest' | 'A to Z' | 'Z to A' | 'Highest' | 'Lowest';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'Latest', label: 'Latest' },
  { value: 'Oldest', label: 'Oldest' },
  { value: 'A to Z', label: 'A to Z' },
  { value: 'Z to A', label: 'Z to A' },
  { value: 'Highest', label: 'Highest' },
  { value: 'Lowest', label: 'Lowest' },
];

interface SortSelectProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
  className?: string;
}

export function SortSelect({ value, onValueChange, className }: SortSelectProps) {
  return (
    <div className={className}>
      {/* Mobile: Icon only trigger */}
      <div className="md:hidden">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: Full width with label */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <span className="text-sm text-[var(--color-grey-500)] whitespace-nowrap">Sort by</span>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
