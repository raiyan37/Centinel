/**
 * Budget Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Whitelist validation for category and theme
 * - Rate limiting for write operations
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation
 * - A04:2021 Insecure Design - Validated schemas
 */

import { Router } from 'express';
import * as budgetController from '../controllers/budget.controller.js';
import { writeLimiter, userLimiter } from '../middleware/rateLimiter.js';
import {
  validateBody,
  validateParams,
  createBudgetSchema,
  updateBudgetSchema,
  idParamSchema,
} from '../middleware/validation.js';

const router = Router();

// Apply user-based rate limiting to all budget routes
router.use(userLimiter);

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/budgets
 * List all budgets with spent amount
 */
router.get('/', budgetController.getBudgets);

/**
 * GET /api/budgets/:id
 * Get single budget
 *
 * SECURITY: ID format validated
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  budgetController.getBudget
);

/**
 * POST /api/budgets
 * Create budget
 *
 * SECURITY:
 * - Rate limited
 * - Strict schema validation
 * - Category and theme are whitelisted
 */
router.post(
  '/',
  writeLimiter,
  validateBody(createBudgetSchema),
  budgetController.createBudget
);

/**
 * PUT /api/budgets/:id
 * Update budget
 *
 * SECURITY:
 * - Rate limited
 * - ID and body validation
 */
router.put(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  validateBody(updateBudgetSchema),
  budgetController.updateBudget
);

/**
 * DELETE /api/budgets/:id
 * Delete budget
 *
 * SECURITY:
 * - Rate limited
 * - ID validation
 */
router.delete(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  budgetController.deleteBudget
);

export default router;
