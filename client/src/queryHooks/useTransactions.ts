/**
 * Transaction Query Hooks
 *
 * CONCEPT: React Query hooks for fetching and mutating transaction data.
 * Includes toast notifications for user feedback.
 *
 * React Query handles:
 * - Caching: Data is cached and reused
 * - Background refetching: Keeps data fresh
 * - Loading/error states: Automatically managed
 * - Mutations: Create/update/delete with cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  type TransactionParams,
  type Transaction,
} from '@/lib/api';
import { getErrorMessage } from '@/lib/errorUtils';

// Query keys for cache management
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (params: TransactionParams) => [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated transactions
 *
 * Usage:
 *   const { data, isLoading, error } = useTransactions({ page: 1, sort: 'Latest' });
 */
export function useTransactions(params?: TransactionParams) {
  return useQuery({
    queryKey: transactionKeys.list(params ?? {}),
    queryFn: () => getTransactions(params),
  });
}

/**
 * Hook to fetch a single transaction
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id, // Only fetch if ID exists
  });
}

/**
 * Hook to create a transaction
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Transaction>) => createTransaction(data),
    onSuccess: () => {
      // Invalidate all transaction lists to refetch
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also invalidate recurring bills since recurring transactions affect that page
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
      // Invalidate overview since balance may have changed
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to update a transaction
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
      updateTransaction(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific transaction and all lists
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a transaction
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['recurringBills'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
