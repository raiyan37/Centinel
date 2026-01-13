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
import mongoose from 'mongoose';
// A fixed ObjectId for the mock user
// We'll use this same ID when seeding test data
export const MOCK_USER_ID = new mongoose.Types.ObjectId('000000000000000000000001');
/**
 * Mock User Middleware
 *
 * Assigns a mock user ID to every request.
 * This simulates being logged in without actual authentication.
 */
export const mockUser = (req, _res, next) => {
    req.userId = MOCK_USER_ID;
    next();
};
export default mockUser;
//# sourceMappingURL=mockUser.js.map