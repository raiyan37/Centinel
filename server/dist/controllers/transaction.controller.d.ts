/**
 * Transaction Controller
 *
 * SECURITY: Input validation is handled by middleware.
 * Controllers focus on business logic with pre-validated data.
 *
 * Pattern:
 * 1. Receive validated request
 * 2. Execute business logic
 * 3. Send response
 */
/**
 * Get Transactions (Paginated)
 *
 * GET /api/transactions
 *
 * SECURITY: Query params are pre-validated by middleware
 * - page/limit are bounded to safe ranges
 * - search is sanitized and regex-escaped
 * - sort is whitelisted
 * - category is whitelisted
 */
export declare const getTransactions: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Get Single Transaction
 *
 * GET /api/transactions/:id
 */
export declare const getTransaction: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Create Transaction
 *
 * POST /api/transactions
 *
 * SECURITY: Input is pre-validated and sanitized by middleware
 */
export declare const createTransaction: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Update Transaction
 *
 * PUT /api/transactions/:id
 */
export declare const updateTransaction: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Delete Transaction
 *
 * DELETE /api/transactions/:id
 */
export declare const deleteTransaction: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=transaction.controller.d.ts.map