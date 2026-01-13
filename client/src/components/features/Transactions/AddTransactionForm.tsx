/**
 * Add Transaction Form Component
 *
 * CONCEPT: A modal dialog to manually add a new transaction.
 * Uses React Hook Form + Zod for validation.
 *
 * Form Fields:
 * - Name (who you paid or received from)
 * - Amount (positive = income, negative = expense)
 * - Category (dropdown)
 * - Date (date picker)
 * - Recurring (checkbox for recurring transactions)
 *
 * Usage:
 *   <AddTransactionForm
 *     open={isOpen}
 *     onOpenChange={setIsOpen}
 *   />
 */

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTransaction, useRecurringBills, useTransactions } from '@/queryHooks';
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
import { categories } from './CategoryFilter';

// Available categories (exclude "All Transactions")
const transactionCategories = categories.filter((c) => c !== 'All Transactions');

// Validation schema
const addTransactionSchema = z.object({
  name: z
    .string()
    .min(1, 'Please enter a name')
    .max(100, 'Name cannot exceed 100 characters'),
  amount: z
    .number({ message: 'Please enter a valid amount' })
    .refine((val) => val !== 0, 'Amount cannot be zero'),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Please select a date'),
  recurring: z.boolean(),
});

type AddTransactionFormData = z.infer<typeof addTransactionSchema>;

interface AddTransactionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTransactionForm({
  open,
  onOpenChange,
}: AddTransactionFormProps) {
  const createTransaction = useCreateTransaction();
  const [isExpense, setIsExpense] = React.useState(true);
  const [selectedBillId, setSelectedBillId] = React.useState<string>('');
  const [isAddingNewPerson, setIsAddingNewPerson] = React.useState(false);
  const [newPersonName, setNewPersonName] = React.useState('');

  // Fetch recurring bills for bill selector
  const { data: billsData } = useRecurringBills();
  const unpaidBills = billsData?.bills.filter((b) => b.status !== 'paid') || [];

  // Fetch all transactions to get unique names for dropdown
  const { data: transactionsData } = useTransactions({ limit: 500 });
  const uniqueNames = React.useMemo(() => {
    if (!transactionsData?.data.transactions) return [];
    const names = new Set(transactionsData.data.transactions.map((t) => t.name));
    return Array.from(names).sort();
  }, [transactionsData]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTransactionFormData>({
    resolver: zodResolver(addTransactionSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      category: '',
      date: '2024-08-19', // August 19, 2024 (current date in app context)
      recurring: false,
    },
  });

  const selectedCategory = watch('category');
  const isBillsCategory = selectedCategory === 'Bills';

  // Handle bill selection
  const handleBillSelect = (billId: string) => {
    setSelectedBillId(billId);
    if (!billId) {
      setValue('name', '');
      setValue('amount', undefined as unknown as number);
      setIsAddingNewPerson(false);
      return;
    }

    const bill = unpaidBills.find((b) => b._id === billId);
    if (bill) {
      setValue('name', bill.name);
      setValue('amount', Math.abs(bill.amount));
      setValue('category', bill.category);
      setValue('recurring', true);
      setIsExpense(true);
      setIsAddingNewPerson(false);
    }
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset({
        name: '',
        amount: undefined,
        category: '',
        date: '2024-08-19', // August 19, 2024 (current date in app context)
        recurring: false,
      });
      setIsExpense(true);
      setSelectedBillId('');
      setIsAddingNewPerson(false);
      setNewPersonName('');
    }
  }, [open, reset]);

  // Handle person selection from dropdown
  const handlePersonSelect = (value: string) => {
    if (value === '__add_new__') {
      setIsAddingNewPerson(true);
      setNewPersonName('');
      setValue('name', '');
    } else {
      setIsAddingNewPerson(false);
      setValue('name', value);
    }
  };

  // Handle new person name change
  const handleNewPersonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPersonName(value);
    setValue('name', value);
  };

  // Cancel adding new person
  const handleCancelNewPerson = () => {
    setIsAddingNewPerson(false);
    setNewPersonName('');
    setValue('name', '');
  };

  const onSubmit = async (data: AddTransactionFormData) => {
    try {
      // Convert amount to negative if expense
      const finalAmount = isExpense ? -Math.abs(data.amount) : Math.abs(data.amount);
      
      await createTransaction.mutateAsync({
        name: data.name,
        amount: finalAmount,
        category: data.category,
        date: data.date,
        recurring: data.recurring,
        avatar: './assets/images/avatars/default.jpg',
      });
      onOpenChange(false);
      reset();
      setSelectedBillId('');
      setIsAddingNewPerson(false);
      setNewPersonName('');
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Transaction Type Toggle */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpense(true);
                  setSelectedBillId('');
                  setIsAddingNewPerson(false);
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isExpense
                    ? 'bg-[var(--color-red)] text-white'
                    : 'bg-[var(--color-beige-100)] text-[var(--color-grey-500)] hover:bg-[var(--color-grey-100)]'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExpense(false);
                  setSelectedBillId('');
                  setIsAddingNewPerson(false);
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  !isExpense
                    ? 'bg-[var(--color-green)] text-white'
                    : 'bg-[var(--color-beige-100)] text-[var(--color-grey-500)] hover:bg-[var(--color-grey-100)]'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setValue('category', value);
                setSelectedBillId('');
                setIsAddingNewPerson(false);
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {transactionCategories.map((category) => (
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

          {/* Bill Selector (only shown when Bills category is selected and is expense) */}
          {isBillsCategory && isExpense && unpaidBills.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="bill-selector">Pay Existing Bill (Optional)</Label>
              <Select value={selectedBillId} onValueChange={handleBillSelect}>
                <SelectTrigger id="bill-selector">
                  <SelectValue placeholder="Choose a bill to pay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Enter manually</SelectItem>
                  {unpaidBills.map((bill) => (
                    <SelectItem key={bill._id} value={bill._id}>
                      {bill.name} - ${Math.abs(bill.amount).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedBillId ? (
                <p className="text-xs text-[var(--color-green)] flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Bill selected - details auto-filled below
                </p>
              ) : (
                <p className="text-xs text-[var(--color-grey-500)]">
                  Select a bill to auto-fill details, or enter manually below
                </p>
              )}
            </div>
          )}

          {/* Name - Person/Vendor Selector */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {isExpense ? 'Paid To' : 'Received From'}
            </Label>
            
            {/* Show dropdown if not adding new person */}
            {!isAddingNewPerson ? (
              <Select
                value={watch('name') || ''}
                onValueChange={handlePersonSelect}
                disabled={!!selectedBillId}
              >
                <SelectTrigger id="name">
                  <SelectValue placeholder={isExpense ? 'Select or add a recipient' : 'Select or add a source'} />
                </SelectTrigger>
                <SelectContent>
                  {/* Existing people */}
                  {uniqueNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                  
                  {/* Separator if there are existing names */}
                  {uniqueNames.length > 0 && (
                    <div className="h-px bg-[var(--color-grey-100)] my-1" />
                  )}
                  
                  {/* Add New option */}
                  <SelectItem value="__add_new__" className="text-[var(--color-green)] font-medium">
                    + Add New
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              /* Input for adding new person */
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="new-person-name"
                    placeholder={isExpense ? 'Enter new recipient name' : 'Enter new source name'}
                    value={newPersonName}
                    onChange={handleNewPersonChange}
                    error={!!errors.name}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancelNewPerson}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-[var(--color-grey-500)]">
                  This person will be saved for future transactions
                </p>
              </div>
            )}
            
            {errors.name && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
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
                disabled={!!selectedBillId}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
              error={!!errors.date}
            />
            {errors.date && (
              <p className="text-xs text-[var(--color-red)]">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Recurring Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="recurring"
              {...register('recurring')}
              className="w-5 h-5 rounded border-[var(--color-grey-300)] text-[var(--color-green)] focus:ring-[var(--color-green)]"
            />
            <Label htmlFor="recurring" className="cursor-pointer">
              This is a recurring transaction
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Transaction'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
