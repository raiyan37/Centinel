/**
 * Rate Limiting Middleware
 *
 * SECURITY CONCEPT: Tiered rate limiting to protect against abuse.
 *
 * Features:
 * - IP-based rate limiting for all endpoints
 * - Stricter limits for auth endpoints (login/register) to prevent brute force
 * - User-based rate limiting for authenticated endpoints
 * - Graceful 429 responses with Retry-After header
 * - Separate limits for sensitive operations
 *
 * OWASP References:
 * - A07:2021 Identification and Authentication Failures - Prevents brute force
 * - A05:2021 Security Misconfiguration - Proper rate limiting configuration
 *
 * Rate Limit Tiers:
 * - Auth endpoints: 5 requests per 15 minutes (strict, prevents brute force)
 * - API general: 100 requests per 15 minutes (standard)
 * - Write operations: 30 requests per 15 minutes (creation/update/delete)
 * - Read operations: 200 requests per 15 minutes (lenient for reads)
 */
import { type RateLimitRequestHandler } from 'express-rate-limit';
/**
 * Strict rate limiter for authentication endpoints
 *
 * SECURITY:
 * - 10 attempts per 15 minutes per IP (increased for testing)
 * - Prevents brute force attacks on login/register
 * - Protects against credential stuffing
 */
export declare const authLimiter: RateLimitRequestHandler;
/**
 * Rate limiter for password reset / account recovery
 * Even stricter to prevent enumeration attacks
 */
export declare const passwordResetLimiter: RateLimitRequestHandler;
/**
 * General rate limiter for all API endpoints
 *
 * SECURITY:
 * - 100 requests per 15 minutes per IP
 * - Provides baseline protection against DoS
 */
export declare const generalLimiter: RateLimitRequestHandler;
/**
 * Rate limiter for write operations (POST, PUT, DELETE)
 *
 * SECURITY:
 * - 30 write operations per 15 minutes per IP
 * - Prevents mass data manipulation attacks
 * - Protects database from excessive writes
 */
export declare const writeLimiter: RateLimitRequestHandler;
/**
 * User-based rate limiter for authenticated endpoints
 *
 * SECURITY:
 * - Tracks by user ID instead of (or in addition to) IP
 * - Prevents single compromised account from abusing API
 * - 200 requests per 15 minutes per user
 */
export declare const userLimiter: RateLimitRequestHandler;
/**
 * Rate limiter for sensitive operations
 *
 * SECURITY:
 * - Very strict limits for operations like:
 *   - Changing email/password
 *   - Deleting account
 *   - Exporting data
 * - 5 requests per hour
 */
export declare const sensitiveLimiter: RateLimitRequestHandler;
declare const _default: {
    authLimiter: RateLimitRequestHandler;
    passwordResetLimiter: RateLimitRequestHandler;
    generalLimiter: RateLimitRequestHandler;
    writeLimiter: RateLimitRequestHandler;
    userLimiter: RateLimitRequestHandler;
    sensitiveLimiter: RateLimitRequestHandler;
};
export default _default;
//# sourceMappingURL=rateLimiter.d.ts.map