/**
 * Transaction Controller
 *
 * SECURITY: Input validation is handled by middleware.
 * Controllers focus on business logic with pre-validated data.
 *
 * Pattern:
 * 1. Receive validated request
 * 2. Execute business logic
 * 3. Send response
 */

import { Request, Response } from 'express';
import { Transaction } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';
import { CATEGORIES } from '../constants/categories.js';
import { escapeRegex } from '../middleware/validation.js';

// =============================================================================
// TYPES
// =============================================================================

// Sort options mapping (whitelisted values only)
const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  Latest: { date: -1 },
  Oldest: { date: 1 },
  'A to Z': { name: 1 },
  'Z to A': { name: -1 },
  Highest: { amount: -1 },
  Lowest: { amount: 1 },
};

/**
 * Get current month date range in UTC
 * Returns start and end of current month dynamically
 * Uses UTC to ensure consistent date handling across timezones
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
// GET ALL TRANSACTIONS
// =============================================================================

/**
 * Get Transactions (Paginated)
 *
 * GET /api/transactions
 *
 * SECURITY: Query params are pre-validated by middleware
 * - page/limit are bounded to safe ranges
 * - search is sanitized and regex-escaped
 * - sort is whitelisted
 * - category is whitelisted
 */
export const getTransactions = catchErrors(async (req: Request, res: Response) => {
  // #region agent log
  console.log(`[TRANSACTIONS DEBUG] getTransactions called, userId: ${req.userId}, query:`, req.query);
  // #endregion
  const userId = req.userId;

  // Query params are pre-validated by middleware and stored in validatedQuery
  const query = (req as Request & { validatedQuery: unknown }).validatedQuery as {
    page: number;
    limit: number;
    search?: string;
    sort: string;
    filter?: string;
    category?: string;
  };
  const { page, limit, search, sort, filter, category } = query;

  // Build query filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryFilter: any = { userId };

  // Add search filter with escaped regex (SECURITY: prevents ReDoS)
  if (search) {
    queryFilter.name = { $regex: escapeRegex(search), $options: 'i' };
  }

  // Add category filter (pre-validated by middleware)
  const categoryValue = filter || category;
  if (
    categoryValue &&
    categoryValue !== 'All Transactions' &&
    CATEGORIES.includes(categoryValue as (typeof CATEGORIES)[number])
  ) {
    queryFilter.category = categoryValue;
  }

  // Get sort configuration (sort value is pre-validated)
  const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS['Latest'];

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Execute queries in parallel for better performance
  const [transactions, total] = await Promise.all([
    Transaction.find(queryFilter)
      .sort(sortConfig)
      .skip(skip)
      .limit(limit)
      .lean(), // .lean() returns plain JS objects (faster)
    Transaction.countDocuments(queryFilter),
  ]);

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  // Send response
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      transactions,
      total,
      page,
      pages,
      limit,
    },
  });
});

// =============================================================================
// GET SINGLE TRANSACTION
// =============================================================================

/**
 * Get Single Transaction
 * 
 * GET /api/transactions/:id
 */
export const getTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const transaction = await Transaction.findOne({ _id: id, userId }).lean();
  
  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { transaction },
  });
});

// =============================================================================
// CREATE TRANSACTION
// =============================================================================

/**
 * Create Transaction
 *
 * POST /api/transactions
 *
 * SECURITY: Input is pre-validated and sanitized by middleware
 */
export const createTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  // Body is pre-validated by middleware - safe to use directly
  const { name, amount, category, date, avatar, recurring, isTemplate } = req.body;

  // Create transaction with validated data
  const transaction = await Transaction.create({
    userId,
    name,
    amount,
    category,
    date: new Date(date),
    avatar: avatar || '/assets/images/avatars/default.jpg',
    recurring: recurring || false,
    isTemplate: isTemplate || false, // Bill templates don't affect balance
  });
  
  // Update user balance (only for transactions in current month)
  // This ensures historical/future transactions don't immediately affect current balance
  // IMPORTANT: Templates (bill definitions) do NOT affect balance - only actual payments do
  const transactionDate = new Date(date);
  const { start: currentMonthStart, end: currentMonthEnd } = getCurrentMonthRange();
  
  if (!isTemplate && transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd) {
    const { User } = await import('../models/index.js');
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: amount }, // Positive for income, negative for expenses
    });
  }
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction },
  });
});

// =============================================================================
// UPDATE TRANSACTION
// =============================================================================

/**
 * Update Transaction
 * 
 * PUT /api/transactions/:id
 */
export const updateTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, amount, category, date, avatar, recurring } = req.body;
  
  // Get original transaction first
  const oldTransaction = await Transaction.findOne({ _id: id, userId });
  
  if (!oldTransaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Find and update
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(name && { name }),
      ...(amount !== undefined && { amount }),
      ...(category && { category }),
      ...(date && { date: new Date(date) }),
      ...(avatar && { avatar }),
      ...(recurring !== undefined && { recurring }),
    },
    { new: true, runValidators: true }
  );
  
  // Update balance if amount or date changed and affects current month
  const { start: currentMonthStart, end: currentMonthEnd } = getCurrentMonthRange();
  
  const oldDate = oldTransaction.date;
  const newDate = transaction!.date;
  const oldAmount = oldTransaction.amount;
  const newAmount = transaction!.amount;
  
  const oldInCurrentMonth = oldDate >= currentMonthStart && oldDate <= currentMonthEnd;
  const newInCurrentMonth = newDate >= currentMonthStart && newDate <= currentMonthEnd;
  
  if (oldInCurrentMonth || newInCurrentMonth) {
    const { User } = await import('../models/index.js');
    let balanceChange = 0;
    
    // If old was in current month, reverse it
    if (oldInCurrentMonth) {
      balanceChange -= oldAmount;
    }
    
    // If new is in current month, apply it
    if (newInCurrentMonth) {
      balanceChange += newAmount;
    }
    
    if (balanceChange !== 0) {
      await User.findByIdAndUpdate(userId, {
        $inc: { balance: balanceChange },
      });
    }
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Transaction updated successfully',
    data: { transaction },
  });
});

// =============================================================================
// DELETE TRANSACTION
// =============================================================================

/**
 * Delete Transaction
 * 
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const transaction = await Transaction.findOneAndDelete({ _id: id, userId });
  
  if (!transaction) {
    throw new AppError('Transaction not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Update user balance (reverse the transaction if it was in current month)
  const transactionDate = transaction.date;
  const { start: currentMonthStart, end: currentMonthEnd } = getCurrentMonthRange();
  
  if (transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd) {
    const { User } = await import('../models/index.js');
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -transaction.amount }, // Reverse the transaction
    });
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Transaction deleted successfully',
  });
});
