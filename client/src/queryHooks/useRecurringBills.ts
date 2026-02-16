/**
 * Recurring Bills Query Hooks
 *
 * CONCEPT: React Query hook for fetching recurring bills with
 * calculated status (paid, upcoming, due-soon).
 */

import { useQuery } from '@tanstack/react-query';
import { getRecurringBills, type RecurringBillsParams } from '@/lib/api';

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
