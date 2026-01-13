/**
 * Budget Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Whitelist validation for category and theme
 * - Rate limiting for write operations
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation
 * - A04:2021 Insecure Design - Validated schemas
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=budget.routes.d.ts.map