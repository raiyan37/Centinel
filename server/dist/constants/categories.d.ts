/**
 * Transaction Categories
 *
 * These are the predefined categories for transactions and budgets.
 * They come from the design specification.
 */
export declare const CATEGORIES: readonly ["Entertainment", "Bills", "Groceries", "Dining Out", "Transportation", "Personal Care", "Education", "Lifestyle", "Shopping", "General"];
export type Category = typeof CATEGORIES[number];
export declare const isValidCategory: (value: string) => value is Category;
//# sourceMappingURL=categories.d.ts.map