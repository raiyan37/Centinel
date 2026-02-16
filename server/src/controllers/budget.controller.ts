/**
 * Budget Controller
 *
 * SECURITY: Input validation handled by middleware.
 *
 * Key calculations:
 * - "spent": Sum of expenses in category for current month (dynamic)
 * - "latest 3 transactions": Most recent transactions in category (any month)
 */

import { Request, Response } from 'express';
import { Budget, Transaction } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';

// Note: Input validation is handled by middleware/validation.ts

/**
 * Get current month date range in UTC
 * Returns start and end of current month dynamically
 */
function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  
  // Start of month: 1st day at midnight UTC
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  // End of month: last day at 23:59:59.999 UTC
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  
  return { start, end };
}

// =============================================================================
// GET ALL BUDGETS
// =============================================================================

/**
 * Get Budgets with Spent Amount and Latest Transactions
 * 
 * For each budget, we calculate:
 * 1. spent: Total expenses in category for current month
 * 2. latestTransactions: 3 most recent transactions (any month)
 */
export const getBudgets = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  // Get current month range (dynamic)
  const { start: CURRENT_MONTH_START, end: CURRENT_MONTH_END } = getCurrentMonthRange();
  
  // Get all budgets for user
  const budgets = await Budget.find({ userId }).lean();
  
  // Enrich each budget with spent amount and latest transactions
  const enrichedBudgets = await Promise.all(
    budgets.map(async (budget) => {
      // Calculate spent (sum of expenses in category for current month)
      // Exclude template transactions (bill templates that haven't been paid)
      const spentResult = await Transaction.aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            amount: { $lt: 0 },  // Only expenses (negative amounts)
            isTemplate: { $ne: true },  // Exclude templates
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
      // Exclude templates
      const latestTransactions = await Transaction.find({
        userId,
        category: budget.category,
        amount: { $lt: 0 },  // Only expenses
        isTemplate: { $ne: true },  // Exclude templates
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
  
  // Get current month range (dynamic)
  const { start: CURRENT_MONTH_START, end: CURRENT_MONTH_END } = getCurrentMonthRange();
  
  const budget = await Budget.findOne({ _id: id, userId }).lean();
  
  if (!budget) {
    throw new AppError('Budget not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Calculate spent and get latest transactions (same as above)
  // Exclude template transactions
  const spentResult = await Transaction.aggregate([
    {
      $match: {
        userId,
        category: budget.category,
        amount: { $lt: 0 },
        isTemplate: { $ne: true },  // Exclude templates
        date: { $gte: CURRENT_MONTH_START, $lte: CURRENT_MONTH_END },
      },
    },
    {
      $group: { _id: null, total: { $sum: '$amount' } },
    },
  ]);
  
  const spent = spentResult.length > 0 ? Math.abs(spentResult[0].total) : 0;
  
  // Exclude templates from latest transactions
  const latestTransactions = await Transaction.find({
    userId,
    category: budget.category,
    amount: { $lt: 0 },
    isTemplate: { $ne: true },  // Exclude templates
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
