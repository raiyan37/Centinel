/**
 * Transaction Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Rate limiting for write operations
 * - ID validation for URL parameters
 * - Query sanitization for search
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation prevents injection
 * - A04:2021 Insecure Design - Validated schemas
 */

import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller.js';
import { writeLimiter, userLimiter } from '../middleware/rateLimiter.js';
import {
  validateBody,
  validateQuery,
  validateParams,
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  idParamSchema,
} from '../middleware/validation.js';

const router = Router();

// Apply user-based rate limiting to all transaction routes
router.use(userLimiter);

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/transactions
 * List transactions with pagination, search, sort, and filter
 *
 * SECURITY: Query parameters are validated and search is sanitized
 *
 * Query Parameters:
 * - page: Page number (default: 1, max: 10000)
 * - limit: Items per page (default: 10, max: 100)
 * - search: Search by name (sanitized, max 100 chars)
 * - sort: Sort order (whitelisted values only)
 * - category: Filter by category (whitelisted values)
 */
router.get(
  '/',
  validateQuery(transactionQuerySchema),
  transactionController.getTransactions
);

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 *
 * SECURITY: ID format is validated (MongoDB ObjectId)
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  transactionController.getTransaction
);

/**
 * POST /api/transactions
 * Create a new transaction
 *
 * SECURITY:
 * - Rate limited (30 writes per 15 min)
 * - Strict schema validation (rejects unknown fields)
 * - Input sanitization
 *
 * Body:
 * - name: string (1-100 chars, sanitized)
 * - amount: number (non-zero, max ±1B)
 * - category: string (whitelisted)
 * - date: string (ISO date, validated)
 * - avatar?: string (optional, max 500 chars)
 * - recurring?: boolean (optional)
 */
router.post(
  '/',
  writeLimiter,
  validateBody(createTransactionSchema),
  transactionController.createTransaction
);

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 *
 * SECURITY:
 * - Rate limited
 * - ID and body validation
 */
router.put(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  validateBody(updateTransactionSchema),
  transactionController.updateTransaction
);

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 *
 * SECURITY:
 * - Rate limited
 * - ID validation
 */
router.delete(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  transactionController.deleteTransaction
);

export default router;
