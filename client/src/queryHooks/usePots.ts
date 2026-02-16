/**
 * Pot Query Hooks
 *
 * React Query hooks for fetching and mutating pot data.
 * Includes toast notifications for user feedback.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getPots,
  getPot,
  createPot,
  updatePot,
  deletePot,
  depositToPot,
  withdrawFromPot,
  type CreatePotData,
  type PotTransactionData,
} from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { getErrorMessage } from '@/lib/errorUtils';

// Query keys
export const potKeys = {
  all: ['pots'] as const,
  lists: () => [...potKeys.all, 'list'] as const,
  list: () => [...potKeys.lists()] as const,
  details: () => [...potKeys.all, 'detail'] as const,
  detail: (id: string) => [...potKeys.details(), id] as const,
};

/**
 * Hook to fetch all pots
 */
export function usePots() {
  return useQuery({
    queryKey: potKeys.list(),
    queryFn: getPots,
  });
}

/**
 * Hook to fetch a single pot
 */
export function usePot(id: string) {
  return useQuery({
    queryKey: potKeys.detail(id),
    queryFn: () => getPot(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a pot
 */
export function useCreatePot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePotData) => createPot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: potKeys.lists() });
      toast.success('Pot created successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to update a pot
 */
export function useUpdatePot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePotData> }) =>
      updatePot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: potKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: potKeys.lists() });
      toast.success('Pot updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to delete a pot
 */
export function useDeletePot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: potKeys.lists() });
      // Also invalidate overview since balance changes
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success('Pot deleted. Funds returned to balance.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to deposit money into a pot
 */
export function useDepositToPot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PotTransactionData }) =>
      depositToPot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: potKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: potKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success(`${formatCurrency(variables.data.amount)} added to pot`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

/**
 * Hook to withdraw money from a pot
 */
export function useWithdrawFromPot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PotTransactionData }) =>
      withdrawFromPot(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: potKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: potKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      toast.success(`${formatCurrency(variables.data.amount)} withdrawn from pot`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
