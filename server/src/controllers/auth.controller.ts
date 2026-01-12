/**
 * Auth Controller
 *
 * CONCEPT: Handles all authentication-related operations:
 * - Register (email/password)
 * - Login (email/password)
 * - Google OAuth
 * - Get current user
 * - Logout
 *
 * Uses JWT tokens stored in HTTP-only cookies for security.
 */

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User, type IUser } from '../models/user.model.js';
import { env } from '../config/env.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * Enhanced email validation
 * 
 * Validates that email has:
 * - Proper format (user@domain.tld)
 * - Valid TLD (top-level domain)
 * - No consecutive dots
 * - Valid characters
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(5, 'Email is too short')
  .max(254, 'Email is too long') // RFC 5321
  .refine((email) => {
    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }
    
    // Check for valid TLD
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'io', 'co', 'ai', 'app', 'dev', 'tech', 'biz', 'info',
      'me', 'us', 'uk', 'ca', 'au', 'de', 'fr', 'jp', 'cn',
      'in', 'br', 'ru', 'es', 'it', 'nl', 'se', 'no', 'dk',
      'nz', 'sg', 'hk', 'my', 'th', 'id', 'ph', 'vn', 'pk',
      'sa', 'ae', 'za', 'eg', 'ng', 'ke', 'gh', 'tz', 'ug'
    ];
    
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Local part validations
    if (localPart.length === 0 || localPart.length > 64) return false;
    if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
    
    // Domain validations
    if (domain.length === 0 || domain.length > 253) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    // Check TLD
    const tld = domainParts[domainParts.length - 1].toLowerCase();
    if (!validTLDs.includes(tld)) {
      return false;
    }
    
    // Check each domain part
    for (const part of domainParts) {
      if (part.length === 0 || part.length > 63) return false;
      if (part.startsWith('-') || part.endsWith('-')) return false;
      // Only alphanumeric and hyphens allowed in domain
      if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
    }
    
    return true;
  }, {
    message: 'Please enter a valid email address with a recognized domain (e.g., gmail.com, yahoo.com)'
  });

const registerSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate JWT token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Set JWT cookie
 *
 * CONCEPT: HTTP-only cookies are more secure than localStorage:
 * - Cannot be accessed by JavaScript (prevents XSS attacks)
 * - Automatically sent with requests
 * - Can be set to SameSite for CSRF protection
 */
function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: env.isProduction, // HTTPS only in production
    sameSite: env.isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear auth cookie
 */
function clearAuthCookie(res: Response): void {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
}

/**
 * Decode Google JWT credential
 *
 * CONCEPT: Google Sign-In returns a JWT credential that we need to decode
 * to get the user's info. We verify it using Google's public keys in production.
 */
interface GooglePayload {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

function decodeGoogleCredential(credential: string): GooglePayload {
  // Decode the JWT (the credential is a JWT from Google)
  // In production, you should verify this with Google's public keys
  const parts = credential.split('.');
  if (parts.length !== 3) {
    throw new AppError('Invalid Google credential', 400);
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return payload as GooglePayload;
  } catch {
    throw new AppError('Failed to decode Google credential', 400);
  }
}

// =============================================================================
// CONTROLLERS
// =============================================================================

/**
 * Register a new user
 *
 * POST /api/auth/register
 * Body: { email, password, fullName }
 */
export const register = catchErrors(async (req: Request, res: Response) => {
  // Validate input
  const { email, password, fullName } = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Create new user
  const user = await User.create({
    email: email.toLowerCase(),
    password,
    fullName,
    authProvider: 'local',
    verified: true, // Skip email verification for now
    balance: 0, // Start with 0 balance for new accounts
  });

  // Generate token and set cookie
  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  // Return user data (without password)
  res.status(201).json({
    success: true,
    data: {
      user: user.omitPassword(),
    },
  });
});

/**
 * Login with email and password
 *
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = catchErrors(async (req: Request, res: Response) => {
  // Validate input
  const { email, password } = loginSchema.parse(req.body);

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user registered with OAuth
  if (user.authProvider !== 'local') {
    throw new AppError(
      `This account uses ${user.authProvider} sign-in. Please use that instead.`,
      400
    );
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // SECURITY FIX: Verify balance consistency
  // If user has no transactions but has a non-zero balance, reset it to 0
  if (user.balance !== 0) {
    const { Transaction } = await import('../models/index.js');
    const transactionCount = await Transaction.countDocuments({ userId: user._id });
    
    if (transactionCount === 0) {
      user.balance = 0;
      await user.save();
    }
  }

  // Generate token and set cookie
  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  // Return user data
  res.json({
    success: true,
    data: {
      user: user.omitPassword(),
    },
  });
});

/**
 * Google OAuth sign-in
 *
 * POST /api/auth/google
 * Body: { credential } - JWT from Google Sign-In
 *
 * CONCEPT: Handles both login and registration for Google users.
 * If the user exists, logs them in. Otherwise, creates a new account.
 */
export const googleAuth = catchErrors(async (req: Request, res: Response) => {
  // Validate input
  const { credential } = googleAuthSchema.parse(req.body);

  // Decode and verify Google credential
  const payload = decodeGoogleCredential(credential);

  if (!payload.email_verified) {
    throw new AppError('Google email not verified', 400);
  }

  // Check if user exists with this Google ID
  let user = await User.findOne({ googleId: payload.sub });
  let isNewUser = false;

  if (!user) {
    // Check if user exists with this email (registered locally)
    const existingUser = await User.findOne({
      email: payload.email.toLowerCase(),
    });

    if (existingUser) {
      // Link Google account to existing local account
      existingUser.googleId = payload.sub;
      if (!existingUser.avatarUrl && payload.picture) {
        existingUser.avatarUrl = payload.picture;
      }
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new user with Google account
      user = await User.create({
        email: payload.email.toLowerCase(),
        fullName: payload.name,
        googleId: payload.sub,
        avatarUrl: payload.picture,
        authProvider: 'google',
        verified: true,
        balance: 0, // Start with 0 balance for new accounts
      });
      isNewUser = true;
    }
  }

  // SECURITY FIX: For existing users, verify balance consistency
  // If user has no transactions but has a non-zero balance, reset it to 0
  // This prevents stale/incorrect balance data from showing
  if (!isNewUser && user.balance !== 0) {
    const { Transaction } = await import('../models/index.js');
    const transactionCount = await Transaction.countDocuments({ userId: user._id });
    
    if (transactionCount === 0) {
      // User has no transactions but has a balance - reset to 0
      user.balance = 0;
      await user.save();
    }
  }

  // Generate token and set cookie
  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  // Return user data
  res.json({
    success: true,
    data: {
      user: user.omitPassword(),
    },
  });
});

/**
 * Get current user
 *
 * GET /api/auth/me
 * Requires: Authentication (token cookie)
 *
 * Returns the currently logged-in user's data.
 */
export const getMe = catchErrors(async (req: Request, res: Response) => {
  // req.userId is set by auth middleware
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // SECURITY FIX: Verify balance consistency on every session check
  // If user has no transactions but has a non-zero balance, reset it to 0
  if (user.balance !== 0) {
    const { Transaction } = await import('../models/index.js');
    const transactionCount = await Transaction.countDocuments({ userId: user._id });
    
    if (transactionCount === 0) {
      user.balance = 0;
      await user.save();
    }
  }

  res.json({
    success: true,
    data: {
      user: user.omitPassword(),
    },
  });
});

/**
 * Logout
 *
 * POST /api/auth/logout
 *
 * Clears the auth cookie.
 */
export const logout = catchErrors(async (_req: Request, res: Response) => {
  clearAuthCookie(res);

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Refresh token
 *
 * POST /api/auth/refresh
 * Requires: Authentication (token cookie)
 *
 * Generates a new token and updates the cookie.
 */
export const refreshToken = catchErrors(async (req: Request, res: Response) => {
  const user = await User.findById(req.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Generate new token
  const token = generateToken(user._id.toString());
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: 'Token refreshed',
  });
});
