/**
 * Recurring Bills Query Hooks
 *
 * CONCEPT: React Query hooks for recurring bills.
 * Bills are separate from transactions - they only track what you owe.
 * Transactions are only created when a bill is PAID.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRecurringBills,
  createRecurringBill,
  payRecurringBill,
  deleteRecurringBill,
  type RecurringBillsParams,
  type CreateRecurringBillData,
} from '@/lib/api';
import { transactionKeys } from './useTransactions';
import { overviewKeys } from './useOverview';

// Query keys
export const recurringBillsKeys = {
  all: ['recurringBills'] as const,
  list: (params?: RecurringBillsParams) => [...recurringBillsKeys.all, 'list', params] as const,
};

/**
 * Hook to fetch recurring bills with summary
 */
export function useRecurringBills(params?: RecurringBillsParams) {
  return useQuery({
    queryKey: recurringBillsKeys.list(params),
    queryFn: () => getRecurringBills(params),
  });
}

/**
 * Hook to create a recurring bill
 * 
 * Creates a bill record only - NO transaction, NO balance impact.
 */
export function useCreateRecurringBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateRecurringBillData) => createRecurringBill(data),
    onSuccess: () => {
      // Invalidate recurring bills list
      queryClient.invalidateQueries({ queryKey: recurringBillsKeys.all });
    },
  });
}

/**
 * Hook to pay a recurring bill
 * 
 * This creates a transaction and affects the balance.
 */
export function usePayRecurringBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, paymentDate }: { id: string; paymentDate?: string }) => 
      payRecurringBill(id, paymentDate),
    onSuccess: () => {
      // Invalidate all affected queries
      queryClient.invalidateQueries({ queryKey: recurringBillsKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: overviewKeys.all });
    },
  });
}

/**
 * Hook to delete a recurring bill
 */
export function useDeleteRecurringBill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteRecurringBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringBillsKeys.all });
    },
  });
}
