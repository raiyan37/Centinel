/**
 * Search Input Component
 *
 * CONCEPT: A search input with debouncing for transaction filtering.
 * Debouncing prevents excessive API calls while the user is typing.
 *
 * Usage:
 *   <SearchInput
 *     value={searchTerm}
 *     onChange={setSearchTerm}
 *     placeholder="Search transactions"
 *   />
 */

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search transaction',
  className,
}: SearchInputProps) {
  // Local state for immediate UI feedback
  const [localValue, setLocalValue] = React.useState(value);

  // Sync local state when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounced update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <Input
      type="search"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      startIcon={<Search className="h-4 w-4" />}
      className={className}
    />
  );
}
