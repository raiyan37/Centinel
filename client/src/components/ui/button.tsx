/**
 * Button Component
 * 
 * Versatile button with multiple variants and sizes, built with Radix Slot for composition.
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Button variants using Class Variance Authority (CVA)
const buttonVariants = cva(
  // Base classes applied to all buttons
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-lg font-bold',
    'transition-all duration-[var(--transition-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      /**
       * Visual variants
       * - default: Primary action (dark background)
       * - destructive: Dangerous action (red)
       * - outline: Secondary action with border
       * - secondary: Less prominent action (beige)
       * - ghost: Minimal styling, hover reveals
       * - link: Looks like a text link
       */
      variant: {
        default: [
          'bg-[var(--color-grey-900)] text-white',
          'hover:bg-[var(--color-grey-500)]',
          'focus-visible:ring-[var(--color-grey-900)]',
        ],
        destructive: [
          'bg-[var(--color-red)] text-white',
          'hover:bg-[var(--color-red)]/90',
          'focus-visible:ring-[var(--color-red)]',
        ],
        outline: [
          'border border-[var(--color-grey-300)] bg-transparent text-[var(--color-grey-900)]',
          'hover:bg-[var(--color-beige-100)] hover:border-[var(--color-grey-500)]',
          'focus-visible:ring-[var(--color-grey-500)]',
        ],
        secondary: [
          'bg-[var(--color-beige-100)] text-[var(--color-grey-900)]',
          'hover:bg-[var(--color-beige-500)]/20',
          'focus-visible:ring-[var(--color-beige-500)]',
        ],
        ghost: [
          'text-[var(--color-grey-500)]',
          'hover:bg-[var(--color-beige-100)] hover:text-[var(--color-grey-900)]',
          'focus-visible:ring-[var(--color-grey-300)]',
        ],
        link: [
          'text-[var(--color-grey-500)] underline-offset-4',
          'hover:underline hover:text-[var(--color-grey-900)]',
          'focus-visible:ring-[var(--color-grey-300)]',
        ],
      },
      /**
       * Size variants
       * - sm: Small button for compact areas
       * - default: Standard size for most uses
       * - lg: Large button for primary CTAs
       * - icon: Square button for icon-only
       */
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Button props with CVA variants and asChild for composition
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, the button will render its child element directly,
   * passing all button props to it. Useful for wrapping links.
   */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
