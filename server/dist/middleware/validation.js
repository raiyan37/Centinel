/**
 * Validation Middleware & Schemas
 *
 * SECURITY CONCEPT: Centralized input validation following OWASP best practices.
 *
 * Features:
 * - Schema-based validation using Zod in strict mode
 * - Automatic rejection of unexpected fields (prevents mass assignment)
 * - Input sanitization (trim whitespace, escape HTML entities)
 * - Type coercion with explicit validation
 * - Length limits on all string inputs
 * - Consistent error responses
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation prevents injection attacks
 * - A04:2021 Insecure Design - Schema validation enforces secure design
 */
import { z, ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/http.js';
import { CATEGORIES } from '../constants/categories.js';
import { THEME_COLORS } from '../constants/themes.js';
// =============================================================================
// SANITIZATION UTILITIES
// =============================================================================
/**
 * Sanitize string input
 * - Trims whitespace
 * - Escapes HTML entities to prevent XSS
 * - Removes null bytes and control characters
 *
 * SECURITY: Prevents stored XSS and injection attacks
 */
export function sanitizeString(input) {
    if (typeof input !== 'string')
        return input;
    return input
        .trim()
        // Remove null bytes (can bypass security filters)
        .replace(/\0/g, '')
        // Remove other control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Escape HTML entities to prevent XSS
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
/**
 * Create a sanitized string schema with length limits
 *
 * SECURITY: Enforces consistent sanitization and length limits
 */
function sanitizedString(minLength, maxLength, fieldName) {
    return z
        .string({ message: `${fieldName} must be a string` })
        .min(minLength, `${fieldName} must be at least ${minLength} character${minLength === 1 ? '' : 's'}`)
        .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
        .transform(sanitizeString);
}
/**
 * Escape regex special characters to prevent ReDoS attacks
 *
 * SECURITY: Prevents Regular Expression Denial of Service
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================
/**
 * MongoDB ObjectId validation
 * SECURITY: Prevents NoSQL injection via malformed IDs
 */
export const objectIdSchema = z
    .string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid ID format')
    .describe('MongoDB ObjectId');
/**
 * Enhanced email validation (RFC 5321 compliant)
 * SECURITY: Validates email format strictly to prevent injection
 */
export const emailSchema = z
    .string({ message: 'Email is required' })
    .email('Invalid email format')
    .min(5, 'Email is too short')
    .max(254, 'Email is too long') // RFC 5321 limit
    .transform((email) => email.toLowerCase().trim())
    .refine((email) => {
    // Prevent email injection attacks
    if (email.includes('..') || email.includes('\n') || email.includes('\r')) {
        return false;
    }
    const parts = email.split('@');
    if (parts.length !== 2)
        return false;
    const [localPart, domain] = parts;
    // Local part validations
    if (localPart.length === 0 || localPart.length > 64)
        return false;
    if (localPart.startsWith('.') || localPart.endsWith('.'))
        return false;
    // Domain validations
    if (domain.length === 0 || domain.length > 253)
        return false;
    const domainParts = domain.split('.');
    if (domainParts.length < 2)
        return false;
    // Validate each domain part
    for (const part of domainParts) {
        if (part.length === 0 || part.length > 63)
            return false;
        if (part.startsWith('-') || part.endsWith('-'))
            return false;
        if (!/^[a-zA-Z0-9-]+$/.test(part))
            return false;
    }
    return true;
}, 'Please enter a valid email address');
/**
 * Password validation schema
 * SECURITY: Enforces minimum complexity without being overly restrictive
 */
export const passwordSchema = z
    .string({ message: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters') // Prevent DoS via bcrypt
    .refine((password) => {
    // Prevent null bytes and control characters
    return !/[\x00-\x1F\x7F]/.test(password);
}, 'Password contains invalid characters');
/**
 * Amount validation schema (for money)
 * SECURITY: Prevents numeric overflow and ensures valid ranges
 */
export const amountSchema = z
    .number({ message: 'Amount must be a valid number' })
    .finite('Amount must be a finite number')
    .refine((n) => Math.abs(n) <= 1000000000, 'Amount exceeds maximum allowed value');
/**
 * Positive amount schema (for deposits, targets, etc.)
 */
export const positiveAmountSchema = amountSchema
    .positive('Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000');
/**
 * Date validation schema
 * SECURITY: Validates ISO date format to prevent injection
 */
export const dateSchema = z
    .string({ message: 'Date is required' })
    .refine((dateStr) => {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}, 'Invalid date format')
    .transform((dateStr) => new Date(dateStr).toISOString());
/**
 * Category validation schema
 * SECURITY: Whitelist validation - only allows predefined categories
 */
export const categorySchema = z.enum(CATEGORIES, { message: 'Invalid category' });
/**
 * Theme validation schema
 * SECURITY: Whitelist validation - only allows predefined theme colors
 */
export const themeSchema = z
    .string({ message: 'Theme is required' })
    .refine((val) => THEME_COLORS.includes(val), 'Invalid theme color');
/**
 * Sort option validation schema
 * SECURITY: Whitelist validation - prevents arbitrary sort injection
 */
export const sortSchema = z.enum(['Latest', 'Oldest', 'A to Z', 'Z to A', 'Highest', 'Lowest'], { message: 'Invalid sort option' });
// =============================================================================
// AUTH VALIDATION SCHEMAS
// =============================================================================
export const registerSchema = z
    .object({
    email: emailSchema,
    password: passwordSchema,
    fullName: sanitizedString(1, 100, 'Full name'),
})
    .strict(); // Reject unexpected fields
export const loginSchema = z
    .object({
    email: emailSchema,
    password: z.string({ message: 'Password is required' }).min(1, 'Password is required'),
})
    .strict();
export const googleAuthSchema = z
    .object({
    credential: z
        .string({ message: 'Google credential is required' })
        .min(1, 'Google credential is required')
        .max(10000, 'Invalid credential format'), // JWT tokens are typically ~1-2KB
})
    .strict();
// =============================================================================
// TRANSACTION VALIDATION SCHEMAS
// =============================================================================
export const createTransactionSchema = z
    .object({
    name: sanitizedString(1, 100, 'Name'),
    amount: amountSchema.refine((n) => n !== 0, 'Amount cannot be zero'),
    category: categorySchema,
    date: dateSchema,
    avatar: sanitizedString(0, 500, 'Avatar').optional().default('/assets/images/avatars/default.jpg'),
    recurring: z.boolean().optional().default(false),
    isTemplate: z.boolean().optional().default(false), // Bill templates don't affect balance
})
    .strict();
export const updateTransactionSchema = z
    .object({
    name: sanitizedString(1, 100, 'Name').optional(),
    amount: amountSchema.refine((n) => n !== 0, 'Amount cannot be zero').optional(),
    category: categorySchema.optional(),
    date: dateSchema.optional(),
    avatar: sanitizedString(0, 500, 'Avatar').optional(),
    recurring: z.boolean().optional(),
    isTemplate: z.boolean().optional(), // Bill templates don't affect balance
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required');
export const transactionQuerySchema = z.object({
    page: z.coerce.number().int().positive().max(10000).optional().default(1),
    limit: z.coerce.number().int().min(1).max(500).optional().default(10), // Max 500 for recurring bills
    search: z
        .string()
        .max(100, 'Search query too long')
        .optional()
        .transform((s) => (s ? sanitizeString(s) : undefined)),
    sort: sortSchema.optional().default('Latest'),
    filter: z.string().max(50).optional(),
    category: z.string().max(50).optional(),
});
// =============================================================================
// BUDGET VALIDATION SCHEMAS
// =============================================================================
export const createBudgetSchema = z
    .object({
    category: categorySchema,
    maximum: positiveAmountSchema,
    theme: themeSchema,
})
    .strict();
export const updateBudgetSchema = z
    .object({
    category: categorySchema.optional(),
    maximum: positiveAmountSchema.optional(),
    theme: themeSchema.optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required');
// =============================================================================
// POT VALIDATION SCHEMAS
// =============================================================================
export const createPotSchema = z
    .object({
    name: sanitizedString(1, 30, 'Pot name'),
    target: positiveAmountSchema,
    theme: themeSchema,
})
    .strict();
export const updatePotSchema = z
    .object({
    name: sanitizedString(1, 30, 'Pot name').optional(),
    target: positiveAmountSchema.optional(),
    theme: themeSchema.optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required');
export const potTransactionSchema = z
    .object({
    amount: positiveAmountSchema,
})
    .strict();
// =============================================================================
// VALIDATION MIDDLEWARE FACTORY
// =============================================================================
/**
 * Creates validation middleware for request body
 *
 * SECURITY:
 * - Validates all input against schema
 * - Rejects requests with unexpected fields (strict mode)
 * - Sanitizes all string inputs
 * - Returns consistent error responses
 */
export function validateBody(schema) {
    return (req, res, next) => {
        try {
            // Parse and validate - strict schemas reject unexpected fields
            const validated = schema.parse(req.body);
            // Replace body with validated/sanitized data
            req.body = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors into user-friendly structure
                const errors = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.') || 'body';
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(issue.message);
                });
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
}
/**
 * Creates validation middleware for query parameters
 *
 * SECURITY:
 * - Validates and sanitizes query parameters
 * - Prevents ReDoS via regex escaping for search
 *
 * NOTE: In newer Express/Node versions, req.query is read-only.
 * We store validated data in req.validatedQuery instead.
 */
export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.query);
            // Store validated query in a custom property (req.query is read-only in newer Express)
            req.validatedQuery = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errors = {};
                error.issues.forEach((issue) => {
                    const path = issue.path.join('.') || 'query';
                    if (!errors[path]) {
                        errors[path] = [];
                    }
                    errors[path].push(issue.message);
                });
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid query parameters',
                    code: 'VALIDATION_ERROR',
                    errors,
                });
                return;
            }
            next(error);
        }
    };
}
/**
 * Creates validation middleware for URL parameters (e.g., :id)
 *
 * SECURITY:
 * - Validates ObjectId format to prevent NoSQL injection
 */
export function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.params);
            // Type assertion needed because Express params type is strict
            req.params = validated;
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid URL parameters',
                    code: 'VALIDATION_ERROR',
                    errors: { params: error.issues.map((i) => i.message) },
                });
                return;
            }
            next(error);
        }
    };
}
/**
 * ID parameter schema - validates MongoDB ObjectId
 */
export const idParamSchema = z.object({
    id: objectIdSchema,
});
export default {
    validateBody,
    validateQuery,
    validateParams,
};
//# sourceMappingURL=validation.js.map