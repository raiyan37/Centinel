/**
 * Auth Controller
 *
 * SECURITY: Handles authentication with proper security measures.
 *
 * Features:
 * - Input validation via middleware (pre-validated)
 * - HTTP-only cookies for JWT (XSS protection)
 * - SameSite cookies (CSRF protection)
 * - Rate limiting at route level (brute force protection)
 * - Google token verification
 *
 * OWASP References:
 * - A02:2021 Cryptographic Failures - Secure token handling
 * - A07:2021 Identification and Authentication Failures
 */
/**
 * Register a new user
 *
 * POST /api/auth/register
 * Body: { email, password, fullName }
 *
 * SECURITY: Input is pre-validated and sanitized by middleware
 */
export declare const register: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Login with email and password
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * SECURITY: Input is pre-validated by middleware
 */
export declare const login: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Google OAuth sign-in
 *
 * POST /api/auth/google
 * Body: { credential } - JWT from Google Sign-In
 *
 * SECURITY:
 * - Credential format validated by middleware
 * - Token decoded and verified in decodeGoogleCredential
 * - Handles both login and registration
 */
export declare const googleAuth: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Get current user
 *
 * GET /api/auth/me
 * Requires: Authentication (token cookie)
 *
 * Returns the currently logged-in user's data.
 */
export declare const getMe: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Logout
 *
 * POST /api/auth/logout
 *
 * Clears the auth cookie.
 */
export declare const logout: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
/**
 * Refresh token
 *
 * POST /api/auth/refresh
 * Requires: Authentication (token cookie)
 *
 * Generates a new token and updates the cookie.
 */
export declare const refreshToken: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
//# sourceMappingURL=auth.controller.d.ts.map