/**
 * Add Pot Form Component
 *
 * CONCEPT: A modal dialog with a form to create a new savings pot.
 * Uses React Hook Form + Zod for validation.
 *
 * Form Fields:
 * - Pot Name (text input, max 30 chars)
 * - Target Amount (number input)
 * - Theme (color selector)
 *
 * Usage:
 *   <AddPotForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     usedThemes={['#277C78', '#82C9D7']}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePot } from '@/queryHooks';
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
import { ThemeSelector, themeColors } from '@/components/features/Budgets';

// Validation schema
const addPotSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter a pot name')
    .max(30, 'Name cannot exceed 30 characters'),
  target: z
    .number({ message: 'Please enter a valid amount' })
    .positive('Target must be greater than 0')
    .max(1000000, 'Target cannot exceed $1,000,000'),
  theme: z.string().min(1, 'Please select a theme color'),
});

type AddPotFormData = z.infer<typeof addPotSchema>;

interface AddPotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedThemes: string[];
}

export function AddPotForm({
  open,
  onOpenChange,
  usedThemes,
}: AddPotFormProps) {
  const createPot = useCreatePot();

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
  } = useForm<AddPotFormData>({
    resolver: zodResolver(addPotSchema),
    defaultValues: {
      name: '',
      target: undefined,
      theme: firstAvailableTheme,
    },
  });

  const selectedTheme = watch('theme');
  const nameValue = watch('name');
  const maxNameLength = 30;
  const remainingChars = maxNameLength - (nameValue?.length || 0);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        target: undefined,
        theme: firstAvailableTheme,
      });
    }
  }, [open, reset, firstAvailableTheme]);

  const onSubmit = async (data: AddPotFormData) => {
    try {
      await createPot.mutateAsync(data);
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to create pot:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Pot</DialogTitle>
          <DialogDescription>
            Create a pot to set savings targets. These can help keep you on track
            as you save for special purchases.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Pot Name */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Pot Name</Label>
              <span
                className={`text-xs ${
                  remainingChars < 0
                    ? 'text-[var(--color-red)]'
                    : 'text-[var(--color-grey-500)]'
                }`}
              >
                {remainingChars} characters left
              </span>
            </div>
            <Input
              id="name"
              placeholder="e.g. Rainy Days"
              {...register('name')}
              error={!!errors.name}
              maxLength={maxNameLength + 5} // Allow slight overflow for UX
            />
            {errors.name && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="target">Target</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
                $
              </span>
              <Input
                id="target"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 2000"
                className="pl-8"
                {...register('target', { valueAsNumber: true })}
                error={!!errors.target}
              />
            </div>
            {errors.target && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.target.message}
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Pot...' : 'Add Pot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
