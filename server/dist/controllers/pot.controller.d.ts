/**
 * Pot Controller
 *
 * SECURITY: Input validation handled by middleware.
 *
 * IMPORTANT - Balance interactions:
 * - Deposit: Takes money FROM balance, adds to pot
 * - Withdraw: Takes money FROM pot, adds to balance
 * - Delete: Returns ALL pot money back to balance
 */
export declare const getPots: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const getPot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Create Pot
 *
 * SECURITY: Input is pre-validated by middleware
 */
export declare const createPot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const updatePot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Delete Pot
 *
 * IMPORTANT: When deleting a pot, all money in it goes back to the balance!
 */
export declare const deletePot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Deposit to Pot
 *
 * Takes money FROM balance and adds it TO the pot.
 * Balance decreases, pot total increases.
 */
export declare const depositToPot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Withdraw from Pot
 *
 * Takes money FROM pot and adds it TO the balance.
 * Pot total decreases, balance increases.
 *
 * SECURITY: Amount is pre-validated by middleware (positive, max $1M)
 */
export declare const withdrawFromPot: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=pot.controller.d.ts.map