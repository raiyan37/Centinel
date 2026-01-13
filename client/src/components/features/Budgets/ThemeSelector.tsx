/**
 * Theme Selector Component
 *
 * CONCEPT: A color picker for selecting budget/pot themes.
 * Shows available theme colors with visual selection indicator.
 *
 * Features:
 * - Grid of theme color options
 * - Shows color name on hover/focus
 * - Checkmark on selected color
 * - Disables already-used colors (optional)
 *
 * Usage:
 *   <ThemeSelector
 *     value="#277C78"
 *     onChange={setTheme}
 *     usedThemes={['#82C9D7', '#F2CDAC']}
 *   />
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui';

// Theme colors from design system
export const themeColors = [
  { name: 'Green', value: '#277C78' },
  { name: 'Yellow', value: '#F2CDAC' },
  { name: 'Cyan', value: '#82C9D7' },
  { name: 'Navy', value: '#626070' },
  { name: 'Red', value: '#C94736' },
  { name: 'Purple', value: '#826CB0' },
  { name: 'Light Purple', value: '#AF81BA' },
  { name: 'Turquoise', value: '#597C7C' },
  { name: 'Brown', value: '#93674F' },
  { name: 'Magenta', value: '#934F6F' },
  { name: 'Blue', value: '#3F82B2' },
  { name: 'Navy Grey', value: '#97A0AC' },
  { name: 'Army Green', value: '#7F9161' },
  { name: 'Gold', value: '#CAB361' },
  { name: 'Orange', value: '#BE6C49' },
] as const;

interface ThemeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  usedThemes?: string[];
  label?: string;
  error?: string;
}

export function ThemeSelector({
  value,
  onChange,
  usedThemes = [],
  label = 'Theme',
  error,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="grid grid-cols-5 gap-2">
        {themeColors.map((theme) => {
          const isSelected = value === theme.value;
          const isUsed = usedThemes.includes(theme.value) && !isSelected;

          return (
            <button
              key={theme.value}
              type="button"
              onClick={() => !isUsed && onChange(theme.value)}
              disabled={isUsed}
              title={isUsed ? `${theme.name} (already used)` : theme.name}
              className={cn(
                'relative h-10 w-full rounded-lg transition-all',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-grey-500)]',
                isUsed && 'opacity-25 cursor-not-allowed',
                isSelected && 'ring-2 ring-offset-2 ring-[var(--color-grey-900)]'
              )}
              style={{ backgroundColor: theme.value }}
            >
              {isSelected && (
                <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected color name */}
      {value && (
        <p className="text-xs text-[var(--color-grey-500)]">
          Selected: {themeColors.find((t) => t.value === value)?.name || 'Custom'}
        </p>
      )}

      {error && (
        <p className="text-xs text-[var(--color-red)]">{error}</p>
      )}
    </div>
  );
}
