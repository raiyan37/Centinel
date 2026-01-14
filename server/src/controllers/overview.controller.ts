/**
 * Overview Controller
 * 
 * CONCEPT: Overview aggregates data from all resources.
 * 
 * Returns:
 * - Balance (current, income, expenses)
 * - Pots summary (total saved, count)
 * - Budgets summary
 * - Recent transactions
 * - Recurring bills summary
 */

import { Request, Response } from 'express';
import { User, Transaction, Budget, Pot } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { HTTP_STATUS } from '../constants/http.js';

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
// GET OVERVIEW
// =============================================================================

export const getOverview = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  // Get current month range for all calculations (using UTC)
  const { start: CURRENT_MONTH_START, end: CURRENT_MONTH_END } = getCurrentMonthRange();
  const currentDate = new Date().getUTCDate();
  
  // Get user for balance
  const user = await User.findById(userId).lean();
  
  // Calculate income and expenses from transactions
  const [incomeResult, expenseResult] = await Promise.all([
    // Sum of positive amounts (income)
    Transaction.aggregate([
      { $match: { userId, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    // Sum of negative amounts (expenses) - we'll take absolute value
    Transaction.aggregate([
      { $match: { userId, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  
  const income = incomeResult.length > 0 ? incomeResult[0].total : 0;
  const expenses = expenseResult.length > 0 ? Math.abs(expenseResult[0].total) : 0;
  
  // Get pots summary
  const pots = await Pot.find({ userId }).lean();
  const totalSaved = pots.reduce((sum, pot) => sum + pot.total, 0);
  
  // Get budgets with spent amounts
  const budgets = await Budget.find({ userId }).lean();
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const spentResult = await Transaction.aggregate([
        {
          $match: {
            userId,
            category: budget.category,
            amount: { $lt: 0 },
            date: { $gte: CURRENT_MONTH_START, $lte: CURRENT_MONTH_END },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      const spent = spentResult.length > 0 ? Math.abs(spentResult[0].total) : 0;
      return { ...budget, spent };
    })
  );
  
  // Get recent transactions (latest 5)
  const recentTransactions = await Transaction.find({ userId })
    .sort({ date: -1 })
    .limit(5)
    .lean();
  
  // Get recurring bills summary
  const recurringBills = await Transaction.find({ 
    userId, 
    recurring: true,
    amount: { $lt: 0 },  // Only expenses
  }).lean();
  
  // Deduplicate by name (one per vendor)
  const uniqueBills = Array.from(
    new Map(recurringBills.map((bill) => [bill.name, bill])).values()
  );
  
  // Calculate bills summary for current month
  const paidBills = uniqueBills.filter((bill) => {
    const billDate = new Date(bill.date);
    return billDate >= CURRENT_MONTH_START && billDate <= CURRENT_MONTH_END;
  });
  
  // Unpaid bills (not paid this month)
  const unpaidBills = uniqueBills.filter((bill) => {
    const billDate = new Date(bill.date);
    return !(billDate >= CURRENT_MONTH_START && billDate <= CURRENT_MONTH_END);
  });
  
  // Due soon = within 5 days from today (using UTC for consistency)
  const dueSoonBills = unpaidBills.filter((bill) => {
    const dayOfMonth = new Date(bill.date).getUTCDate();
    return dayOfMonth > currentDate && dayOfMonth <= currentDate + 5;
  });
  
  const totalBillsAmount = unpaidBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
  const paidBillsAmount = paidBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      balance: {
        current: user?.balance || 0,
        income,
        expenses,
      },
      pots: {
        totalSaved,
        items: pots.slice(0, 4),  // Show first 4 pots
      },
      budgets: {
        items: budgetsWithSpent,
      },
      transactions: {
        recent: recentTransactions,
      },
      recurringBills: {
        // Total shows only UNPAID bills
        total: unpaidBills.length,
        totalAmount: totalBillsAmount,
        paid: {
          count: paidBills.length,
          amount: paidBillsAmount,
        },
        upcoming: {
          count: unpaidBills.length,
          amount: totalBillsAmount,
        },
        dueSoon: {
          count: dueSoonBills.length,
          amount: dueSoonBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0),
        },
      },
    },
  });
});

// =============================================================================
// GET BALANCE
// =============================================================================

export const getBalance = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const user = await User.findById(userId).lean();
  
  // Calculate from transactions
  const [incomeResult, expenseResult] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Transaction.aggregate([
      { $match: { userId, amount: { $lt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);
  
  const income = incomeResult.length > 0 ? incomeResult[0].total : 0;
  const expenses = expenseResult.length > 0 ? Math.abs(expenseResult[0].total) : 0;
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      currentBalance: user?.balance || 0,
      income,
      expenses,
    },
  });
});
