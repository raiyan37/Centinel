/**
 * Budget Query Hooks
 *
 * React Query hooks for fetching and mutating budget data.
 * Includes toast notifications for user feedback.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  type CreateBudgetData,
} from '@/lib/api';
import { getErrorMessage } from '@/lib/errorUtils';

// Query keys
export const budgetKeys = {
  all: ['budgets'] as const,
  lists: () => [...budgetKeys.all, 'list'] as const,
  list: () => [...budgetKeys.lists()] as const,
  details: () => [...budgetKeys.all, 'detail'] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
};

/**
 * Hook to fetch all budgets
 */
export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: getBudgets,
  });
}

/**
 * Hook to fetch a single budget
 */
export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudget(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a budget
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetData) => createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      toast.success('Budget created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to update a budget
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateBudgetData> }) =>
      updateBudget(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      toast.success('Budget updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a budget
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.lists() });
      toast.success('Budget deleted successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
