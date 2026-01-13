/**
 * Environment Configuration
 *
 * SECURITY CONCEPT: Centralized environment variable management with validation.
 *
 * Features:
 * - Required variables must be set (no unsafe defaults for secrets)
 * - Type validation for numeric values
 * - Security warnings for development defaults
 *
 * OWASP References:
 * - A02:2021 Cryptographic Failures - Proper secret management
 * - A05:2021 Security Misconfiguration - Validated configuration
 */
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
// =============================================================================
// ENVIRONMENT VARIABLE HELPERS
// =============================================================================
/**
 * Get optional environment variable with default
 */
const getOptional = (key, defaultValue) => {
    return process.env[key] || defaultValue;
};
/**
 * Get integer environment variable
 */
const getInt = (key, defaultValue) => {
    const value = process.env[key];
    if (!value)
        return defaultValue;
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} must be a valid integer`);
    }
    return parsed;
};
// =============================================================================
// ENVIRONMENT DETECTION
// =============================================================================
const NODE_ENV = getOptional('NODE_ENV', 'development');
const isDevelopment = NODE_ENV === 'development';
const isProduction = NODE_ENV === 'production';
// =============================================================================
// SECURITY VALIDATION
// =============================================================================
/**
 * Validate JWT_SECRET
 *
 * SECURITY:
 * - Must be set in production (no defaults)
 * - Must be at least 32 characters for security
 * - Warns about weak secrets in development
 */
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (isProduction) {
        // SECURITY: JWT_SECRET is required in production
        if (!secret) {
            throw new Error('❌ SECURITY ERROR: JWT_SECRET is required in production.\n' +
                '   Generate a strong secret: openssl rand -base64 64');
        }
        // SECURITY: Ensure minimum length for security
        if (secret.length < 32) {
            throw new Error('❌ SECURITY ERROR: JWT_SECRET must be at least 32 characters in production.\n' +
                '   Generate a strong secret: openssl rand -base64 64');
        }
        return secret;
    }
    // Development: Allow default but warn
    if (!secret) {
        console.warn('⚠️  WARNING: Using default JWT_SECRET in development.\n' +
            '   Set JWT_SECRET environment variable for better security.');
        return 'dev-secret-change-in-production-min-32-chars';
    }
    return secret;
};
/**
 * Validate GOOGLE_CLIENT_ID
 *
 * SECURITY: Required for Google OAuth functionality
 */
const getGoogleClientId = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (isProduction && !clientId) {
        console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID not set. Google OAuth will not work.');
    }
    return clientId || '';
};
/**
 * Validate MONGO_URI
 *
 * SECURITY: Ensure database connection string is set in production
 */
const getMongoUri = () => {
    const uri = process.env.MONGO_URI;
    if (isProduction && !uri) {
        throw new Error('❌ SECURITY ERROR: MONGO_URI is required in production.\n' +
            '   Set your MongoDB connection string.');
    }
    return uri || 'mongodb://localhost:27017/centinel';
};
// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================
export const env = {
    // Server
    NODE_ENV,
    PORT: getInt('PORT', 3001),
    // Database
    MONGO_URI: getMongoUri(),
    // JWT - SECURITY: No unsafe default in production
    JWT_SECRET: getJwtSecret(),
    JWT_EXPIRES_IN: getOptional('JWT_EXPIRES_IN', '7d'),
    // CORS
    CLIENT_URL: getOptional('CLIENT_URL', 'http://localhost:5173'),
    // Google OAuth
    GOOGLE_CLIENT_ID: getGoogleClientId(),
    // Helper properties
    isDevelopment,
    isProduction,
};
// =============================================================================
// STARTUP SECURITY CHECK
// =============================================================================
/**
 * Log security configuration status on startup
 */
if (isDevelopment) {
    console.log('🔒 Security Configuration:');
    console.log(`   Environment: ${NODE_ENV}`);
    console.log(`   JWT Secret: ${env.JWT_SECRET ? '✓ Set' : '⚠️  Using default'}`);
    console.log(`   Google OAuth: ${env.GOOGLE_CLIENT_ID ? '✓ Configured' : '⚠️  Not configured'}`);
    console.log(`   Database: ${env.MONGO_URI ? '✓ Set' : '⚠️  Using default'}`);
}
export default env;
//# sourceMappingURL=env.js.map