/**
 * Budget Controller
 *
 * SECURITY: Input validation handled by middleware.
 *
 * Key calculations:
 * - "spent": Sum of expenses in category for current month (dynamic)
 * - "latest 3 transactions": Most recent transactions in category (any month)
 */
/**
 * Get Budgets with Spent Amount and Latest Transactions
 *
 * For each budget, we calculate:
 * 1. spent: Total expenses in category for current month
 * 2. latestTransactions: 3 most recent transactions (any month)
 */
export declare const getBudgets: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getBudget: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Create Budget
 *
 * SECURITY: Input is pre-validated by middleware
 */
export declare const createBudget: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updateBudget: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const deleteBudget: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=budget.controller.d.ts.map