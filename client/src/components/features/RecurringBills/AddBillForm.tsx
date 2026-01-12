/**
 * Add Bill Form Component
 *
 * CONCEPT: A modal dialog to add a new recurring bill.
 * Creates a recurring transaction that will appear in both
 * the Recurring Bills page and Transactions page.
 *
 * Form Fields:
 * - Vendor/Company name
 * - Monthly amount
 * - Category (defaults to Bills)
 * - Due day of month
 *
 * Usage:
 *   <AddBillForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTransaction } from '@/queryHooks';
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
import { categories } from '@/components/features/Transactions/CategoryFilter';

// Available categories (exclude "All Transactions")
const billCategories = categories.filter((c) => c !== 'All Transactions');

// Validation schema
const addBillSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter the vendor name')
    .max(100, 'Name cannot exceed 100 characters'),
  amount: z
    .number({ invalid_type_error: 'Please enter a valid amount' })
    .positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Please select a category'),
  dueDay: z
    .number({ invalid_type_error: 'Please enter a valid day' })
    .min(1, 'Day must be between 1 and 31')
    .max(31, 'Day must be between 1 and 31'),
});

type AddBillFormData = z.infer<typeof addBillSchema>;

interface AddBillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBillForm({ open, onOpenChange }: AddBillFormProps) {
  const createTransaction = useCreateTransaction();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddBillFormData>({
    resolver: zodResolver(addBillSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      category: 'Bills',
      dueDay: 1,
    },
  });

  const selectedCategory = watch('category');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        amount: undefined,
        category: 'Bills',
        dueDay: 1,
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: AddBillFormData) => {
    try {
      // Create bill template in PREVIOUS month (July 2024) so it shows as "unpaid"
      // The bill will show as upcoming/due-soon until user pays it
      // When paid, a new transaction in August will be created
      const year = 2024;
      const month = 7; // July (previous month) - this makes it show as unpaid
      const date = new Date(year, month - 1, data.dueDay);

      await createTransaction.mutateAsync({
        name: data.name,
        amount: -Math.abs(data.amount), // Bills are expenses (negative)
        category: data.category,
        date: date.toISOString(),
        recurring: true, // This makes it appear in Recurring Bills
        avatar: './assets/images/avatars/default.jpg',
      });
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Failed to create bill:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Recurring Bill</DialogTitle>
          <DialogDescription>
            Add a new recurring bill to track your monthly expenses. The bill will
            appear as unpaid until you manually mark it as paid.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Vendor Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Vendor / Company</Label>
            <Input
              id="name"
              placeholder="e.g. Netflix, Electric Company"
              {...register('name')}
              error={!!errors.name}
            />
            {errors.name && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Monthly Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Amount</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-grey-500)]">
                $
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
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
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {billCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Due Day */}
          <div className="space-y-2">
            <Label htmlFor="dueDay">Due Day of Month</Label>
            <Input
              id="dueDay"
              type="number"
              min="1"
              max="31"
              placeholder="e.g. 15"
              {...register('dueDay', { valueAsNumber: true })}
              error={!!errors.dueDay}
            />
            <p className="text-xs text-[var(--color-grey-500)]">
              The day of each month when this bill is due (1-31)
            </p>
            {errors.dueDay && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.dueDay.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Adding Bill...' : 'Add Bill'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
