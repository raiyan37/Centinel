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
import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
/**
 * Sanitize string input
 * - Trims whitespace
 * - Escapes HTML entities to prevent XSS
 * - Removes null bytes and control characters
 *
 * SECURITY: Prevents stored XSS and injection attacks
 */
export declare function sanitizeString(input: string): string;
/**
 * Escape regex special characters to prevent ReDoS attacks
 *
 * SECURITY: Prevents Regular Expression Denial of Service
 */
export declare function escapeRegex(str: string): string;
/**
 * MongoDB ObjectId validation
 * SECURITY: Prevents NoSQL injection via malformed IDs
 */
export declare const objectIdSchema: z.ZodString;
/**
 * Enhanced email validation (RFC 5321 compliant)
 * SECURITY: Validates email format strictly to prevent injection
 */
export declare const emailSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
/**
 * Password validation schema
 * SECURITY: Enforces minimum complexity without being overly restrictive
 */
export declare const passwordSchema: z.ZodString;
/**
 * Amount validation schema (for money)
 * SECURITY: Prevents numeric overflow and ensures valid ranges
 */
export declare const amountSchema: z.ZodNumber;
/**
 * Positive amount schema (for deposits, targets, etc.)
 */
export declare const positiveAmountSchema: z.ZodNumber;
/**
 * Date validation schema
 * SECURITY: Validates ISO date format to prevent injection
 */
export declare const dateSchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
/**
 * Category validation schema
 * SECURITY: Whitelist validation - only allows predefined categories
 */
export declare const categorySchema: z.ZodEnum<{
    Entertainment: "Entertainment";
    Bills: "Bills";
    Groceries: "Groceries";
    "Dining Out": "Dining Out";
    Transportation: "Transportation";
    "Personal Care": "Personal Care";
    Education: "Education";
    Lifestyle: "Lifestyle";
    Shopping: "Shopping";
    General: "General";
}>;
/**
 * Theme validation schema
 * SECURITY: Whitelist validation - only allows predefined theme colors
 */
export declare const themeSchema: z.ZodString;
/**
 * Sort option validation schema
 * SECURITY: Whitelist validation - prevents arbitrary sort injection
 */
export declare const sortSchema: z.ZodEnum<{
    Latest: "Latest";
    Oldest: "Oldest";
    "A to Z": "A to Z";
    "Z to A": "Z to A";
    Highest: "Highest";
    Lowest: "Lowest";
}>;
export declare const registerSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    password: z.ZodString;
    fullName: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strict>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    password: z.ZodString;
}, z.core.$strict>;
export declare const googleAuthSchema: z.ZodObject<{
    credential: z.ZodString;
}, z.core.$strict>;
export declare const createTransactionSchema: z.ZodObject<{
    name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    amount: z.ZodNumber;
    category: z.ZodEnum<{
        Entertainment: "Entertainment";
        Bills: "Bills";
        Groceries: "Groceries";
        "Dining Out": "Dining Out";
        Transportation: "Transportation";
        "Personal Care": "Personal Care";
        Education: "Education";
        Lifestyle: "Lifestyle";
        Shopping: "Shopping";
        General: "General";
    }>;
    date: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    avatar: z.ZodDefault<z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>>;
    recurring: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strict>;
export declare const updateTransactionSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    amount: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodEnum<{
        Entertainment: "Entertainment";
        Bills: "Bills";
        Groceries: "Groceries";
        "Dining Out": "Dining Out";
        Transportation: "Transportation";
        "Personal Care": "Personal Care";
        Education: "Education";
        Lifestyle: "Lifestyle";
        Shopping: "Shopping";
        General: "General";
    }>>;
    date: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    avatar: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    recurring: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const transactionQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    search: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    sort: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        Latest: "Latest";
        Oldest: "Oldest";
        "A to Z": "A to Z";
        "Z to A": "Z to A";
        Highest: "Highest";
        Lowest: "Lowest";
    }>>>;
    filter: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createBudgetSchema: z.ZodObject<{
    category: z.ZodEnum<{
        Entertainment: "Entertainment";
        Bills: "Bills";
        Groceries: "Groceries";
        "Dining Out": "Dining Out";
        Transportation: "Transportation";
        "Personal Care": "Personal Care";
        Education: "Education";
        Lifestyle: "Lifestyle";
        Shopping: "Shopping";
        General: "General";
    }>;
    maximum: z.ZodNumber;
    theme: z.ZodString;
}, z.core.$strict>;
export declare const updateBudgetSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<{
        Entertainment: "Entertainment";
        Bills: "Bills";
        Groceries: "Groceries";
        "Dining Out": "Dining Out";
        Transportation: "Transportation";
        "Personal Care": "Personal Care";
        Education: "Education";
        Lifestyle: "Lifestyle";
        Shopping: "Shopping";
        General: "General";
    }>>;
    maximum: z.ZodOptional<z.ZodNumber>;
    theme: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const createPotSchema: z.ZodObject<{
    name: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
    target: z.ZodNumber;
    theme: z.ZodString;
}, z.core.$strict>;
export declare const updatePotSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>>;
    target: z.ZodOptional<z.ZodNumber>;
    theme: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const potTransactionSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, z.core.$strict>;
/**
 * Creates validation middleware for request body
 *
 * SECURITY:
 * - Validates all input against schema
 * - Rejects requests with unexpected fields (strict mode)
 * - Sanitizes all string inputs
 * - Returns consistent error responses
 */
export declare function validateBody<T extends ZodSchema>(schema: T): (req: Request, res: Response, next: NextFunction) => void;
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
export declare function validateQuery<T extends ZodSchema>(schema: T): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Creates validation middleware for URL parameters (e.g., :id)
 *
 * SECURITY:
 * - Validates ObjectId format to prevent NoSQL injection
 */
export declare function validateParams<T extends ZodSchema>(schema: T): (req: Request, res: Response, next: NextFunction) => void;
/**
 * ID parameter schema - validates MongoDB ObjectId
 */
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
declare const _default: {
    validateBody: typeof validateBody;
    validateQuery: typeof validateQuery;
    validateParams: typeof validateParams;
};
export default _default;
//# sourceMappingURL=validation.d.ts.map