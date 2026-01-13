/**
 * Mock User Middleware
 *
 * CONCEPT: This middleware assigns a mock user ID to all requests.
 * It allows us to develop and test features WITHOUT authentication.
 *
 * Later, when we add real auth, we'll replace this with actual auth middleware.
 *
 * HOW IT WORKS:
 * 1. This runs on every request
 * 2. It adds a userId to the request object
 * 3. Controllers can then use req.userId to get the "logged in" user
 *
 * IMPORTANT: Remove this in production!
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
export declare const MOCK_USER_ID: mongoose.Types.ObjectId;
/**
 * Mock User Middleware
 *
 * Assigns a mock user ID to every request.
 * This simulates being logged in without actual authentication.
 */
export declare const mockUser: (req: Request, _res: Response, next: NextFunction) => void;
export default mockUser;
//# sourceMappingURL=mockUser.d.ts.map