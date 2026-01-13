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
];
// Check if a string is a valid category
export const isValidCategory = (value) => {
    return CATEGORIES.includes(value);
};
//# sourceMappingURL=categories.js.map