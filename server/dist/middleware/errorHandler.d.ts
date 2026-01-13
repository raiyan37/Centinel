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
import { ErrorRequestHandler } from 'express';
export declare const errorHandler: ErrorRequestHandler;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map