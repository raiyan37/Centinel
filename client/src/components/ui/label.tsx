/**
 * Label Component
 *
 * CONCEPT: A styled label using Radix UI's Label primitive.
 * Radix Label provides proper accessibility associations.
 *
 * Features:
 * - Automatically associates with form controls via `htmlFor`
 * - Accessible by default
 * - Error state styling
 *
 * Usage:
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" />
 */

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-xs font-bold text-[var(--color-grey-500)] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
