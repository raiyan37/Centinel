/**
 * Recurring Bill Controller
 *
 * CONCEPT: Manages recurring bill templates.
 * Bills are just records - they do NOT create transactions.
 * Transactions are only created when a bill is PAID.
 */

import { Request, Response } from 'express';
import { RecurringBill, Transaction } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';

/**
 * Get current month date range in UTC
 */
function getCurrentMonthRange() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  
  return { start, end };
}

// =============================================================================
// GET ALL RECURRING BILLS
// =============================================================================

/**
 * Get all recurring bills with payment status
 * 
 * For each bill, we check if it's been paid this month
 * by looking for a matching transaction.
 */
export const getRecurringBills = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const { start: CURRENT_MONTH_START, end: CURRENT_MONTH_END } = getCurrentMonthRange();
  const currentDate = new Date().getUTCDate();
  
  // Get all recurring bills for user
  const bills = await RecurringBill.find({ userId }).lean();
  
  // Get all payments made this month (transactions matching bill names)
  const billNames = bills.map(b => b.name);
  const paymentsThisMonth = await Transaction.find({
    userId,
    name: { $in: billNames },
    recurring: true,
    date: { $gte: CURRENT_MONTH_START, $lte: CURRENT_MONTH_END },
  }).lean();
  
  // Create a set of paid bill names
  const paidBillNames = new Set(paymentsThisMonth.map(p => p.name));
  
  // Enrich bills with status
  const enrichedBills = bills.map(bill => {
    const isPaid = paidBillNames.has(bill.name);
    
    let status: 'paid' | 'upcoming' | 'due-soon';
    if (isPaid) {
      status = 'paid';
    } else if (bill.dueDay > currentDate && bill.dueDay <= currentDate + 5) {
      status = 'due-soon';
    } else {
      status = 'upcoming';
    }
    
    return {
      ...bill,
      status,
    };
  });
  
  // Calculate summary
  const paidBills = enrichedBills.filter(b => b.status === 'paid');
  const unpaidBills = enrichedBills.filter(b => b.status !== 'paid');
  const dueSoonBills = enrichedBills.filter(b => b.status === 'due-soon');
  
  const summary = {
    total: unpaidBills.length,
    totalAmount: unpaidBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    paid: {
      count: paidBills.length,
      amount: paidBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
    upcoming: {
      count: unpaidBills.length,
      amount: unpaidBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
    dueSoon: {
      count: dueSoonBills.length,
      amount: dueSoonBills.reduce((sum, b) => sum + Math.abs(b.amount), 0),
    },
  };
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      bills: enrichedBills,
      summary,
    },
  });
});

// =============================================================================
// CREATE RECURRING BILL
// =============================================================================

/**
 * Create a new recurring bill
 * 
 * This ONLY creates a bill record - NO transaction is created.
 * Transactions are created when the bill is paid.
 */
export const createRecurringBill = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, amount, category, dueDay, avatar } = req.body;
  
  // Validate required fields
  if (!name || !amount || !category || !dueDay) {
    throw new AppError(
      'Missing required fields: name, amount, category, dueDay',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }
  
  // Create bill (NOT a transaction)
  const bill = await RecurringBill.create({
    userId,
    name,
    amount: -Math.abs(amount), // Ensure negative (expense)
    category,
    dueDay,
    avatar: avatar || '/assets/images/avatars/default.jpg',
  });
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Recurring bill created successfully',
    data: { bill },
  });
});

// =============================================================================
// UPDATE RECURRING BILL
// =============================================================================

export const updateRecurringBill = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, amount, category, dueDay, avatar } = req.body;
  
  const bill = await RecurringBill.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(name && { name }),
      ...(amount !== undefined && { amount: -Math.abs(amount) }),
      ...(category && { category }),
      ...(dueDay && { dueDay }),
      ...(avatar && { avatar }),
    },
    { new: true, runValidators: true }
  );
  
  if (!bill) {
    throw new AppError('Recurring bill not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Recurring bill updated successfully',
    data: { bill },
  });
});

// =============================================================================
// DELETE RECURRING BILL
// =============================================================================

export const deleteRecurringBill = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const bill = await RecurringBill.findOneAndDelete({ _id: id, userId });
  
  if (!bill) {
    throw new AppError('Recurring bill not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Recurring bill deleted successfully',
  });
});

// =============================================================================
// PAY BILL (Creates Transaction)
// =============================================================================

/**
 * Pay a recurring bill
 * 
 * This is when a transaction is ACTUALLY created.
 * The transaction deducts from the user's balance.
 */
export const payRecurringBill = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { paymentDate } = req.body;
  
  // Find the bill
  const bill = await RecurringBill.findOne({ _id: id, userId });
  
  if (!bill) {
    throw new AppError('Recurring bill not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Create transaction for this payment
  const transaction = await Transaction.create({
    userId,
    name: bill.name,
    amount: bill.amount, // Already negative
    category: bill.category,
    date: paymentDate ? new Date(paymentDate) : new Date(),
    avatar: bill.avatar,
    recurring: true,
  });
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Bill paid successfully',
    data: { transaction },
  });
});
