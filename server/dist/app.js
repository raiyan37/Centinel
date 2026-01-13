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
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';
// Import routes
import routes from './routes/index.js';
// Create Express app
const app = express();
// =============================================================================
// SECURITY MIDDLEWARE
// =============================================================================
/**
 * Helmet - Security Headers
 *
 * SECURITY: Adds various HTTP headers to protect against common attacks:
 * - X-Content-Type-Options: Prevents MIME sniffing
 * - X-Frame-Options: Prevents clickjacking
 * - X-XSS-Protection: XSS filter (legacy browsers)
 * - Strict-Transport-Security: Forces HTTPS
 * - Content-Security-Policy: Restricts resource loading
 */
app.use(helmet({
    // Configure Content Security Policy
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    // Enable Cross-Origin policies
    crossOriginEmbedderPolicy: false, // Allow embedded resources from other origins
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
/**
 * Trust Proxy
 *
 * SECURITY: Required for rate limiting and IP detection behind reverse proxy
 * Set to 1 for single proxy (e.g., Railway, Heroku)
 */
if (env.isProduction) {
    app.set('trust proxy', 1);
}
/**
 * CORS - Cross-Origin Resource Sharing
 *
 * SECURITY: Restricts which origins can access the API
 * - Only allows requests from CLIENT_URL
 * - Credentials enabled for cookie-based auth
 */
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        // In production, you might want to restrict this
        if (!origin) {
            callback(null, true);
            return;
        }
        // Check if origin matches CLIENT_URL
        const allowedOrigins = [env.CLIENT_URL];
        // In development, also allow localhost variations
        if (env.isDevelopment) {
            allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000');
        }
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            console.warn(`⚠️  CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight for 24 hours
}));
/**
 * General Rate Limiter
 *
 * SECURITY: Baseline rate limiting for all endpoints
 * - 100 requests per 15 minutes per IP
 * - Specific limiters applied at route level for auth
 */
app.use(generalLimiter);
// =============================================================================
// BODY PARSING MIDDLEWARE
// =============================================================================
/**
 * JSON Parser
 *
 * SECURITY:
 * - Limits body size to 10KB to prevent large payload attacks
 * - Only accepts application/json content type
 */
app.use(express.json({
    limit: '10kb', // SECURITY: Prevent large payload DoS attacks
    strict: true, // Only accept arrays and objects
}));
/**
 * URL-encoded Parser
 *
 * SECURITY:
 * - Limits body size to 10KB
 * - extended: false uses querystring library (simpler, more secure)
 */
app.use(express.urlencoded({
    extended: false, // SECURITY: Use simpler querystring parsing
    limit: '10kb',
}));
/**
 * Cookie Parser
 * Parses cookies and makes them available on req.cookies
 */
app.use(cookieParser());
// =============================================================================
// ROUTES
// =============================================================================
/**
 * API Routes
 * All routes are prefixed with /api
 *
 * Authentication is now handled per-route:
 * - /api/auth/* - Public auth routes
 * - /api/transactions, /api/budgets, etc. - Protected routes
 */
app.use('/api', routes);
/**
 * Health Check Endpoint
 * Used to verify the server is running
 */
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// =============================================================================
// ERROR HANDLING
// =============================================================================
/**
 * 404 Handler
 * Catches requests to undefined routes
 */
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        code: 'NOT_FOUND',
    });
});
/**
 * Global Error Handler
 * Catches all errors and sends consistent responses
 */
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map