/**
 * Withdraw Pot Form Component
 *
 * CONCEPT: A modal to withdraw money from a savings pot.
 * Shows current progress and updates preview as user types.
 *
 * Important: Withdrawing from a pot adds money back to the
 * user's current balance (shown on Overview page).
 *
 * Features:
 * - Shows current saved amount and target
 * - Live preview of new amount after withdrawal
 * - Visual progress bar updates
 * - Validates against current pot total
 *
 * Usage:
 *   <WithdrawPotForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *     pot={selectedPot}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWithdrawFromPot } from '@/queryHooks';
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

interface WithdrawPotFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pot: Pot | null;
}

export function WithdrawPotForm({
  open,
  onOpenChange,
  pot,
}: WithdrawPotFormProps) {
  const withdrawFromPot = useWithdrawFromPot();

  // Dynamic validation schema based on pot
  const withdrawSchema = React.useMemo(() => {
    return z.object({
      amount: z
        .number({ message: 'Please enter a valid amount' })
        .positive('Amount must be greater than 0')
        .max(pot?.total || 0, 'Amount exceeds available funds'),
    });
  }, [pot]);

  type WithdrawFormData = z.infer<typeof withdrawSchema>;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawFormData>({
    resolver: zodResolver(withdrawSchema),
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

  const onSubmit = async (data: WithdrawFormData) => {
    if (!pot) return;

    try {
      await withdrawFromPot.mutateAsync({
        id: pot.id,
        data: { amount: data.amount },
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to withdraw from pot:', error);
    }
  };

  if (!pot) return null;

  // Calculate progress
  const newTotal = Math.max(0, pot.total - amountValue);
  const newPercentage = calculatePercentage(newTotal, pot.target);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw from '{pot.name}'</DialogTitle>
          <DialogDescription>
            Withdraw money from your pot. This will be added back to your
            current balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Amount Display */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-grey-500)]">New Amount</span>
            <span className="text-3xl font-bold text-[var(--color-grey-900)]">
              {formatCurrency(newTotal)}
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

          {/* Amount to Withdraw */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Withdraw</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={pot.total}
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
              {formatCurrency(pot.total)} available to withdraw
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Withdrawing...' : 'Confirm Withdrawal'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
