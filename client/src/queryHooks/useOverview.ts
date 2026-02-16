/**
 * Overview Query Hooks
 * 
 * React Query hooks for fetching dashboard/overview data.
 */

import { useQuery } from '@tanstack/react-query';
import { getOverview, getBalance } from '@/lib/api';

// Query keys
export const overviewKeys = {
  all: ['overview'] as const,
  overview: () => [...overviewKeys.all, 'data'] as const,
  balance: () => [...overviewKeys.all, 'balance'] as const,
};

/**
 * Hook to fetch overview/dashboard data
 */
export function useOverview() {
  return useQuery({
    queryKey: overviewKeys.overview(),
    queryFn: getOverview,
  });
}

/**
 * Hook to fetch current balance
 */
export function useBalance() {
  return useQuery({
    queryKey: overviewKeys.balance(),
    queryFn: getBalance,
  });
}
