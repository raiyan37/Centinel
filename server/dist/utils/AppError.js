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
export class AppError extends Error {
    statusCode;
    code;
    isOperational;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        // Operational errors are expected errors (like validation)
        // Non-operational are bugs (like programming errors)
        this.isOperational = true;
        // Maintains proper stack trace for debugging
        Error.captureStackTrace(this, this.constructor);
        // Set the prototype explicitly for instanceof to work
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export default AppError;
//# sourceMappingURL=AppError.js.map