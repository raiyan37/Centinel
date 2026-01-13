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
export declare const env: {
    NODE_ENV: string;
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CLIENT_URL: string;
    GOOGLE_CLIENT_ID: string;
    isDevelopment: boolean;
    isProduction: boolean;
};
export default env;
//# sourceMappingURL=env.d.ts.map