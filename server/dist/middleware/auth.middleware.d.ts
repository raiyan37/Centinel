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
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
declare global {
    namespace Express {
        interface Request {
            userId?: mongoose.Types.ObjectId;
        }
    }
}
/**
 * Authenticate Middleware
 *
 * Verifies the JWT token and attaches userId to request.
 * Returns 401 if no valid token is present.
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional Auth Middleware
 *
 * Similar to authenticate, but doesn't fail if no token.
 * Useful for routes that work with or without authentication.
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
export default authenticate;
//# sourceMappingURL=auth.middleware.d.ts.map