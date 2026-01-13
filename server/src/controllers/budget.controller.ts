/**
 * Budget Controller
 *
 * SECURITY: Input validation handled by middleware.
 *
 * Key calculations:
 * - "spent": Sum of expenses in category for current month (August 2024)
 * - "latest 3 transactions": Most recent transactions in category (any month)
 */

import { Request, Response } from 'express';
import { Budget, Transaction } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';

// Note: Input validation is handled by middleware/validation.ts

// Current month for "spent" calculation (August 2024 per requirements)
const CURRENT_MONTH_START = new Date('2024-08-01T00:00:00.000Z');
const CURRENT_MONTH_END = new Date('2024-08-31T23:59:59.999Z');

// =============================================================================
// GET ALL BUDGETS
// =============================================================================

/**
 * Get Budgets with Spent Amount and Latest Transactions
 * 
 * For each budget, we calculate:
 * 1. spent: Total expenses in category for August 2024
 * 2. latestTransactions: 3 most recent transactions (any month)
 */
export const getBudgets = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  // Get all budgets for user
  const budgets = await Budget.find({ userId }).lean();
  
  // Enrich each budget with spent amount and latest transactions
  const enrichedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      // Calculate spent (sum of expenses in category for current month)
      const spentResult = await Transaction.aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            amount: { $lt: 0 },  // Only expenses (negative amounts)
            date: {
              $gte: CURRENT_MONTH_START,
              $lte: CURRENT_MONTH_END,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);
      
      // spent is absolute value (positive number)
      const spent = spentResult.length > 0 ? Math.abs(spentResult[0].total) : 0;
      
      // Get latest 3 transactions for this category (regardless of month)
      const latestTransactions = await Transaction.find({
        userId,
        category: budget.category,
        amount: { $lt: 0 },  // Only expenses
      })
        .sort({ date: -1 })
        .limit(3)
        .lean();
      
      return {
        ...budget,
        spent,
        remaining: budget.maximum - spent,
        latestTransactions,
      };
    })
  );
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { budgets: enrichedBudgets },
  });
});

// =============================================================================
// GET SINGLE BUDGET
// =============================================================================

export const getBudget = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const budget = await Budget.findOne({ _id: id, userId }).lean();
  
  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Calculate spent and get latest transactions (same as above)
  const spentResult = await Transaction.aggregate([
    {
      $match: {
        userId,
        category: budget.category,
        amount: { $lt: 0 },
        date: { $gte: CURRENT_MONTH_START, $lte: CURRENT_MONTH_END },
      },
    },
    {
      $group: { _id: null, total: { $sum: '$amount' } },
    },
  ]);
  
  const spent = spentResult.length > 0 ? Math.abs(spentResult[0].total) : 0;
  
  const latestTransactions = await Transaction.find({
    userId,
    category: budget.category,
    amount: { $lt: 0 },
  })
    .sort({ date: -1 })
    .limit(3)
    .lean();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      budget: {
        ...budget,
        spent,
        remaining: budget.maximum - spent,
        latestTransactions,
      },
    },
  });
});

// =============================================================================
// CREATE BUDGET
// =============================================================================

/**
 * Create Budget
 *
 * SECURITY: Input is pre-validated by middleware
 */
export const createBudget = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  // Input is pre-validated by middleware (category and theme are whitelisted)
  const { category, maximum, theme } = req.body;

  // Check if category already has a budget
  const existing = await Budget.findOne({ userId, category });
  if (existing) {
    throw new AppError(
      'Budget for this category already exists',
      HTTP_STATUS.CONFLICT,
      'DUPLICATE_ERROR'
    );
  }
  
  // Create budget
  const budget = await Budget.create({
    userId,
    category,
    maximum,
    theme,
  });
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Budget created successfully',
    data: { budget },
  });
});

// =============================================================================
// UPDATE BUDGET
// =============================================================================

export const updateBudget = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { category, maximum, theme } = req.body;
  
  const budget = await Budget.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(category && { category }),
      ...(maximum && { maximum }),
      ...(theme && { theme }),
    },
    { new: true, runValidators: true }
  );
  
  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Budget updated successfully',
    data: { budget },
  });
});

// =============================================================================
// DELETE BUDGET
// =============================================================================

export const deleteBudget = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const budget = await Budget.findOneAndDelete({ _id: id, userId });
  
  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Budget deleted successfully',
  });
});
