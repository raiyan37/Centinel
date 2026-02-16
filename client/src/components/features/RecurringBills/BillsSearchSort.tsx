/**
 * Bills Search and Sort Component
 *
 * CONCEPT: Combined search input and sort dropdown for filtering bills.
 * Similar to Transactions but with bills-specific styling.
 *
 * Usage:
 *   <BillsSearchSort
 *     searchValue={search}
 *     onSearchChange={setSearch}
 *     sortValue={sort}
 *     onSortChange={setSort}
 *   />
 */

import * as React from 'react';
import { Search } from 'lucide-react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';

export type BillsSortOption = 'Latest' | 'Oldest' | 'A to Z' | 'Z to A' | 'Highest' | 'Lowest';

const sortOptions: { value: BillsSortOption; label: string }[] = [
  { value: 'Latest', label: 'Latest' },
  { value: 'Oldest', label: 'Oldest' },
  { value: 'A to Z', label: 'A to Z' },
  { value: 'Z to A', label: 'Z to A' },
  { value: 'Highest', label: 'Highest' },
  { value: 'Lowest', label: 'Lowest' },
];

interface BillsSearchSortProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortValue: BillsSortOption;
  onSortChange: (value: BillsSortOption) => void;
}

export function BillsSearchSort({
  searchValue,
  onSearchChange,
  sortValue,
  onSortChange,
}: BillsSearchSortProps) {
  // Local state for debounced search
  const [localSearch, setLocalSearch] = React.useState(searchValue);

  // Sync local state when external value changes
  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Debounced search update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchValue, onSearchChange]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Search Input */}
      <Input
        type="search"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Search bills"
        startIcon={<Search className="h-4 w-4" />}
        className="w-full md:w-80"
      />

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[var(--color-grey-500)] whitespace-nowrap hidden md:block">
          Sort by
        </span>
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
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
