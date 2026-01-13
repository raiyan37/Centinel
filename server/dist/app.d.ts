/**
 * Express Application Setup
 *
 * CONCEPT: This file configures the Express application.
 * It sets up middleware, routes, and error handling.
 *
 * Middleware runs in ORDER - top to bottom.
 * Think of it like a pipeline that requests flow through.
 *
 * SECURITY: Implements multiple layers of protection:
 * - Security headers (Helmet)
 * - CORS with strict origin
 * - Rate limiting (IP and user-based)
 * - Body size limits
 * - Input validation (via routes)
 */
import { Express } from 'express';
declare const app: Express;
export default app;
//# sourceMappingURL=app.d.ts.map