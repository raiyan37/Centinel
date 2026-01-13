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

import { rateLimit, type RateLimitRequestHandler, type Options } from 'express-rate-limit';
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/http.js';

// =============================================================================
// RATE LIMIT RESPONSE HANDLER
// =============================================================================

/**
 * Standardized rate limit exceeded response
 *
 * SECURITY: Provides helpful Retry-After header without leaking info
 */
function createRateLimitHandler(limitType: string) {
  return (_req: Request, res: Response): void => {
    const retryAfter = res.getHeader('Retry-After');

    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      message: `Too many requests. Please try again later.`,
      code: 'RATE_LIMIT_EXCEEDED',
      limitType,
      retryAfter: retryAfter ? Number(retryAfter) : undefined,
    });
  };
}

/**
 * Skip rate limiting in certain conditions
 * - Health check endpoint
 * - OPTIONS requests (CORS preflight)
 */
function skipHandler(req: Request): boolean {
  return req.path === '/health' || req.method === 'OPTIONS';
}

// =============================================================================
// RATE LIMITER CONFIGURATIONS
// =============================================================================

/**
 * Base configuration shared by all rate limiters
 */
const baseConfig: Partial<Options> = {
  standardHeaders: true, // Return rate limit info in headers (RateLimit-*)
  legacyHeaders: false, // Disable X-RateLimit-* headers (deprecated)
  skip: skipHandler,
  // Use IP address as identifier
  keyGenerator: (req: Request): string => {
    // Use X-Forwarded-For in production (behind proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
};

// =============================================================================
// AUTH RATE LIMITER (STRICT)
// =============================================================================

/**
 * Strict rate limiter for authentication endpoints
 *
 * SECURITY:
 * - 10 attempts per 15 minutes per IP (increased for testing)
 * - Prevents brute force attacks on login/register
 * - Protects against credential stuffing
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 requests per window (increased from 5 for better UX)
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  handler: createRateLimitHandler('auth'),
  // Slow down responses as limit approaches (optional defense in depth)
  // This makes timing attacks harder
});

/**
 * Rate limiter for password reset / account recovery
 * Even stricter to prevent enumeration attacks
 */
export const passwordResetLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 3, // 3 requests per hour
  message: 'Too many password reset attempts. Please try again in an hour.',
  handler: createRateLimitHandler('password_reset'),
});

// =============================================================================
// GENERAL API RATE LIMITER
// =============================================================================

/**
 * General rate limiter for all API endpoints
 *
 * SECURITY:
 * - 100 requests per 15 minutes per IP
 * - Provides baseline protection against DoS
 */
export const generalLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // 100 requests per window
  message: 'Too many requests. Please try again later.',
  handler: createRateLimitHandler('general'),
});

// =============================================================================
// WRITE OPERATIONS RATE LIMITER
// =============================================================================

/**
 * Rate limiter for write operations (POST, PUT, DELETE)
 *
 * SECURITY:
 * - 30 write operations per 15 minutes per IP
 * - Prevents mass data manipulation attacks
 * - Protects database from excessive writes
 */
export const writeLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 write operations per window
  message: 'Too many write operations. Please slow down.',
  handler: createRateLimitHandler('write'),
});

// =============================================================================
// USER-BASED RATE LIMITER
// =============================================================================

/**
 * User-based rate limiter for authenticated endpoints
 *
 * SECURITY:
 * - Tracks by user ID instead of (or in addition to) IP
 * - Prevents single compromised account from abusing API
 * - 200 requests per 15 minutes per user
 */
export const userLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // 200 requests per user per window
  message: 'Too many requests from your account. Please slow down.',
  handler: createRateLimitHandler('user'),
  // Use user ID if authenticated, fall back to IP
  keyGenerator: (req: Request): string => {
    if (req.userId) {
      return `user:${req.userId.toString()}`;
    }
    // Fall back to IP for unauthenticated requests
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return `ip:${forwarded.split(',')[0].trim()}`;
    }
    return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
});

// =============================================================================
// SENSITIVE OPERATIONS RATE LIMITER
// =============================================================================

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
export const sensitiveLimiter: RateLimitRequestHandler = rateLimit({
  ...baseConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // 5 requests per hour
  message: 'Too many sensitive operations. Please try again later.',
  handler: createRateLimitHandler('sensitive'),
});

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  authLimiter,
  passwordResetLimiter,
  generalLimiter,
  writeLimiter,
  userLimiter,
  sensitiveLimiter,
};
