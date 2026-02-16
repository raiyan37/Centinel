/**
 * Pot Routes
 *
 * SECURITY: All routes include input validation and rate limiting.
 *
 * Features:
 * - Schema-based validation for all inputs
 * - Rate limiting for write operations (especially deposit/withdraw)
 * - Amount validation for financial operations
 *
 * OWASP References:
 * - A03:2021 Injection - Input validation
 * - A04:2021 Insecure Design - Validated schemas
 */

import { Router } from 'express';
import * as potController from '../controllers/pot.controller.js';
import { writeLimiter, userLimiter } from '../middleware/rateLimiter.js';
import {
  validateBody,
  validateParams,
  createPotSchema,
  updatePotSchema,
  potTransactionSchema,
  idParamSchema,
} from '../middleware/validation.js';

const router = Router();

// Apply user-based rate limiting to all pot routes
router.use(userLimiter);

// =============================================================================
// ROUTES
// =============================================================================

/**
 * GET /api/pots
 * List all pots
 */
router.get('/', potController.getPots);

/**
 * GET /api/pots/:id
 * Get single pot
 *
 * SECURITY: ID format validated
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  potController.getPot
);

/**
 * POST /api/pots
 * Create pot
 *
 * SECURITY:
 * - Rate limited
 * - Strict schema validation
 * - Name sanitized, theme whitelisted
 */
router.post(
  '/',
  writeLimiter,
  validateBody(createPotSchema),
  potController.createPot
);

/**
 * PUT /api/pots/:id
 * Update pot
 *
 * SECURITY:
 * - Rate limited
 * - ID and body validation
 */
router.put(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  validateBody(updatePotSchema),
  potController.updatePot
);

/**
 * DELETE /api/pots/:id
 * Delete pot (returns money to balance)
 *
 * SECURITY:
 * - Rate limited
 * - ID validation
 */
router.delete(
  '/:id',
  writeLimiter,
  validateParams(idParamSchema),
  potController.deletePot
);

/**
 * POST /api/pots/:id/deposit
 * Add money to pot
 *
 * SECURITY:
 * - Rate limited (financial operation)
 * - Amount validation (positive, max $1M)
 */
router.post(
  '/:id/deposit',
  writeLimiter,
  validateParams(idParamSchema),
  validateBody(potTransactionSchema),
  potController.depositToPot
);

/**
 * POST /api/pots/:id/withdraw
 * Withdraw money from pot
 *
 * SECURITY:
 * - Rate limited (financial operation)
 * - Amount validation (positive, max $1M)
 */
router.post(
  '/:id/withdraw',
  writeLimiter,
  validateParams(idParamSchema),
  validateBody(potTransactionSchema),
  potController.withdrawFromPot
);

export default router;
