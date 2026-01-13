/**
 * Edit Budget Form Component
 *
 * CONCEPT: A modal dialog with a form to edit an existing budget.
 * Uses React Hook Form + Zod for validation.
 *
 * Form Fields:
 * - Category (displayed, not editable)
 * - Maximum Spend (number input)
 * - Theme (color selector)
 *
 * Usage:
 *   <EditBudgetForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     budget={selectedBudget}
 *     usedThemes={['#277C78', '#82C9D7']}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdateBudget } from '@/queryHooks';
import type { Budget } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { ThemeSelector } from './ThemeSelector';

// Validation schema
const editBudgetSchema = z.object({
  maximum: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  theme: z.string().min(1, 'Please select a theme color'),
});

type EditBudgetFormData = z.infer<typeof editBudgetSchema>;

interface EditBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: Budget | null;
  usedThemes: string[];
}

export function EditBudgetForm({
  open,
  onOpenChange,
  budget,
  usedThemes,
}: EditBudgetFormProps) {
  const updateBudget = useUpdateBudget();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditBudgetFormData>({
    resolver: zodResolver(editBudgetSchema),
    defaultValues: {
      maximum: budget?.maximum || 0,
      theme: budget?.theme || '',
    },
  });

  const selectedTheme = watch('theme');

  // Reset form when budget changes or dialog opens
  React.useEffect(() => {
    if (open && budget) {
      reset({
        maximum: budget.maximum,
        theme: budget.theme,
      });
    }
  }, [open, budget, reset]);

  const onSubmit = async (data: EditBudgetFormData) => {
    if (!budget) return;

    try {
      await updateBudget.mutateAsync({
        id: budget._id,
        data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  if (!budget) return null;

  // Filter out this budget's current theme from "used" list
  const otherUsedThemes = usedThemes.filter((t) => t !== budget.theme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update your budget limit and theme color. As your needs change, feel free
            to update your spending limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category (read-only) */}
          <div className="space-y-2">
            <Label>Budget Category</Label>
            <div className="flex items-center gap-3 h-11 px-4 border border-[var(--color-grey-100)] rounded-lg bg-[var(--color-beige-100)]">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: budget.theme }}
              />
              <span className="font-medium text-[var(--color-grey-900)]">
                {budget.category}
              </span>
            </div>
          </div>

          {/* Maximum Spend */}
          <div className="space-y-2">
            <Label htmlFor="maximum">Maximum Spend</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
                $
              </span>
              <Input
                id="maximum"
                type="number"
                step="0.01"
                min="0"
                className="pl-8"
                {...register('maximum', { valueAsNumber: true })}
                error={!!errors.maximum}
              />
            </div>
            {errors.maximum && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.maximum.message}
              </p>
            )}
          </div>

          {/* Theme Selector */}
          <ThemeSelector
            value={selectedTheme}
            onChange={(value) => setValue('theme', value)}
            usedThemes={otherUsedThemes}
            error={errors.theme?.message}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
