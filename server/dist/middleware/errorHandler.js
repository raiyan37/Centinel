/**
 * Global Error Handler Middleware
 *
 * SECURITY: Handles errors without leaking sensitive information.
 *
 * Features:
 * - Consistent error response format
 * - No stack traces in production
 * - No internal error details leaked
 * - Proper logging for debugging
 *
 * OWASP References:
 * - A09:2021 Security Logging and Monitoring Failures
 */
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';
import { env } from '../config/env.js';
export const errorHandler = (err, _req, res, _next) => {
    // SECURITY: Log full error for debugging, but don't expose to client
    if (env.isDevelopment) {
        console.error('❌ Error:', err);
    }
    else {
        // In production, log less verbose error info
        console.error('❌ Error:', {
            message: err.message,
            code: err.code,
            name: err.name,
            // Don't log stack traces in production logs (they may contain sensitive paths)
        });
    }
    // Default error values - SECURITY: Generic message hides internal details
    let statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let code = 'INTERNAL_ERROR';
    let errors;
    // Handle our custom AppError (operational errors - safe to show)
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    }
    // Handle Zod validation errors (safe to show)
    else if (err instanceof ZodError) {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
        // Format Zod errors into a friendlier structure
        errors = {};
        err.issues.forEach((issue) => {
            const path = issue.path.join('.') || 'body';
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(issue.message);
        });
    }
    // Handle Mongoose validation errors
    else if (err.name === 'ValidationError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Validation failed';
        code = 'VALIDATION_ERROR';
    }
    // Handle Mongoose CastError (invalid ObjectId)
    else if (err.name === 'CastError') {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid request format';
        code = 'INVALID_FORMAT';
    }
    // Handle duplicate key error (MongoDB)
    else if (err.code === 11000) {
        statusCode = HTTP_STATUS.CONFLICT;
        message = 'Resource already exists';
        code = 'DUPLICATE_ERROR';
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Invalid authentication token';
        code = 'INVALID_TOKEN';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        message = 'Authentication token has expired';
        code = 'TOKEN_EXPIRED';
    }
    // SECURITY: For unknown errors, don't expose internal message
    // Just use the generic message set above
    // Build response
    const response = {
        success: false,
        message,
        code,
    };
    // Add validation errors if present (these are safe to show)
    if (errors) {
        response.errors = errors;
    }
    // SECURITY: Only add stack trace in development
    if (env.isDevelopment && err instanceof Error) {
        response.stack = err.stack;
    }
    // Send error response
    res.status(statusCode).json(response);
};
export default errorHandler;
//# sourceMappingURL=errorHandler.js.map