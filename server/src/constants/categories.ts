/**
 * Transaction Categories
 * 
 * These are the predefined categories for transactions and budgets.
 * They come from the design specification.
 */

export const CATEGORIES = [
  'Entertainment',
  'Bills',
  'Groceries',
  'Dining Out',
  'Transportation',
  'Personal Care',
  'Education',
  'Lifestyle',
  'Shopping',
  'General',
] as const;

// TypeScript type for categories
export type Category = typeof CATEGORIES[number];

// Check if a string is a valid category
export const isValidCategory = (value: string): value is Category => {
  return CATEGORIES.includes(value as Category);
};
