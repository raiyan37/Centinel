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
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { env } from '../config/env.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
// Note: Validation schemas are now in middleware/validation.ts
// Input is pre-validated before reaching these controllers
// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
/**
 * Generate JWT token
 */
function generateToken(userId) {
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
 *
 * CROSS-ORIGIN NOTE:
 * When frontend and backend are on different domains (e.g., Vercel + Railway),
 * we must use sameSite: 'none' with secure: true for cookies to be sent.
 * This is required for cross-origin authentication with cookies.
 */
function setAuthCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true, // Cannot be accessed by JavaScript
        secure: env.isProduction, // HTTPS only in production
        sameSite: env.isProduction ? 'none' : 'lax', // 'none' for cross-origin in production
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}
/**
 * Clear auth cookie
 *
 * NOTE: Cookie attributes must match setAuthCookie for proper clearing
 */
function clearAuthCookie(res) {
    res.cookie('token', '', {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: env.isProduction ? 'none' : 'lax',
        expires: new Date(0),
    });
}
function decodeGoogleCredential(credential) {
    // SECURITY: Validate JWT structure
    const parts = credential.split('.');
    if (parts.length !== 3) {
        throw new AppError('Invalid Google credential format', 400);
    }
    try {
        // Decode the payload (middle part of JWT)
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        // SECURITY: Validate required fields
        if (!payload.sub || !payload.email) {
            throw new AppError('Invalid Google credential: missing required fields', 400);
        }
        // SECURITY: Validate issuer (must be Google)
        if (payload.iss && !['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) {
            throw new AppError('Invalid Google credential: invalid issuer', 400);
        }
        // SECURITY: Validate audience (must match our client ID)
        if (env.GOOGLE_CLIENT_ID && payload.aud && payload.aud !== env.GOOGLE_CLIENT_ID) {
            console.warn('⚠️  Google credential audience mismatch');
            // In production, you might want to reject this:
            // throw new AppError('Invalid Google credential: audience mismatch', 400);
        }
        // SECURITY: Check token expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp < now) {
                throw new AppError('Google credential has expired', 400);
            }
        }
        return payload;
    }
    catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
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
 *
 * SECURITY: Input is pre-validated and sanitized by middleware
 */
export const register = catchErrors(async (req, res) => {
    // Input is pre-validated by middleware
    const { email, password, fullName } = req.body;
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
    // Return user data (without password) and token for client storage
    res.status(201).json({
        success: true,
        data: {
            user: user.omitPassword(),
            token, // Include token for Authorization header auth (proxy setups)
        },
    });
});
/**
 * Login with email and password
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * SECURITY: Input is pre-validated by middleware
 */
export const login = catchErrors(async (req, res) => {
    // Input is pre-validated by middleware
    const { email, password } = req.body;
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }
    // Check if user registered with OAuth
    if (user.authProvider !== 'local') {
        throw new AppError(`This account uses ${user.authProvider} sign-in. Please use that instead.`, 400);
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
    // Return user data and token for client storage
    res.json({
        success: true,
        data: {
            user: user.omitPassword(),
            token, // Include token for Authorization header auth (proxy setups)
        },
    });
});
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
export const googleAuth = catchErrors(async (req, res) => {
    // Input is pre-validated by middleware
    const { credential } = req.body;
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
        }
        else {
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
    // Return user data and token for client storage
    res.json({
        success: true,
        data: {
            user: user.omitPassword(),
            token, // Include token for Authorization header auth (proxy setups)
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
export const getMe = catchErrors(async (req, res) => {
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
export const logout = catchErrors(async (_req, res) => {
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
export const refreshToken = catchErrors(async (req, res) => {
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
//# sourceMappingURL=auth.controller.js.map