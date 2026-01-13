/**
 * API Routes Index
 *
 * CONCEPT: This file combines all route modules into one router.
 * Each resource (transactions, budgets, etc.) has its own route file.
 *
 * Routes are mounted at /api (defined in app.ts), so:
 * - /auth routes become /api/auth
 * - /transactions routes become /api/transactions
 * - /budgets routes become /api/budgets
 * - etc.
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=index.d.ts.map