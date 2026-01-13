/**
 * Pot Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Rate limiting for write operations (especially deposit/withdraw)
 * - Amount validation for financial operations
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation
 * - A04:2021 Insecure Design - Validated schemas
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=pot.routes.d.ts.map