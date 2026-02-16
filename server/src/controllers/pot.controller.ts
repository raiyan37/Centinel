/**
 * Pot Controller
 *
 * SECURITY: Input validation handled by middleware.
 *
 * IMPORTANT - Balance interactions:
 * - Deposit: Takes money FROM balance, adds to pot
 * - Withdraw: Takes money FROM pot, adds to balance
 * - Delete: Returns ALL pot money back to balance
 */

import { Request, Response } from 'express';
import { Pot, User } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/http.js';

// Note: Input validation is handled by middleware/validation.ts

// =============================================================================
// GET ALL POTS
// =============================================================================

export const getPots = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  
  const pots = await Pot.find({ userId }).lean();
  
  // Calculate percentage for each pot
  const enrichedPots = pots.map((pot) => ({
    ...pot,
    percentage: pot.target > 0 ? (pot.total / pot.target) * 100 : 0,
    remaining: pot.target - pot.total,
  }));
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { pots: enrichedPots },
  });
});

// =============================================================================
// GET SINGLE POT
// =============================================================================

export const getPot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const pot = await Pot.findOne({ _id: id, userId }).lean();
  
  if (!pot) {
    throw new AppError('Pot not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      pot: {
        ...pot,
        percentage: pot.target > 0 ? (pot.total / pot.target) * 100 : 0,
        remaining: pot.target - pot.total,
      },
    },
  });
});

// =============================================================================
// CREATE POT
// =============================================================================

/**
 * Create Pot
 *
 * SECURITY: Input is pre-validated by middleware
 */
export const createPot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  // Input is pre-validated by middleware (name sanitized, theme whitelisted)
  const { name, target, theme } = req.body;

  // Create pot (starts with 0 total)
  const pot = await Pot.create({
    userId,
    name,
    target,
    theme,
    total: 0,
  });
  
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Pot created successfully',
    data: { pot },
  });
});

// =============================================================================
// UPDATE POT
// =============================================================================

export const updatePot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { name, target, theme } = req.body;
  
  const pot = await Pot.findOneAndUpdate(
    { _id: id, userId },
    {
      ...(name && { name }),
      ...(target && { target }),
      ...(theme && { theme }),
    },
    { new: true, runValidators: true }
  );
  
  if (!pot) {
    throw new AppError('Pot not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Pot updated successfully',
    data: { pot },
  });
});

// =============================================================================
// DELETE POT
// =============================================================================

/**
 * Delete Pot
 * 
 * IMPORTANT: When deleting a pot, all money in it goes back to the balance!
 */
export const deletePot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  
  const pot = await Pot.findOne({ _id: id, userId });
  
  if (!pot) {
    throw new AppError('Pot not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Return pot money to user's balance
  if (pot.total > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: pot.total },  // Add pot total to balance
    });
  }
  
  // Delete the pot
  await pot.deleteOne();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Pot deleted and money returned to balance',
  });
});

// =============================================================================
// DEPOSIT TO POT
// =============================================================================

/**
 * Deposit to Pot
 * 
 * Takes money FROM balance and adds it TO the pot.
 * Balance decreases, pot total increases.
 */
export const depositToPot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  const { amount } = req.body;
  
  // Validation
  if (!amount || amount <= 0) {
    throw new AppError(
      'Amount must be a positive number',
      HTTP_STATUS.BAD_REQUEST,
      'VALIDATION_ERROR'
    );
  }
  
  // Check user has enough balance
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  if (user.balance < amount) {
    throw new AppError(
      'Insufficient balance',
      HTTP_STATUS.BAD_REQUEST,
      'INSUFFICIENT_BALANCE'
    );
  }
  
  // Find pot
  const pot = await Pot.findOne({ _id: id, userId });
  if (!pot) {
    throw new AppError('Pot not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Update pot total
  pot.total += amount;
  await pot.save();
  
  // Decrease user balance
  user.balance -= amount;
  await user.save();
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Deposit successful',
    data: {
      pot,
      newBalance: user.balance,
    },
  });
});

// =============================================================================
// WITHDRAW FROM POT
// =============================================================================

/**
 * Withdraw from Pot
 *
 * Takes money FROM pot and adds it TO the balance.
 * Pot total decreases, balance increases.
 *
 * SECURITY: Amount is pre-validated by middleware (positive, max $1M)
 */
export const withdrawFromPot = catchErrors(async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;
  // Amount is pre-validated by middleware
  const { amount } = req.body;

  // Find pot
  const pot = await Pot.findOne({ _id: id, userId });
  if (!pot) {
    throw new AppError('Pot not found', HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
  }
  
  // Check pot has enough money
  if (pot.total < amount) {
    throw new AppError(
      'Insufficient pot balance',
      HTTP_STATUS.BAD_REQUEST,
      'INSUFFICIENT_POT_BALANCE'
    );
  }
  
  // Update pot total
  pot.total -= amount;
  await pot.save();
  
  // Increase user balance
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { balance: amount } },
    { new: true }
  );
  
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Withdrawal successful',
    data: {
      pot,
      newBalance: user?.balance || 0,
    },
  });
});
