/**
 * Auth Routes
 *
 * SECURITY: Authentication endpoints with strict rate limiting.
 *
 * Features:
 * - Strict rate limiting on login/register (5 attempts per 15 min)
 * - Input validation with sanitization
 * - Brute force protection
 *
 * OWASP References:
 * - A07:2021 Identification and Authentication Failures
 */
declare const router: import("express-serve-static-core").Router;
export default router;
//# sourceMappingURL=auth.routes.d.ts.map