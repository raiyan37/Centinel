/**
 * Recurring Bill Routes
 *
 * Routes for managing recurring bill templates.
 * Bills are separate from transactions - they only track what you owe.
 */

import { Router } from 'express';
import {
  getRecurringBills,
  createRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
  payRecurringBill,
} from '../controllers/recurringBill.controller.js';

const router = Router();

// GET /api/recurring-bills - Get all recurring bills with status
router.get('/', getRecurringBills);

// POST /api/recurring-bills - Create a new recurring bill
router.post('/', createRecurringBill);

// PUT /api/recurring-bills/:id - Update a recurring bill
router.put('/:id', updateRecurringBill);

// DELETE /api/recurring-bills/:id - Delete a recurring bill
router.delete('/:id', deleteRecurringBill);

// POST /api/recurring-bills/:id/pay - Pay a bill (creates transaction)
router.post('/:id/pay', payRecurringBill);

export default router;
