/**
 * Authentication Middleware
 *
 * CONCEPT: This middleware protects routes by verifying JWT tokens.
 * It extracts the token from cookies OR Authorization header, verifies it,
 * and attaches the user ID to the request object.
 *
 * HOW IT WORKS:
 * 1. Check for token in Authorization header (Bearer token) OR cookies
 * 2. Verify the token using JWT_SECRET
 * 3. Attach userId to request
 * 4. Call next() to proceed to the route handler
 *
 * If no valid token, returns 401 Unauthorized.
 *
 * NOTE: Authorization header is preferred for proxy setups (Vercel → Railway)
 * since cookies are not forwarded through server-side proxies.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: mongoose.Types.ObjectId;
    }
  }
}

// JWT payload type
interface JWTPayload {
  userId: string;
  iat: number;
  exp: number;
}

/**
 * Extract token from request
 * Checks Authorization header first, then falls back to cookies
 */
function getTokenFromRequest(req: Request): string | null {
  // Check Authorization header first (for proxy setups)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fall back to cookie (for direct requests)
  if (req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Authenticate Middleware
 *
 * Verifies the JWT token and attaches userId to request.
 * Returns 401 if no valid token is present.
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // #region agent log
  console.log(`[AUTH DEBUG] ${req.method} ${req.path} - Starting auth`);
  // #endregion
  try {
    // Get token from header or cookie
    const token = getTokenFromRequest(req);

    // #region agent log
    console.log(`[AUTH DEBUG] Token: ${token ? 'present' : 'missing'}, AuthHeader: ${!!req.headers.authorization}, Cookie: ${!!req.cookies?.token}`);
    // #endregion

    if (!token) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // #region agent log
    console.log(`[AUTH DEBUG] Decoded token:`, { userId: decoded.userId, type: typeof decoded.userId });
    // #endregion

    // Validate userId before creating ObjectId to prevent BSONError
    if (!decoded.userId || typeof decoded.userId !== 'string') {
      throw new AppError('Invalid token payload. Please log in again.', 401);
    }

    // Attach userId to request
    req.userId = new mongoose.Types.ObjectId(decoded.userId);

    // #region agent log
    console.log(`[AUTH DEBUG] Auth successful for userId: ${req.userId}`);
    // #endregion

    next();
  } catch (error) {
    // #region agent log
    console.error(`[AUTH DEBUG] Error:`, {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      constructor: (error as Error)?.constructor?.name,
      stack: (error as Error)?.stack?.split('\n')[0],
    });
    // #endregion

    if (error instanceof jwt.JsonWebTokenError) {
      // #region agent log
      console.log(`[AUTH DEBUG] Caught as JsonWebTokenError`);
      // #endregion
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      // #region agent log
      console.log(`[AUTH DEBUG] Caught as TokenExpiredError`);
      // #endregion
      res.status(401).json({
        success: false,
        message: 'Token expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }

    if (error instanceof AppError) {
      // #region agent log
      console.log(`[AUTH DEBUG] Caught as AppError, statusCode: ${error.statusCode}`);
      // #endregion
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // Handle BSONError (invalid ObjectId format in token)
    if ((error as Error)?.name === 'BSONError') {
      // #region agent log
      console.log(`[AUTH DEBUG] Caught as BSONError`);
      // #endregion
      res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again.',
        code: 'INVALID_TOKEN',
      });
      return;
    }

    // Fallback: Check by error message in case instanceof fails due to bundling
    if (error instanceof Error && 
        (error.message.includes('Not authenticated') || 
         error.message.includes('Invalid token') ||
         error.message.includes('Please log in'))) {
      // #region agent log
      console.log(`[AUTH DEBUG] Caught by message fallback`);
      // #endregion
      res.status(401).json({
        success: false,
        message: error.message,
        code: 'UNAUTHORIZED',
      });
      return;
    }

    // Unknown error - log detailed info
    // #region agent log
    console.error(`[AUTH DEBUG] UNKNOWN ERROR - Returning 500:`, error);
    // #endregion
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Optional Auth Middleware
 *
 * Similar to authenticate, but doesn't fail if no token.
 * Useful for routes that work with or without authentication.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      req.userId = new mongoose.Types.ObjectId(decoded.userId);
    }

    next();
  } catch {
    // Token invalid or expired, continue without user
    next();
  }
};

export default authenticate;
