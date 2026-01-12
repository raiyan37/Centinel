/**
 * Input Component
 * 
 * Styled text input with error states and optional prefix/suffix icons.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Shows error styling when true
   */
  error?: boolean;
  /**
   * Icon or element to show at the start of the input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon or element to show at the end of the input
   */
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, startIcon, endIcon, ...props }, ref) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              'flex h-11 w-full rounded-lg border bg-white',
              'text-sm text-[var(--color-grey-900)]',
              'placeholder:text-[var(--color-beige-500)]',
              'transition-colors duration-[var(--transition-fast)]',
        // Focus styles - improved for accessibility
        'focus:outline-none focus:border-[var(--color-grey-900)] focus-visible:ring-2 focus-visible:ring-[var(--color-grey-900)] focus-visible:ring-offset-1',
              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-grey-100)]',
              // Padding based on icons
              startIcon ? 'pl-10' : 'pl-4',
              endIcon ? 'pr-10' : 'pr-4',
              // Error or default border
              error
                ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
                : 'border-[var(--color-beige-500)]',
              className
            )}
            aria-invalid={error}
            ref={ref}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
              {endIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex h-11 w-full rounded-lg border bg-white px-4',
          'text-sm text-[var(--color-grey-900)]',
          'placeholder:text-[var(--color-beige-500)]',
          'transition-colors duration-[var(--transition-fast)]',
          // Focus styles - improved for accessibility
          'focus:outline-none focus:border-[var(--color-grey-900)] focus-visible:ring-2 focus-visible:ring-[var(--color-grey-900)] focus-visible:ring-offset-1',
          // Disabled styles
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--color-grey-100)]',
          // Error or default border
          error
            ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
            : 'border-[var(--color-beige-500)]',
          className
        )}
        aria-invalid={error}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
