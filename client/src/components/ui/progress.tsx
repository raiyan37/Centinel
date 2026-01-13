/**
 * Progress Component
 *
 * CONCEPT: A progress bar built on Radix UI's Progress primitive.
 * Perfect for showing budget usage and pot savings progress.
 *
 * Key Features:
 * - Accessible with proper ARIA attributes
 * - Customizable colors via style prop
 * - Smooth animation
 *
 * Usage:
 *   <Progress value={75} />
 *   <Progress value={50} className="h-3" indicatorColor="#277C78" />
 */

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /**
   * Color of the progress indicator (hex code or CSS variable)
   */
  indicatorColor?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, indicatorColor, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-beige-100)]',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full transition-all duration-300 ease-out"
      style={{
        transform: `translateX(-${100 - (value || 0)}%)`,
        backgroundColor: indicatorColor || 'var(--color-green)',
      }}
    />
  </ProgressPrimitive.Root>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
