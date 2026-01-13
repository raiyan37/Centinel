/**
 * Auth Routes
 *
 * Authentication endpoints for:
 * - User registration
 * - User login
 * - Google OAuth
 * - Get current user
 * - Logout
 * - Refresh token
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

const router = Router();

// =============================================================================
// PUBLIC ROUTES (no authentication required)
// =============================================================================

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', login);

/**
 * POST /api/auth/google
 * Sign in with Google OAuth
 */
router.post('/google', googleAuth);

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
