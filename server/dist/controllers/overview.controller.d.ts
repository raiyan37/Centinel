/**
 * Overview Controller
 *
 * CONCEPT: Overview aggregates data from all resources.
 *
 * Returns:
 * - Balance (current, income, expenses)
 * - Pots summary (total saved, count)
 * - Budgets summary
 * - Recent transactions
 * - Recurring bills summary
 */
export declare const getOverview: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getBalance: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=overview.controller.d.ts.map