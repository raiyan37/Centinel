/**
 * Authentication Middleware
 *
 * CONCEPT: This middleware protects routes by verifying JWT tokens.
 * It extracts the token from cookies, verifies it, and attaches
 * the user ID to the request object.
 *
 * HOW IT WORKS:
 * 1. Check for token in cookies
 * 2. Verify the token using JWT_SECRET
 * 3. Attach userId to request
 * 4. Call next() to proceed to the route handler
 *
 * If no valid token, returns 401 Unauthorized.
 */
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
/**
 * Authenticate Middleware
 *
 * Verifies the JWT token and attaches userId to request.
 * Returns 401 if no valid token is present.
 */
export const authenticate = (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        if (!token) {
            throw new AppError('Not authenticated. Please log in.', 401);
        }
        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET);
        // Attach userId to request
        req.userId = new mongoose.Types.ObjectId(decoded.userId);
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.',
                code: 'INVALID_TOKEN',
            });
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: 'Token expired. Please log in again.',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }
        if (error instanceof AppError) {
            res.status(error.statusCode).json({
                success: false,
                message: error.message,
                code: 'UNAUTHORIZED',
            });
            return;
        }
        // Unknown error
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
export const optionalAuth = (req, _res, next) => {
    try {
        const token = req.cookies.token;
        if (token) {
            const decoded = jwt.verify(token, env.JWT_SECRET);
            req.userId = new mongoose.Types.ObjectId(decoded.userId);
        }
        next();
    }
    catch {
        // Token invalid or expired, continue without user
        next();
    }
};
export default authenticate;
//# sourceMappingURL=auth.middleware.js.map