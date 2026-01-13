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

import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  getMe,
  logout,
  refreshToken,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  validateBody,
  registerSchema,
  loginSchema,
  googleAuthSchema,
} from '../middleware/validation.js';

const router = Router();

// =============================================================================
// PUBLIC ROUTES (no authentication required)
// =============================================================================

/**
 * POST /api/auth/register
 * Register a new user with email and password
 *
 * SECURITY:
 * - Strict rate limiting (5 attempts per 15 min)
 * - Input validation and sanitization
 */
router.post(
  '/register',
  authLimiter, // SECURITY: Prevent brute force
  validateBody(registerSchema), // SECURITY: Validate and sanitize input
  register
);

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * SECURITY:
 * - Strict rate limiting to prevent brute force attacks
 * - Input validation
 */
router.post(
  '/login',
  authLimiter, // SECURITY: Prevent credential stuffing
  validateBody(loginSchema),
  login
);

/**
 * POST /api/auth/google
 * Sign in with Google OAuth
 *
 * SECURITY:
 * - Rate limited (uses auth limiter)
 * - Credential validation
 */
router.post(
  '/google',
  authLimiter,
  validateBody(googleAuthSchema),
  googleAuth
);

// =============================================================================
// PROTECTED ROUTES (authentication required)
// =============================================================================

/**
 * GET /api/auth/me
 * Get current logged-in user
 */
router.get('/me', authenticate, getMe);

/**
 * POST /api/auth/logout
 * Logout (clear cookie)
 */
router.post('/logout', authenticate, logout);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 */
router.post('/refresh', authenticate, refreshToken);

export default router;
