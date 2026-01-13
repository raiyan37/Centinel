/**
 * Add Budget Form Component
 *
 * CONCEPT: A modal dialog with a form to create a new budget.
 * Uses React Hook Form + Zod for validation.
 *
 * Form Fields:
 * - Category (dropdown - only unused categories)
 * - Maximum Spend (number input)
 * - Theme (color selector - only unused colors)
 *
 * Usage:
 *   <AddBudgetForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     usedCategories={['Entertainment', 'Bills']}
 *     usedThemes={['#277C78', '#82C9D7']}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateBudget } from '@/queryHooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { ThemeSelector, themeColors } from './ThemeSelector';
import { categories as allCategories } from '@/components/features/Transactions/CategoryFilter';

// Available budget categories (exclude "All Transactions")
const budgetCategories = allCategories.filter((c) => c !== 'All Transactions');

// Validation schema
const addBudgetSchema = z.object({
  category: z.string().min(1, 'Please select a category'),
  maximum: z
    .number({ message: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  theme: z.string().min(1, 'Please select a theme color'),
});

type AddBudgetFormData = z.infer<typeof addBudgetSchema>;

interface AddBudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedCategories: string[];
  usedThemes: string[];
}

export function AddBudgetForm({
  open,
  onOpenChange,
  usedCategories,
  usedThemes,
}: AddBudgetFormProps) {
  const createBudget = useCreateBudget();

  // Available categories (not already used)
  const availableCategories = budgetCategories.filter(
    (cat) => !usedCategories.includes(cat)
  );

  // Find first available theme
  const firstAvailableTheme =
    themeColors.find((t) => !usedThemes.includes(t.value))?.value ||
    themeColors[0].value;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddBudgetFormData>({
    resolver: zodResolver(addBudgetSchema),
    defaultValues: {
      category: '',
      maximum: undefined,
      theme: firstAvailableTheme,
    },
  });

  const selectedTheme = watch('theme');
  const selectedCategory = watch('category');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        category: '',
        maximum: undefined,
        theme: firstAvailableTheme,
      });
    }
  }, [open, reset, firstAvailableTheme]);

  const onSubmit = async (data: AddBudgetFormData) => {
    try {
      await createBudget.mutateAsync(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
          <DialogDescription>
            Choose a category to set a spending budget. These categories can help you
            monitor spending.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Budget Category</Label>
            {availableCategories.length === 0 ? (
              <p className="text-sm text-[var(--color-grey-500)] py-2">
                All categories have budgets. Delete an existing budget to add a new one.
              </p>
            ) : (
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.category && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.category.message}
              </p>
            )}
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
                placeholder="e.g. 2000"
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
            usedThemes={usedThemes}
            error={errors.theme?.message}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || availableCategories.length === 0}
          >
            {isSubmitting ? 'Adding Budget...' : 'Add Budget'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
