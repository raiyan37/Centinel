/**
 * Utility Functions
 * 
 * Common utilities used throughout the application.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * 
 * CONCEPT: This function combines clsx (for conditional classes) with
 * tailwind-merge (to resolve Tailwind class conflicts).
 * 
 * Example:
 *   cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6')
 *   // Returns: 'py-2 px-6 bg-blue-500' (px-4 overridden by px-6)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 * 
 * @param amount - The amount to format
 * @param showSign - Whether to show + for positive amounts
 */
export function formatCurrency(amount: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (showSign && amount > 0) {
    return `+${formatted}`;
  }
  if (amount < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

/**
 * Format date
 * 
 * @param date - Date string or Date object
 * @param format - 'short' (Jan 12) or 'long' (January 12, 2024)
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate percentage
 * 
 * @param value - Current value
 * @param total - Total/maximum value
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((value / total) * 100));
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/**
 * Format day with ordinal (e.g., "19th")
 */
export function formatDayWithOrdinal(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  return `${day}${getOrdinalSuffix(day)}`;
}
