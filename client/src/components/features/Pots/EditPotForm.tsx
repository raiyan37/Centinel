/**
 * Edit Pot Form Component
 *
 * CONCEPT: A modal dialog with a form to edit an existing pot.
 * Uses React Hook Form + Zod for validation.
 *
 * Form Fields:
 * - Pot Name (text input, max 30 chars)
 * - Target Amount (number input)
 * - Theme (color selector)
 *
 * Usage:
 *   <EditPotForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     pot={selectedPot}
 *     usedThemes={['#277C78', '#82C9D7']}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePot } from '@/queryHooks';
import type { Pot } from '@/lib/api';
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
import { ThemeSelector } from '@/components/features/Budgets';

// Validation schema
const editPotSchema = z.object({
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

type EditPotFormData = z.infer<typeof editPotSchema>;

interface EditPotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
  usedThemes: string[];
}

export function EditPotForm({
  open,
  onOpenChange,
  pot,
  usedThemes,
}: EditPotFormProps) {
  const updatePot = useUpdatePot();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditPotFormData>({
    resolver: zodResolver(editPotSchema),
    defaultValues: {
      name: pot?.name || '',
      target: pot?.target || 0,
      theme: pot?.theme || '',
    },
  });

  const selectedTheme = watch('theme');
  const nameValue = watch('name');
  const maxNameLength = 30;
  const remainingChars = maxNameLength - (nameValue?.length || 0);

  // Reset form when pot changes or dialog opens
  React.useEffect(() => {
    if (open && pot) {
      reset({
        name: pot.name,
        target: pot.target,
        theme: pot.theme,
      });
    }
  }, [open, pot, reset]);

  const onSubmit = async (data: EditPotFormData) => {
    if (!pot) return;

    try {
      await updatePot.mutateAsync({
        id: pot.id,
        data,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update pot:', error);
    }
  };

  if (!pot) return null;

  // Filter out this pot's current theme from "used" list
  const otherUsedThemes = usedThemes.filter((t) => t !== pot.theme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pot</DialogTitle>
          <DialogDescription>
            If your saving targets change, feel free to update your pots.
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
              maxLength={maxNameLength + 5}
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
