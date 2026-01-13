/**
 * Transaction Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Rate limiting for write operations
 * - ID validation for URL parameters
 * - Query sanitization for search
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation prevents injection
 * - A04:2021 Insecure Design - Validated schemas
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=transaction.routes.d.ts.map