/**
 * Custom Application Error
 *
 * CONCEPT: Creating custom error classes helps us handle errors consistently.
 * Instead of using generic Error objects, we can include additional info
 * like HTTP status codes and error codes.
 *
 * Usage:
 *   throw new AppError('User not found', 404, 'USER_NOT_FOUND');
 */
import { HttpStatus } from '../constants/http.js';
export declare class AppError extends Error {
    readonly statusCode: HttpStatus;
    readonly code: string;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: HttpStatus, code?: string);
}
export default AppError;
//# sourceMappingURL=AppError.d.ts.map