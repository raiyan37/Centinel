/**
 * Deposit Pot Form Component
 *
 * CONCEPT: A modal to add money to a savings pot.
 * Shows current progress and updates preview as user types.
 *
 * Important: Adding money to a pot deducts from the user's
 * current balance (shown on Overview page).
 *
 * Features:
 * - Shows current saved amount and target
 * - Live preview of new amount after deposit
 * - Visual progress bar updates
 * - Validates against available balance (future)
 *
 * Usage:
 *   <DepositPotForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     pot={selectedPot}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDepositToPot } from '@/queryHooks';
import type { Pot } from '@/lib/api';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Progress,
} from '@/components/ui';

interface DepositPotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
}

export function DepositPotForm({
  open,
  onOpenChange,
  pot,
}: DepositPotFormProps) {
  const depositToPot = useDepositToPot();

  // Dynamic validation schema based on pot
  const depositSchema = React.useMemo(() => {
    return z.object({
      amount: z
        .number({ message: 'Please enter a valid amount' })
        .positive('Amount must be greater than 0')
        .max(pot ? pot.target - pot.total : 1000000, 'Amount exceeds remaining target'),
    });
  }, [pot]);

  type DepositFormData = z.infer<typeof depositSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: undefined,
    },
  });

  const amountValue = watch('amount') || 0;

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({ amount: undefined });
    }
  }, [open, reset]);

  const onSubmit = async (data: DepositFormData) => {
    if (!pot) return;

    try {
      await depositToPot.mutateAsync({
        id: pot.id,
        data: { amount: data.amount },
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to deposit to pot:', error);
    }
  };

  if (!pot) return null;

  // Calculate progress
  const newTotal = pot.total + amountValue;
  const newPercentage = calculatePercentage(newTotal, pot.target);
  const remaining = pot.target - pot.total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to '{pot.name}'</DialogTitle>
          <DialogDescription>
            Add money to your pot to keep your savings on track. This will be
            deducted from your current balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Amount Display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-grey-500)]">New Amount</span>
            <span className="text-3xl font-bold text-[var(--color-grey-900)]">
              {formatCurrency(Math.min(newTotal, pot.target))}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress
              value={Math.min(newPercentage, 100)}
              indicatorColor={pot.theme}
              className="h-2"
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className="font-bold"
                style={{ color: pot.theme }}
              >
                {newPercentage.toFixed(1)}%
              </span>
              <span className="text-[var(--color-grey-500)]">
                Target of {formatCurrency(pot.target)}
              </span>
            </div>
          </div>

          {/* Amount to Add */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Add</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={remaining}
                placeholder="e.g. 100"
                className="pl-8"
                {...register('amount', { valueAsNumber: true })}
                error={!!errors.amount}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.amount.message}
              </p>
            )}
            <p className="text-xs text-[var(--color-grey-500)]">
              {formatCurrency(remaining)} remaining to reach target
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Money...' : 'Confirm Addition'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
